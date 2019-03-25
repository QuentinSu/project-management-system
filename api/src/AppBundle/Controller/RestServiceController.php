<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use AppBundle\Entity\Notification;
use AppBundle\Entity\Server;
use AppBundle\Entity\ServerReminder;
use AppBundle\Controller\RestServiceController;
use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Controller\Annotations;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Event\GetResponseUserEvent;
use FOS\UserBundle\FOSUserEvents;
use FOS\UserBundle\Event\FormEvent;
use Symfony\Component\HttpFoundation\JsonResponse;


class RestServiceController extends FOSRestController
{
    public function notify($message) {
        $author = $this->getUser() ? $this->getUser()->getUsername() : 'Admin';
        $notif = new Notification($author, new \Datetime(), $message);
        $em = $this->getDoctrine()->getManager();
        $em->persist($notif);
        $em->flush();
    }
}