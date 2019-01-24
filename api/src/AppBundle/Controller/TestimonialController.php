<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\Testimonial;
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
class TestimonialController extends RestServiceController
{
    /**
     * @Get("/testimonial")
     * 
     */
    public function getAction()
    {
        return $this->getDoctrine()->getRepository('AppBundle:Testimonial')->findAll();
    }

    /**
     * @Post("/testimonial")
     */
    public function postAction(Request $request)
    { 
      $data = new Testimonial($this->getUser());
      $description = $request->get('description');
      $author = $request->get('author');

    if( empty($description) || empty($author) )
    {
      return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
    } 
      $data->setDescription($description);
      $data->setAuthor($author);
      $em = $this->getDoctrine()->getManager();
      $em->persist($data);
      $em->flush();
      $this->notify('Testimonial added');
      return new View("Testimonial Added Successfully", Response::HTTP_OK);
    }

    /** 
    * @Put("/testimonial/{id}")
    */
    public function updateAction($id,Request $request)
    { 

        $testimonial = $this->getDoctrine()->getRepository('AppBundle:Testimonial')->find($id);
        if (empty($testimonial)) {
            return new View("testimonial not found", Response::HTTP_NOT_FOUND);
        } 

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin() && $this->getUser() !== $testimonial->getUser()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $description = $request->get('description');
        $author = $request->get('author');

        $dbm = $this->getDoctrine()->getManager();

        !empty($description) ? $testimonial->setDescription($description) : 0;
        !empty($author) ? $testimonial->setAuthor($author) : 0;

        $dbm->flush();

        $this->notify('Testimonial n°'.$testimonial->getId().' modified');

        return new View("Testimonial Updated Successfully", Response::HTTP_OK);;
    }

    /**
     * @Delete("/testimonial/{id}")
     */
    public function deleteAction($id)
    {
        $testimonial = $this->getDoctrine()->getRepository('AppBundle:Testimonial')->find($id);
        if (empty($testimonial)) {
            return new View("testimonial not found", Response::HTTP_NOT_FOUND);
        } 

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin() && $this->getUser() !== $testimonial->getUser()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $this->notify('Testimonial n°'.$testimonial->getId().' deleted');
        $dbm = $this->getDoctrine()->getManager();
        $dbm->remove($testimonial);
        $dbm->flush();
    
        return new View("deleted successfully", Response::HTTP_OK);
    }
}
