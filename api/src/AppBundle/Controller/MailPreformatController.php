<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\MailPreformat;
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
 * @RouteResource("mailpreformat", pluralize=false)
 */
class MailPreformatController extends RestServiceController
{
    /**
     * @Get("/mailpreformat")
     * 
     */
    public function getAction()
    {
        return $this->getDoctrine()->getRepository('AppBundle:MailPreformat')->findAll();
    }

    /**
     * @Post("/mailpreformat")
     */
    public function postAction(Request $request)
    { 
      $data = new MailPreformat();
      $content = $request->get('content');
      $name = $request->get('name');
      $type = $request->get('type');

    if( empty($content) || empty($name) )
    {
      return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
    } 
      $data->setContent($content);
      $data->setName($name);
      $data->setType($type);
      $em = $this->getDoctrine()->getManager();
      $em->persist($data);
      $em->flush();
      $this->notify('Mail preformatted added');
      return new View("Mail preformatted Added Successfully", Response::HTTP_OK);
    }

    /** 
    * @Put("/mailpreformat/{id}")
    */
    public function updateAction($id,Request $request)
    { 

        $mail = $this->getDoctrine()->getRepository('AppBundle:MailPreformat')->find($id);
        if (empty($mail)) {
            return new View("testimonial not found", Response::HTTP_NOT_FOUND);
        } 

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $content = $request->get('content');
        $name = $request->get('name');
        $type = $request->get('type');

        $dbm = $this->getDoctrine()->getManager();

        !empty($content) ? $mail->setContent($content) : 0;
        !empty($name) ? $mail->setName($name) : 0;
        !empty($type) ? $mail->setType($type) : 'tagrossemere';

        $dbm->flush();

        //$this->notify('Mail preformatted n°'.$mail->getId().' modified');

        return new View("Mail preformatted Updated Successfully. Type : ".$type, Response::HTTP_OK);;
    }

    /**
     * @Delete("/mailpreformat/{id}")
     */
    public function deleteAction($id)
    {
        $mail = $this->getDoctrine()->getRepository('AppBundle:MailPreformat')->find($id);
        if (empty($mail)) {
            return new View("mail not found", Response::HTTP_NOT_FOUND);
        } 

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $this->notify('Mail preformatted n°'.$mail->getId().' deleted');
        $dbm = $this->getDoctrine()->getManager();
        $dbm->remove($mail);
        $dbm->flush();
    
        return new View("deleted successfully", Response::HTTP_OK);
    }
}
