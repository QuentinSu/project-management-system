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
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @RouteResource("project", pluralize=false)
 */
class ProjectController extends RestServiceController
{
    /**
     * @Get("/project")
     * 
     */
    public function getAction()
    {

      if ($this->getUser()->isAdmin()) {
        return $this->getDoctrine()->getRepository('AppBundle:Project')->findAll();
      }
      return $this->getUser()->getProjects();   
    }

     /**
     * @Get("/project/{id}")
     */
    public function idAction($id)
    {
      $singleresult = $this->getDoctrine()->getRepository('AppBundle:Project')->find($id);
      if ($singleresult === null) {
        return new View("project not found", Response::HTTP_NOT_FOUND);
      } 
      if (!$this->getUser()->getProjects()->contains($singleresult) && !$this->getUser()->isAdmin()) {
        return new View("not allowed", Response::HTTP_FORBIDDEN);
      }
      return $singleresult;
    }

    /**
     * @Post("/project")
     */
    public function postAction(Request $request)
    {
      // Admin restriction for this view
      if (!$this->getUser()->isAdmin()) {
        return new View("not allowed", Response::HTTP_FORBIDDEN);
      }
      
      $project = new Project;
      $name = $request->get('name');
      $type = $request->get('type');
      $status = $request->get('status');
      $golivedate = $request->get('golivedate');

      // TODO: DO ENUMS VERIF HERE

    if( empty($name) || empty($type) || empty($status) )
    {
      return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
    } 
      $project->setName($name);
      $project->setType($type);
      $project->setStatus($status);
      $project->setGoLiveDate($golivedate);
      $em = $this->getDoctrine()->getManager();
      $em->persist($project);

      // The default support ticket
      $ticket = new SupportTicket;
      $ticket->setDescription('This support ticket only contains the files added by the customer');
      $ticket->setStatus('Permanent');
      $ticket->setProject($project);
      $em->persist($ticket);
      $em->flush();

      $project->setFileTicketId($ticket->getId());
      $em->flush();

      $this->notify('Project created with name: '.$name); 

      return new View("Project Added Successfully", Response::HTTP_OK);
    }

    /** 
    * @Put("/project/{id}")
    */
    public function updateAction($id,Request $request)
    { 

      // Admin restriction for this view
      if (!$this->getUser()->isAdmin()) {
        return new View("not allowed", Response::HTTP_FORBIDDEN);
      }
      
      $data = new Project;
      $name = $request->get('name');
      $type = $request->get('type');
      $status = $request->get('status');
      $golivedate = $request->get('golivedate');
      $dbm = $this->getDoctrine()->getManager();
      $project = $this->getDoctrine()->getRepository('AppBundle:Project')->find($id);
      if (empty($project)) {
        return new View("project not found", Response::HTTP_NOT_FOUND);
      } 

      !empty($name) ? $project->setName($name) : 0;
      !empty($type) ? $project->setType($type) : 0;
      !empty($status) ? $project->setStatus($status) : 0;
      !empty($golivedate) ? $project->setGoLiveDate($golivedate) : date("Y-m-d");

      $dbm->flush();

      $this->notify('Project n°'.$project->getId().', name: '.'"'.$name.'"'.' modified');    

      return new View("Project Updated Successfully", Response::HTTP_OK);;
    }

    /**
     * @Delete("/project/{id}")
     */
    public function deleteAction($id)
    {
      // Admin restriction for this view
      if (!$this->getUser()->isAdmin()) {
        return new View("not allowed", Response::HTTP_FORBIDDEN);
      }
      
      $data = new Project;
      $dbm = $this->getDoctrine()->getManager();
      $project = $this->getDoctrine()->getRepository('AppBundle:Project')->find($id);
    if (empty($project)) {
      return new View("project not found", Response::HTTP_NOT_FOUND);
    }
    else {
      $this->notify('Project n°'.$project->getId().', name: '.'"'.$project->getName().'"'.' deleted'); 
      $dbm->remove($project);
      $dbm->flush();
    }
      return new View("deleted successfully", Response::HTTP_OK);
    }

    /**
     * @Post("/project/{project}/notify")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     */
    public function postNotificationAction(Project $project, Request $request) {
      
      // Admin restriction for this view
      if (!$this->getUser()->isAdmin()) {
        return new View("not allowed", Response::HTTP_FORBIDDEN);
      }

      $subject = "Rhys Welsh Support : project updated";
      $content = "Hi, this is an automatic message to notify you that the project: ". $project->getName();
      $content .= " has been modified. Please visit https://clients.rhyswelsh.com/";
      $content .= "\n\nDetails: ".$request->get("details");

      $users = $project->getUsers();

      foreach ($users as $userWithMail) {
          mail($userWithMail->getEmail(),$subject,$content);
      }

      return $users;
    }

    /**
     * @Post("/project/{project}/file")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     */
    public function postFileAction(Project $project, Request $request) {
      $isAdmin  = $this->getUser()->isAdmin();
      $isUserProject = $this->getUser()->getProjects()->contains($project);
      if (!$isAdmin && !$isUserProject) {
          return new View("not allowed", Response::HTTP_FORBIDDEN);
      }

      // Handle file here
      $file = $request->files->get('upload');
      $status = array('status' => "success","fileUploaded" => false);

      // If a file was uploaded
      if(!is_null($file)){
          $path = "./../uploads/";
          $file->move($path, $file->getClientOriginalName()); // move the file to a path
          $status = array('status' => "success","fileUploaded" => true);

      }

      // Get the file ticket associated
      $dbm = $this->getDoctrine()->getManager();
      $ticket = $this->getDoctrine()->getRepository('AppBundle:SupportTicket')->find($project->getFileTicketId());

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

      $this->notify('File added on project n°'.$project->getId().', name: '.'"'.$project->getName().'"'); 

      $subject = "[RWSupport] File uploaded on project: " . $project->getName();
      $content = "Hi Rhys, file has been uploaded by user: " . $this->getUser() . 
      " for project: " . $project->getName() . "\nTicket details: ".$ticket->getDescription();
      foreach ($this->getParameter('admin_mails') as $mailAddress) {
        mail($mailAddress,$subject,$content);
      }

      return $status;
    }
}
