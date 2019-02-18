<?php
namespace AppBundle\Controller;


use AppBundle\Entity\User;
use AppBundle\Entity\Project;
use AppBundle\Entity\Company;
use AppBundle\Entity\Reminder;
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


/**
 * @RouteResource("reminder", pluralize=false)
 */
class ReminderController extends Controller
{

     /**
     * @Get("/reminder")
     * 
     */
    public function getAction() {
        // return $this->getDoctrine()->getRepository('AppBundle:Project')->findAll();

        $reminders = [];
        $projects = $this->getDoctrine()->getRepository('AppBundle:Project')->findAll();

        foreach ($projects as $cardReminder) {
            $name = $cardReminder->getName();
            $golive = $cardReminder->getGoLiveDate();
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
                // $eoys = array_unique($companiesEoy, SORT_REGULAR);
                $eoys=$companiesEoy;
            } else {
                $eoys = ['noCompaniesLinked'];
            }

            $newRemind = ['name'=>$name, 'go_live_date'=>$golive, 'reminders'=>$remindResult, 'eoys'=> $eoys];
            //to add : eoy project->user->company
            array_push($reminders,$newRemind);
        }
        return $reminders; 
    }

    /**
     * @Post("/reminder")
     */
    // public function postAction(Request $request) { 
    //   $data = new Company();
    //   $name = $request->get('name');
    //   $description = $request->get('description');
    //   $phone = $request->get('phone');
    //   $status = $request->get('status');
    //   $eoy = $request->get('eoy');
    //   $creation = $request->get('creation'); // to test

    //     if( empty($description) || empty($name) ) {
    //         return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
    //     } 
    //   $data->setName($name);
    //   $data->setDescription($description);
    //   $data->setPhone($phone);
    //   $data->setCreation($creation);
    //   $data->setStatus($status);
    //   $data->setEoy($eoy);
    //   $em = $this->getDoctrine()->getManager();
    //   $em->persist($data);
    //   $em->flush();
    // //   $this->notify('Company added');
    //   return new View("Company Added Successfully", Response::HTTP_OK);
    // }

    // /** 
    // * @Put("/company/{id}/user/{id_user}")
    // */
    // public function addCompanyUser($id, $id_user, Request $request){
    //     $company = $this->getDoctrine()->getRepository('AppBundle:Company')->find($id);
    //     if (empty($company)) {
    //         return new View("company not found", Response::HTTP_NOT_FOUND);
    //     } 

    //     $user = $this->getDoctrine()->getRepository('AppBundle:User')->find($id_user);
    //     if (empty($user)) {
    //         return new View("user not found", Response::HTTP_NOT_FOUND);
    //     } 

    //     // Admin restriction for this view
    //     if (!$this->getUser()->isAdmin() && $this->getUser() !== $company->getUser()) {
    //         return new View("not allowed", Response::HTTP_FORBIDDEN);
    //     }
        
    //     $dbm = $this->getDoctrine()->getManager();

    //     !empty($company) ? $company->addUser($user) : NULL;
    //     $dbm->persist($company);
    //     $dbm->flush();

    //     // $this->notify('Company ID'.$company->getId().' modified');

    //     return new View("Company Updated Successfully", Response::HTTP_OK);
        
    // }

    // /** 
    // * @Put("/company/{id}")
    // */
    // public function updateAction($id,Request $request)
    // { 

    //     $company = $this->getDoctrine()->getRepository('AppBundle:Company')->find($id);
    //     if (empty($company)) {
    //         return new View("company not found", Response::HTTP_NOT_FOUND);
    //     } 

    //     // Admin restriction for this view
    //     if (!$this->getUser()->isAdmin() && $this->getUser() !== $company->getUser()) {
    //         return new View("not allowed", Response::HTTP_FORBIDDEN);
    //     }
        
    //     $description = $request->get('description');
    //     $name = $request->get('name');
    //     $phone = $request->get('phone');
    //     $creation = $request->get('creation');
    //     $status = $request->get('status');
    //     $eoy = $request->get('eoy');

    //     $dbm = $this->getDoctrine()->getManager();

    //     !empty($description) ? $company->setDescription($description) : 0;
    //     !empty($name) ? $company->setName($name) : 0;
    //     !empty($phone) ? $company->setPhone($phone) : 0;
    //     !empty($creation) ? $company->setCreation($creation) : 0;
    //     !empty($eoy) ? $company->setEoy($eoy) : date("Y").'-12-31';

    //     $company->setStatus($status);

    //     $dbm->flush();

    //     // $this->notify('Company ID'.$company->getId().' modified');

    //     return new View("Company Updated Successfully", Response::HTTP_OK);
    // }

    // /**
    //  * @Delete("/company/{id}")
    //  */
    // public function deleteAction($id)
    // {
    //     $company = $this->getDoctrine()->getRepository('AppBundle:Company')->find($id);
    //     if (empty($company)) {
    //         return new View("Company not found", Response::HTTP_NOT_FOUND);
    //     } 

    //     // Admin restriction for this view
    //     if (!$this->getUser()->isAdmin() && $this->getUser() !== $company->getUser()) {
    //         return new View("not allowed", Response::HTTP_FORBIDDEN);
    //     }
        
    //     // $this->notify('Company ID'.$company->getId().' deleted');
    //     $dbm = $this->getDoctrine()->getManager();
    //     $dbm->remove($company);
    //     $dbm->flush();
    
    //     return new View("Deleted successfully", Response::HTTP_OK);
    // }

    }