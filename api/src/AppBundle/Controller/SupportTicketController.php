<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\Project;
use AppBundle\Entity\SupportTicket;
use AppBundle\Controller\RestServiceController;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Controller\Annotations;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Event\GetResponseUserEvent;
use FOS\UserBundle\FOSUserEvents;
use FOS\UserBundle\Event\FormEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @RouteResource("project", pluralize=false)
 */
class SupportTicketController extends RestServiceController
{
    /**
     * @Get("/project/{project}/ticket")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * 
     * NOTE: NOT REALLY USEFUL BECAUS WHEN WE GET A PROJECT WE GET ALL HIS SUPPORT TICKETS...
     */
    public function getAction(Project $project)
    {
        if ($this->getUser()->isAdmin()) {
            return $project->getSupportTickets();
        }
        if (!$this->getUser()->getProjects()->contains($project)) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        return $project->getSupportTickets();
    }

    /**
     * @Post("/project/{project}/ticket")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * 
     */
    public function postAction(Request $request, Project $project)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin && !$isUserProject) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        $data = new SupportTicket;
        $description = $request->get('description');
        $status = $request->get('status');

        if (empty($description)) {
            return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
        } 
        $data->setDescription($description);
        if (empty($status)) {
            $data->setStatus('Backlog');
        } else {
            $data->setStatus($status);
        }
        $data->setProject($project);
        $em = $this->getDoctrine()->getManager();
        $em->persist($data);
        $em->flush();

        $this->notify('Support ticket submitted on project n°'.$project->getId().', project name :'.$project->getName());

        $subject = "[RWSupport] Support ticket created for project: " . $project->getName();
        $content = "Hi Rhys, a support ticket has been created by user: " . $this->getUser() . 
        " for project: " . $project->getName() . "\n Details: ".$description;
        foreach ($this->getParameter('admin_mails') as $mailAddress) {
            mail($mailAddress,$subject,$content);
          }
    

        return new View("Ticket Added Successfully", Response::HTTP_OK);
    }

    /**
     * @Put("/project/{project}/ticket/{ticket}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("ticket", class="AppBundle:SupportTicket")
     * 
     */
    public function putAction(Request $request, Project $project, SupportTicket $ticket)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin && !$isUserProject) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $ticket)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $description = $request->get('description');
        $status = $request->get('status');
        if ($description) {
            $ticket->setDescription($description);
        }
        if ($status) {
            $ticket->setStatus($status);
        }
        $ticket->setModified(new \DateTime());

        $em = $this->getDoctrine()->getManager();
        $em->persist($ticket);
        $em->flush();

        $this->notify('Ticket n°'.$ticket->getId().' from project: '.$project->getName().', modified');

        return new View("Ticket Modified Successfully", Response::HTTP_OK);
    }


    /**
     * @Delete("/project/{project}/ticket/{ticket}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("ticket", class="AppBundle:SupportTicket")
     * 
     */
    public function deleteAction(Project $project, SupportTicket $ticket)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $ticket)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        if ($project->getFileTicketId() === $ticket->getId()) {
            return new View("You can't delete the file ticket", Response::HTTP_FORBIDDEN);
        }

        $em = $this->getDoctrine()->getManager();
        $this->notify('Ticket n°'.$ticket->getId().' from project: '.$project->getName().', deleted');
        $em->remove($ticket);
        $em->flush();
        return new View("Ticket deleted successfully", Response::HTTP_OK);
    }

    private function _isInconsistent(Project $project, SupportTicket $ticket)
    {
        return !$project->getSupportTickets()->contains($ticket);
    }

    /**
     * @Post("/project/{project}/ticket/{ticket}/file")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("ticket", class="AppBundle:SupportTicket")
     * 
     */
    public function postFileAction(Request $request, Project $project, SupportTicket $ticket)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin && !$isUserProject) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $ticket)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        // Handle file here
        $file = $request->files->get('upload');
        $status = array('status' => "success","fileUploaded" => false);

        // If a file was uploaded
        if(!is_null($file)){
            $isAccepted = in_array(
                $file->getClientOriginalExtension(),
                array(
                    "gif",
                    "png", 
                    "jpg", 
                    "bmp", 
                    "txt", 
                    "doc", 
                    "xls", 
                    "csv", 
                    "pdf", 
                    "zip", 
                    "psd", 
                    "ai", 
                    "mp3",
                    "mp4", 
                    "indd"
                )
            );
            if(!$isAccepted) {
                return new View("not allowed", Response::HTTP_FORBIDDEN);
            }
            $path = "./../uploads/";
            $file->move($path, $file->getClientOriginalName()); // move the file to a path
            $status = array('status' => "success","fileUploaded" => true);

        }

        // Handle file array for ticket here
        $files = $ticket->getFiles();
        $files = ($files === null) ? array() : $files;
        if (!in_array($file->getClientOriginalName(), $files)) {
            array_push($files, $file->getClientOriginalName());
            $ticket->setFiles($files);
            $ticket->setModified(new \DateTime());
            $em = $this->getDoctrine()->getManager();
            $em->persist($ticket);
            $em->flush();
        }

        $this->notify('File added on support ticket n°'.$ticket->getId().' from project: '.$project->getName());

        $subject = "[RWSupport] File uploaded on project: " . $project->getName();
        $content = "Hi Rhys, file has been uploaded by user: " . $this->getUser() . 
        " for project: " . $project->getName() . "\nTicket details: ".$ticket->getDescription() .
        "\nFile name: " . $file->getClientOriginalName();
        foreach ($this->getParameter('admin_mails') as $mailAddress) {
            mail($mailAddress,$subject,$content);
          }    

        return $status;
    }

    /**
     * @Delete("/project/{project}/ticket/{ticket}/file/{path}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("ticket", class="AppBundle:SupportTicket")
     * 
     */
    public function deleteFileAction(Request $request, Project $project, SupportTicket $ticket)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin && !$isUserProject) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $ticket)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        // Handle file array for ticket here
        $files = $ticket->getFiles();
        $files = ($files === null) ? array() : $files;
        $newFiles = array();
        foreach ($files as $file) {
            if ($file !== $request->get('path')) {
                array_push($newFiles, $file);
            }
        }
        $ticket->setFiles($newFiles);

        $em = $this->getDoctrine()->getManager();
        $em->persist($ticket);
        $em->flush();

        $this->notify('File deleted on support ticket n°'.$ticket->getId().' from project: '.$project->getName());

        $path = './../uploads/'.$request->get('path');
        if (file_exists($path)) {
            unlink($path);
            return array('status' => 'success');
        }
        return array('status' => 'failed');
    }

    /**
     * @Get("/project/{project}/ticket/{ticket}/file/{path}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("ticket", class="AppBundle:SupportTicket")
     * 
     */
    public function getFileAction(Request $request, Project $project, SupportTicket $ticket)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin && !$isUserProject) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $ticket)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $path = './../uploads/'.$request->get('path');
        if (file_exists($path)) {
            return new BinaryFileResponse($path);
        }
        return array('status' => 'failed');
    }
}