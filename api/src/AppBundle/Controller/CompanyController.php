<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\Company;
use AppBundle\Entity\Reminder;
use AppBundle\Entity\Project;
use AppBundle\Controller\RestServiceController;
use AppBundle\Controller\ReminderController;
use AppBundle\Repository\CompanyRepository;
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
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * @RouteResource("company", pluralize=false)
 */
class CompanyController extends Controller
{
    // /**
    //  * @Route("/company", name="company")
    //  */
    // public function index()
    // {
    //     return $this->render('company/index.html.twig', [
    //         'controller_name' => 'CompanyController',
    //     ]);
    // }

     /**
     * @Get("/company")
     * 
     */
    public function getAction() {
        return $this->getDoctrine()->getRepository('AppBundle:Company')->findAll();
    }

    /**
     * @Get("/company/{id}")
     * 
     */
    public function getActionCompany($id) {
        return $this->getDoctrine()->getRepository('AppBundle:Company')->find($id);
    }

    /**
     * @Post("/company")
     */
    public function postAction(Request $request) { 
      $data = new Company();
      $name = $request->get('name');
      $description = $request->get('description');
      $phone = $request->get('phone');
      $status = $request->get('status');
      $testimonial = $request->get('testimonial');
      $social = $request->get('social');
      $eoy = $request->get('eoy');
      $user = $request->get('user');
      $creation = $request->get('creation'); // to test

        if( empty($description) || empty($name) ) {
            return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
        } 
      $data->setName($name);
      $data->setDescription($description);
      $data->setPhone($phone);
      $data->setCreation($creation);
      $data->setStatus($status);
      $data->setTestimonial($testimonial);
      $data->setSocial($social);

      !empty($eoy) ? $data->setEoy($eoy) : $data->setEoy(date("Y").'-12-31');
      if($user) {
        $data->addUser($user);
      }

      $em = $this->getDoctrine()->getManager();
      $em->persist($data);
      $em->flush();
    //$this->notify('Company added');
      return new View("Company Added Successfully", Response::HTTP_OK);
    }

    public function createEoyReminder(Company $company, Project $project) {
        $exist = false;
        $eoyCompRemindName = 'eoy_'.$company->getId().'_';
        $existingRemind = $this->getDoctrine()->getRepository('AppBundle:Reminder')->findBy(array('project'=>($project->getId())));
        $dbm = $this->getDoctrine()->getManager();
        foreach ($existingRemind as $row) {
            if(strstr($row->getType(), $eoyCompRemindName)) {
                $nbLink=str_replace($eoyCompRemindName, '', $row->getType());
                $exist = true;
                $nbLink=(int)$nbLink;
                $nbLink++;
                $row->setType('eoy_'.$company->getId().'_'.$nbLink); 
            }
        }
        $dbm->flush();                                                                                                                                                          
        if(!$exist) {
            $data = new Reminder();
            $data->setProject($project);
            $data->setStatus('notok');
            $data->setType('eoy_'.$company->getId().'_1'); //eoy_[idcompany]_[nbOfUsersLinkingProject&Company]
            $data->setDeadline(date("Y-m-d", strtotime($company->getEoy(). '-3 week')));
            $em = $this->getDoctrine()->getManager();
            $em->persist($data);
            $em->flush();
        }
    }

    public function deleteEoyReminder(Company $company, Project $project) {
        $eoyCompRemindName = 'eoy_'.$company->getId().'_';
        $existingRemind = $this->getDoctrine()->getRepository('AppBundle:Reminder')->findBy(array('project'=>($project->getId())));
        $dbm = $this->getDoctrine()->getManager();
        foreach ($existingRemind as $row) {
            if(strstr($row->getType(), $eoyCompRemindName)) {
                $nbLink=str_replace($eoyCompRemindName, '', $row->getType());
                $nbLink=(int)$nbLink;
                $nbLink--;
                if($nbLink === 0) {
                    // $this->notify('Reminder n°'.$reminder->getId().' deleted'); 
                    $dbm->remove($row);
                } else {
                    $row->setType('eoy_'.$company->getId().'_'.$nbLink);
                }
            }
        }
        $dbm->flush();                                                                                                                                  

    }

    /** 
    * @Put("/company/{id}/user/{id_user}")
    */
    public function addCompanyUser($id, $id_user, Request $request){
        $company = $this->getDoctrine()->getRepository('AppBundle:Company')->find($id);
        if (empty($company)) {
            return new View("company not found", Response::HTTP_NOT_FOUND);
        }

        $user = $this->getDoctrine()->getRepository('AppBundle:User')->find($id_user);
        if (empty($user)) {
            return new View("user not found", Response::HTTP_NOT_FOUND);
        }

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin() && $this->getUser() !== $company->getUser()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $dbm = $this->getDoctrine()->getManager();

        !empty($company) ? $company->addUser($user) : NULL;
        $user->setCompany($company);
        //foreach project linked with this user, we call createReminderEoy
        $projects = $user->getProjects();
        foreach($projects as $project) {
            $this->createEoyReminder($company, $project);
        }
        $dbm->persist($company);
        $dbm->flush();

        // $this->notify('Company ID'.$company->getId().' modified');

        return new View("Company Updated Successfully", Response::HTTP_OK);
        
    }

    /**
     * @Delete("/company/{company}/user/{user}")
     * 
     * @param Request       $request
     * @param UserInterface $user
     * 
     * @ParamConverter("company", class="AppBundle:Company")
     * @ParamConverter("user", class="AppBundle:User")
     */
    public function removeUserAction(user $user, Company $company)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        $dbm = $this->getDoctrine()->getManager();

        $user->setCompany(null);
        $company->removeUser($user);

        //management of eoy reminder linked
        $projects = $user->getProjects();
        foreach($projects as $project) {
            $this->deleteEoyReminder($company, $project);
        }

        $dbm->persist($company);
        $dbm->persist($user);
        $dbm->flush();

        /** @var $userManager \FOS\UserBundle\Model\UserManagerInterface */
        // $userManager = $this->get('fos_user.user_manager');
        // $userManager->updateUser($user);

        //$this->notify('Project n°'.$project->getId().' removed from username: '.$user->getUsername()); 

        return $user;
    }

    /** 
    * @Put("/company/{id}")
    */
    public function updateAction($id,Request $request)
    { 

        $company = $this->getDoctrine()->getRepository('AppBundle:Company')->find($id);
        if (empty($company)) {
            return new View("company not found", Response::HTTP_NOT_FOUND);
        } 

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $description = $request->get('description');
        $name = $request->get('name');
        $phone = $request->get('phone');
        $creation = $request->get('creation');
        $status = $request->get('status');
        $testimonial = $request->get('testimonial');
        $social = $request->get('social');
        $eoy = $request->get('eoy');

        $initialEoy = $company->getEoy();

        $dbm = $this->getDoctrine()->getManager();

        !empty($description) ? $company->setDescription($description) : 0;
        !empty($name) ? $company->setName($name) : 0;
        !empty($phone) ? $company->setPhone($phone) : 0;
        !empty($creation) ? $company->setCreation($creation) : 0;
        !empty($eoy) ? $company->setEoy($eoy) : date("Y").'-12-31';

        $company->setStatus($status);
        $company->setTestimonial($testimonial);
        $company->setSocial($social);

        $dbm->flush();

        //if eoy change, we update the reminder (turn notok and date update)
        if($initialEoy !== $company->getEoy()) {
            $users = $company->getUsers();
            foreach($users as $user) {
                $projects = $user->getProjects();
                foreach($projects as $project) {
                    $this->deleteEoyReminder($company, $project);
                    $this->createEoyReminder($company, $project);
                }
            }
        }

        // $this->notify('Company ID'.$company->getId().' modified');

        return new View("Company Updated Successfully", Response::HTTP_OK);
    }

    /**
     * @Delete("/company/{id}")
     */
    public function deleteAction($id)
    {
        $company = $this->getDoctrine()->getRepository('AppBundle:Company')->find($id);
        if (empty($company)) {
            return new View("Company not found", Response::HTTP_NOT_FOUND);
        } 

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        // $this->notify('Company ID'.$company->getId().' deleted');
        $dbm = $this->getDoctrine()->getManager();

        //remove company/user link
        foreach ($company->getUsers() as $user) {
            $userData = $this->getDoctrine()->getRepository('AppBundle:User')->find($user);
            $userData->setCompany(null);
        }
        $dbm->remove($company);
        $dbm->flush();
    
        return new View("Deleted successfully", Response::HTTP_OK);
    }


    // GESTION OF FILES - for the moment used for company logo!
    /**
     * @Post("/company/{company}/file")
     * 
     * @ParamConverter("company", class="AppBundle:Company")
     * 
     */
     public function postFileAction(Request $request, Company $company)
     { 
         // Handle file here
         $file = $request->files->get('upload');
         $status = array('status' => "success","fileUploaded" => false);
 
         $nameStored = str_replace(' ', '', $company->getName());//.'.'.$file->getClientOriginalExtension();
         
         // If a file was uploaded
         if(!is_null($file)){
             $isAccepted = in_array(
                 $file->getClientOriginalExtension(),
                 array(
                     "png", 
                     "jpg"
                 )
             );
             if(!$isAccepted) {
                 return new View("not allowed", Response::HTTP_FORBIDDEN);
             }
             $path = "./../../front/public/company_logo/";
             $file->move($path, $nameStored); // move the file to a path
             $status = array('status' => "success","fileUploaded" => true);
         }
 
         // Handle file array for company here
         $files = $company->getFiles();
         $files = ($files === null) ? array() : $files;
         if (!in_array($nameStored, $files)) {
             array_push($files, $nameStored);
             $company->setFiles($files); 
             $em = $this->getDoctrine()->getManager();
             $em->persist($company);
             $em->flush();
         }
 
         //$this->notify('File added on company n°'.$company->getId());
 
        //  $subject = "[RWSupport] File uploaded on company: " . $company->getName();
        //  $content = "Hi Rhys, file has been uploaded for company: " . $company->getName() . "\nFile name: " . $file->getClientOriginalName();
        //  foreach ($this->getParameter('admin_mails') as $mailAddress) {
        //      mail($mailAddress,$subject,$content);
        //    }    
 
         return $status;
     }
 
     /**
      * @Delete("/company/{company}/file/{path}")
      * 
      * @ParamConverter("company", class="AppBundle:Company")
      * 
      */
     public function deleteFileAction(Request $request, Company $company)
     {
 
         // Handle file array for ticket here
         $files = $company->getFiles();
         $files = ($files === null) ? array() : $files;
         $newFiles = array();
         foreach ($files as $file) {
             if ($file !== $request->get('path')) {
                 array_push($newFiles, $file);
             }
         }
         $company->setFiles($newFiles);
 
         $em = $this->getDoctrine()->getManager();
         $em->persist($company);
         $em->flush();
 
         $this->notify('File deleted on company '.$company->getName());
 
         $path = "./../../front/public/company_logo/".$request->get('path');
         if (file_exists($path)) {
             unlink($path);
             return array('status' => 'success');
         }
         return array('status' => 'failed');
     }
 
     /**
      * @Get("/company/{company}/file/{path}")
      * 
      * @ParamConverter("company", class="AppBundle:Company")
      * 
      */
     public function getFileAction(Request $request, Company $company)
     {
         $path = "./../../front/public/company_logo/".$request->get('path');
         if (file_exists($path)) {
             return new BinaryFileResponse($path);
         }
         return array('status' => 'failed');
     }

}