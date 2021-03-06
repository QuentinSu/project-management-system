<?php
namespace AppBundle\Controller;


use AppBundle\Entity\User;
use AppBundle\Entity\Project;
use AppBundle\Entity\Company;
use AppBundle\Entity\Reminder;
use FOS\RestBundle\View\View;
use AppBundle\Repository\ReminderRepository;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use FOS\RestBundle\Controller\Annotations;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Event\GetResponseUserEvent;
use FOS\UserBundle\FOSUserEvents;
use FOS\UserBundle\Event\FormEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\User\UserInterface;
use Psr\Log\LoggerInterface;


/**
 * @RouteResource("reminder", pluralize=false)
 */
class ReminderController extends Controller
{
     /**
     * @Get("/reminder/{id}")
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
     * @Get("/reminder")
     * 
     */
    public function getAction() {
        // return $this->getDoctrine()->getRepository('AppBundle:Project')->findAll();

        $reminders = [];
        $projects = $this->getDoctrine()->getRepository('AppBundle:Project')->findAll();

        foreach ($projects as $cardReminder) {
            $id = $cardReminder->getId();
            $name = $cardReminder->getName();
            $golive = $cardReminder->getGoLiveDate();
            $status = $cardReminder->getStatus();
            $remind = $this->getDoctrine()->getRepository('AppBundle:Reminder')->findBy(array('project'=>($cardReminder->getId())));
            if(!$remind) {
                $remindResult = ['empty'];
            } else {
                //$iterableResult = $remind->iterate();
                $remindResult = [];
                foreach ($remind as $row) {
                    //$remindResult .= 'c ';
                    $remindInfos = [];
                    array_push($remindInfos,$row->getId());
                    array_push($remindInfos,$row->getStatus());
                    array_push($remindInfos,$row->getType());
                    array_push($remindInfos,$row->getDeadline());
                    array_push($remindResult,$remindInfos);
                }
            }
            //search company of each users, next find eoy of each companies and add their eoy in eoy return (often unique but smtimes plural). Finally eoy will containes list of [nameOfCompany, eoyOfCompany]
            $userLinkToProject = $cardReminder->getUsers();
            $companiesEoy = [];
            foreach ($userLinkToProject as $user) {
                $company = $user->getCompany();
                $company ? ($companyEoy=$company->getEoy()) : ($companyEoy=null);
                if ($company) {
                    $companyInfo = [];
                    array_push($companyInfo, $company->getName());
                    array_push($companyInfo, $companyEoy);
                    array_push($companiesEoy, $companyInfo);
                }
            }
            if($companiesEoy) {
                $eoys = array_unique($companiesEoy, SORT_REGULAR);
                // $eoys=$companiesEoy;
            } else {
                $eoys = ['noCompaniesLinked'];
            }

            $newRemind = ['id'=>$id, 'name'=>$name, 'go_live_date'=>$golive, 'status'=>$status, 'reminders'=>$remindResult, 'eoys'=> $eoys];
            //to add : eoy project->user->company
            array_push($reminders,$newRemind);
        }
        return $reminders;
    }

    /**
     * @Post("/reminder")
     */
    public function postAction(Request $request) {
        
      // Admin restriction for this view
      if (!$this->getUser()->isAdmin()) {
        return new View("not allowed", Response::HTTP_FORBIDDEN);
      }
      
      $reminder = new Reminder;
      $projectId = $request->get('projectId');
      $project = $this->getDoctrine()->getRepository('AppBundle:Project')->find($projectId);
      $status = 'notok';
      $type = $request->get('type');
      $deadline = $request->get('deadline');

      // TODO: DO ENUMS VERIF HERE

      if( empty($type) || empty($deadline) )
      {
        return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
      }

      $reminder->setProject($project);
      $reminder->setStatus($status);
      $reminder->setType($type);
      $reminder->setDeadline($deadline);
      $em = $this->getDoctrine()->getManager();
      $em->persist($reminder);

      $em->flush();

      //$this->notify('Reminder '.$type.' created for project :'.$projectId); 

      return new View("Reminder Added Successfully", Response::HTTP_OK);
    }


    /**
     * @Put("/reminder/forcevalid/{id}")
     */
    public function forceValidation($id) {
      $remind = $this->getDoctrine()->getRepository('AppBundle:Reminder')->find($id);
      if(!$remind) {
        return new View("REMINDER NOT FOUND", Response::HTTP_NOT_ACCEPTABLE); 
      }

      $remind->setStatus('ok');
      $dbm = $this->getDoctrine()->getManager();

      $dbm->flush();
      return new View("Reminder Updated Successfully : validated", Response::HTTP_OK);

    }

    /**
     * @Put("/reminder/{id}")
     */
    public function updateAction($id,Request $request) {

        
      // Admin restriction for this view
      if (!$this->getUser()->isAdmin()) {
        return new View("not allowed", Response::HTTP_FORBIDDEN);
      }
      
      $data = new Reminder;
      $projectId = $request->get('projectId');
      $status = $request->get('status');
      $type = $request->get('type');
      $deadline = $request->get('deadline');
      $dbm = $this->getDoctrine()->getManager();
      $project = $this->getDoctrine()->getRepository('AppBundle:Project')->find($projectId);
      if (empty($project)) {
        return new View("project not found", Response::HTTP_NOT_FOUND);
      }

      $reminder = $this->getDoctrine()->getRepository('AppBundle:Reminder')->find($id);
      if (empty($project)) {
        return new View("project not found", Response::HTTP_NOT_FOUND);
      }

      !empty($type) ? $reminder->setType($type) : 'custom';
      !empty($status) ? $reminder->setStatus($status) : 'notok';
      //!empty($deadline) ? $reminder->setDeadline($deadline) : 0;
      $reminder->setDeadline($deadline);
      $reminder->setProject($project);

      $dbm->flush();

      // $this->notify('Reminder n°'.$reminder->getId().', type: '.'"'.$type.'"'.' modified');    

      return new View("Reminder Updated Successfully", Response::HTTP_OK);

    }

    /**
     * @Delete("/reminder/{id}")
     */
    public function deleteAction($id)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $data = new reminder;
        $dbm = $this->getDoctrine()->getManager();
        $reminder = $this->getDoctrine()->getRepository('AppBundle:Reminder')->find($id);

        if (empty($reminder)) {
            return new View("reminder not found", Response::HTTP_NOT_FOUND);
        } else {
            // $this->notify('Reminder n°'.$reminder->getId().' deleted'); 
            $dbm->remove($reminder);
            $dbm->flush();
        }

        return new View("Deleted successfully", Response::HTTP_OK);
    }


    // /**
    //  * @Put("/reminder/mail/{id}")
    //  */
    // function sendMailBrother($id, Request $request) {
    //   $object = $request->get('object');
    //   $body = $request->get('body');
      
    //   if(empty($object)) {
    //     $object='Reminder Rhys Welsh Info';
    //   }

    //   $message = (new \Swift_Message($object))
    //       ->setFrom('crm.rhyswelsh@gmail.com')
    //       ->setTo('quentin.sutkowski@gmail.com')
    //       ->setBody(
    //           $body  
    //       )
    //       /*
    //       * If you also want to include a plaintext version of the message
    //       ->addPart(
    //           $this->renderView(
    //               'Emails/registration.txt.twig',
    //               array('name' => $name)
    //           ),
    //           'text/plain'
    //       )
    //       */
    //   ;
    //   $this->get('mailer')->send($message);
    // }

}