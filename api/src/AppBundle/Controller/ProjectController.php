<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\Project;
use AppBundle\Entity\SupportTicket;
use AppBundle\Entity\Reminder;
use AppBundle\Controller\RestServiceController;
use AppBundle\Controller\ReminderController;
use FOS\RestBundle\View\View;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\BufferedOutput;
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

use AppBundle\Command\CommandMail;

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
     * @Get("/project/{id}/users")
     */
    public function idActionUsers($id)
    {
      $singleresult = $this->getDoctrine()->getRepository('AppBundle:Project')->find($id);
      
      return $singleresult->getUsers();
    }

    public function postAutoReminder6M(Project $project) {
      //get project, get golive date, calcul date auto 3m and 6m

      $golive=$project->getGoLiveDate();
      $sixMToGo=date("Y-m-d", strtotime($golive. '-6 month'));

      $reminder6M = new Reminder;
      $reminder6M->setProject($project);
      $reminder6M->setStatus('notok');
      $reminder6M->setType('6m');
      $reminder6M->setDeadline($sixMToGo);

      $em = $this->getDoctrine()->getManager();
      $em->persist($reminder6M);

      $em->flush();

      $this->notify('Reminder auto 6M created for project'); 

      return new View("Reminder auto 6M Added Successfully", Response::HTTP_OK);
  }
    

    public function postAutoReminder3M(Project $project) {
      //get project, get golive date, calcul date auto 3m and 6m

      $golive=$project->getGoLiveDate();
      $threeMToGo=date("Y-m-d", strtotime($golive. '-3 month'));

      $reminder3M = new Reminder;
      $reminder3M->setProject($project);
      $reminder3M->setStatus('notok');
      $reminder3M->setType('3m');
      $reminder3M->setDeadline($threeMToGo);

      $em = $this->getDoctrine()->getManager();
      $em->persist($reminder3M);

      $em->flush();

      $this->notify('Reminder auto 3M created for project'); 

      return new View("Reminder auto 3M Added Successfully", Response::HTTP_OK);
  }

    /**
     * @Post("/project")
     */
    public function postAction(Request $request)
    {

      $application = new Application($this->get('kernel'));
      $application->setAutoExit(false);//exit after run
      $input = new ArrayInput([
          'command' => 'app:send-daily-mail'
      ]);
      $output = new BufferedOutput();
      $runCode = $application->run($input, $output);

      $content = $output->fetch();
      return new Response($content);
      // Admin restriction for this view
      if (!$this->getUser()->isAdmin()) {
        return new View("not allowed", Response::HTTP_FORBIDDEN);
      }
      
      $project = new Project;
      $name = $request->get('name');
      $type = $request->get('type');
      $status = $request->get('status');
      $goLiveDate = $request->get('goLiveDate');

      // TODO: DO ENUMS VERIF HERE

    if( empty($name) || empty($type) || empty($status) )
    {
      return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
    }
    if (empty($goLiveDate)) {
      $goLiveDate = date('Y-m-d', strtotime('+1 year'));
    }
      $project->setName($name);
      $project->setType($type);
      $project->setStatus($status);
      $project->setGoLiveDate($goLiveDate);
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

      $this->postAutoReminder3M($project);
      $this->postAutoReminder6M($project);

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
      $goLiveDate = $request->get('goLiveDate');
      $dbm = $this->getDoctrine()->getManager();
      $project = $this->getDoctrine()->getRepository('AppBundle:Project')->find($id);
      if (empty($project)) {
        return new View("project not found", Response::HTTP_NOT_FOUND);
      }

      !empty($name) ? $project->setName($name) : 0;
      !empty($type) ? $project->setType($type) : 0;
      !empty($status) ? $project->setStatus($status) : 0;
      !empty($goLiveDate) ? $project->setGoLiveDate($goLiveDate) : date("Y-m-d");

      //update of 3m and 6m linked reminders
      $threeMToGo=date("Y-m-d", strtotime($goLiveDate. '-3 month'));
      $sixMToGo=date("Y-m-d", strtotime($goLiveDate. '-6 month'));
      $reminders = $this->getDoctrine()->getRepository('AppBundle:Reminder')->findBy(array('project'=>($id)));
      foreach ($reminders as $row) {
        $previousDate = $row->getDeadline();
        if($row->getType()==='3m') {
          $row->setDeadline($threeMToGo);
          if ($previousDate !== $threeMToGo) {
            $row->setStatus('notok'); //reminders updated so new validation mandatory
          }
        }
        if($row->getType()==='6m') {
          $row->setDeadline($sixMToGo);
          if ($previousDate !== $sixMToGo) {
            $row->setStatus('notok'); //reminders updated so new validation mandatory
          }
        }
      }

      $dbm->flush();
      if($name) {
        $this->notify('Project n°'.$project->getId().', name: '.'"'.$name.'"'.' modified');
      } else {
        $this->notify('Project n°'.$project->getId().' modified : action on reminder');

      } 

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

    /**
     * @Put("/reminder/autoregen")
     */
    public function forceRegenAutoReminder() {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $data = new reminder;
        $dbm = $this->getDoctrine()->getManager();
        $reminder3M = $this->getDoctrine()->getRepository('AppBundle:Reminder')->findBy(array('type'=>('3m'), 'status'=>('notok')));
        $reminder6M = $this->getDoctrine()->getRepository('AppBundle:Reminder')->findBy(array('type'=>('6m'), 'status'=>('notok')));

        foreach($reminder3M as $row3M) {
          if (empty($row3M)) {
              return new View("reminder not found", Response::HTTP_NOT_FOUND);
          } else {
              $this->notify('Reminder n°'.$row3M->getId().' deleted'); 
              $dbm->remove($row3M);
          }
        }

        foreach($reminder6M as $row6M) {
          if (empty($row6M)) {
              return new View("reminder not found", Response::HTTP_NOT_FOUND);
          } else {
              $this->notify('Reminder n°'.$row6M->getId().' deleted'); 
              $dbm->remove($row6M);
          }
        }

        $dbm->flush();

        $projects = $this->getAction();

        foreach($projects as $proj) {
          // verification if reminder 3m/6m validated exist
          $reminder6M = $this->getDoctrine()->getRepository('AppBundle:Reminder')->findBy(array('type'=>('6m'), 'project'=>($proj->getId())));
          if(!$reminder6M) {
            $this->postAutoReminder6M($proj);
          }

          $reminder3M = $this->getDoctrine()->getRepository('AppBundle:Reminder')->findBy(array('type'=>('3m'), 'project'=>($proj->getId())));
          if(!$reminder3M) {
            $this->postAutoReminder3M($proj);
          }

        }
        
        return new View("Deleted successfully", Response::HTTP_OK);
    }

}
