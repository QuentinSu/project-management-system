<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\Company;
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
use Symfony\Bundle\FrameworkBundle\Controller\Controller;


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

    //  /**
    //  * @Get("/company")
    //  * 
    //  */
    // public function getAction()
    // {
    //     return $this->getDoctrine()->getRepository('AppBundle:company')->findAll();
    // }

    // /**
    //  * @Post("/company")
    //  */
    // public function postAction(Request $request)
    // { 
    //   $data = new company($this->getUser());
    //   $name = $request->get
    //   $description = $request->get('description');
    //   $author = $request->get('author');

    // if( empty($description) || empty($author) )
    // {
    //   return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
    // } 
    //   $data->setName($description);
    //   $data->setAuthor($author);
    //   $em = $this->getDoctrine()->getManager();
    //   $em->persist($data);
    //   $em->flush();
    //   $this->notify('company added');
    //   return new View("company Added Successfully", Response::HTTP_OK);
    // }

    // /** 
    // * @Put("/company/{id}")
    // */
    // public function updateAction($id,Request $request)
    // { 

    //     $company = $this->getDoctrine()->getRepository('AppBundle:company')->find($id);
    //     if (empty($company)) {
    //         return new View("company not found", Response::HTTP_NOT_FOUND);
    //     } 

    //     // Admin restriction for this view
    //     if (!$this->getUser()->isAdmin() && $this->getUser() !== $company->getUser()) {
    //         return new View("not allowed", Response::HTTP_FORBIDDEN);
    //     }
        
    //     $description = $request->get('description');
    //     $author = $request->get('author');

    //     $dbm = $this->getDoctrine()->getManager();

    //     !empty($description) ? $company->setDescription($description) : 0;
    //     !empty($author) ? $company->setAuthor($author) : 0;

    //     $dbm->flush();

    //     $this->notify('company n°'.$company->getId().' modified');

    //     return new View("company Updated Successfully", Response::HTTP_OK);;
    // }

    // /**
    //  * @Delete("/company/{id}")
    //  */
    // public function deleteAction($id)
    // {
    //     $company = $this->getDoctrine()->getRepository('AppBundle:company')->find($id);
    //     if (empty($company)) {
    //         return new View("company not found", Response::HTTP_NOT_FOUND);
    //     } 

    //     // Admin restriction for this view
    //     if (!$this->getUser()->isAdmin() && $this->getUser() !== $company->getUser()) {
    //         return new View("not allowed", Response::HTTP_FORBIDDEN);
    //     }
        
    //     $this->notify('company n°'.$company->getId().' deleted');
    //     $dbm = $this->getDoctrine()->getManager();
    //     $dbm->remove($company);
    //     $dbm->flush();
    
    //     return new View("deleted successfully", Response::HTTP_OK);
    // }
//}

   

}
