<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\Notification;
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
class NotificationController extends RestServiceController
{
    /**
     * @Get("/notification")
     * 
     */
    public function getAction()
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        return $this->getDoctrine()->getRepository('AppBundle:Notification')->findAll();
    }

    /**
     * @Put("/notification/{notification}")
     * 
     * @ParamConverter("notification", class="AppBundle:Notification")
     */
    public function putAction(Request $request, Notification $notification)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        $notification->setChecked(!$notification->getChecked());
        
        $em = $this->getDoctrine()->getManager();
        $em->persist($notification);
        $em->flush();
    
        return new View("toggled successfully", Response::HTTP_OK);
    }

    /**
     * @Delete("/notification/{notification}")
     * 
     * @ParamConverter("notification", class="AppBundle:Notification")
     */
    public function deleteOneAction(Request $request, Notification $notification)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $dbm = $this->getDoctrine()->getManager();
        $dbm->remove($notification);
        $dbm->flush();
    
        return new View("deleted successfully", Response::HTTP_OK);
    }

    /**
     * @Delete("/notification")
     */
    public function deleteAllAction(Request $request)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        $dbm = $this->getDoctrine()->getManager();
        $notifications = $this->getDoctrine()->getRepository('AppBundle:Notification')->findAll();
        foreach ($notifications as $notification) {
            $dbm->remove($notification);
        }
        $dbm->flush();
        return new View("deleted successfully", Response::HTTP_OK);
    }
}
