<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use AppBundle\Entity\Server;
use AppBundle\Entity\ServerReminder;
use Symfony\Component\Routing\Annotation\Route;
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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Security\Core\User\UserInterface;

class ServerReminderController extends Controller
{
    /** 
    * @Get("/server/reminder/{serverid}")
    */
    public function getAction($serverid)
    { 
        // return $this->getDoctrine()->getRepository('AppBundle:Project')->findAll();
                
        $remind = $this->getDoctrine()->getRepository('AppBundle:ServerReminder')->findBy(array('server'=>($serverid)));
        if(!$remind) {
            $remindResult = ['empty'];
        } else {
            $remindResult = [];
            foreach ($remind as $row) {
                //$remindResult .= 'c ';
                $remindInfos = [];
                array_push($remindInfos,$row->getId());
                array_push($remindInfos,$row->getType());
                array_push($remindInfos,$row->getStatus());
                array_push($remindResult,$remindInfos);
            }
        }
        //to add : eoy project->user->company
        return $remindResult;
    }
}
