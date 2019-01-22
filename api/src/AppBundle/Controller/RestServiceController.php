<?php

namespace AppBundle\Controller;

use AppBundle\Controller\RestServiceController;
use FOS\RestBundle\Controller\FOSRestController;
use AppBundle\Entity\Notification;

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