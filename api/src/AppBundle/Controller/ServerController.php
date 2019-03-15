<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @RouteResource("server", pluralize=false)
 */
class ServerController extends RestServiceController
{
    /**
     * @Get("/server")
     * 
     */
    public function getAction()
    {
        return $this->getDoctrine()->getRepository('AppBundle:Server')->findAll();
    }

    /**
     * @Post("/server")
     */
    public function postAction(Request $request)
    { 
      $data = new Server;
      $name = $request->get('name');
      $address = $request->get('address');

      $monitoring = $request->get('monitoring');
      $firewall = $request->get('firewall');
      $backups = $request->get('backups');
      $local = $request->get('local');

    if( empty($name) || empty($address) )
    {
      return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
    } 
      $data->setName($name);
      $data->setAddress($address);
      $created = date('Y-m-d');
      $data->setCreated($created);
      $em = $this->getDoctrine()->getManager();
      $em->persist($data);
      $em->flush();
      $lastId = $data->getId();

      $dataMonitoring = new ServerReminder;
      $dataMonitoring->setServer($data);
      $dataMonitoring->setType('Monitoring');
      $monitoring ? $dataMonitoring->setStatus($monitoring) : '0';
      $em->persist($dataMonitoring);

      $dataFirewall = new ServerReminder;
      $dataFirewall->setServer($data);
      $dataFirewall->setType('Firewall');
      $firewall ? $dataFirewall->setStatus($firewall) : '0';
      $em->persist($dataFirewall);

      $dataBackUps = new ServerReminder;
      $dataBackUps->setServer($data);
      $dataBackUps->setType('BackUps');
      $backups ? $dataBackUps->setStatus($backups) : '0';
      $em->persist($dataBackUps);

      $dataLocal = new ServerReminder;
      $dataLocal->setServer($data);
      $dataLocal->setType('Local');
      $local ? $dataLocal->setStatus($local) : '0';
      $em->persist($dataLocal);

      $em->flush();
     
      $this->notify('Server added');
      return new View("Server Added Successfully", Response::HTTP_OK);
    }

    /** 
    * @Put("/server/{id}")
    */
    public function updateAction($id,Request $request)
    { 

        $server = $this->getDoctrine()->getRepository('AppBundle:Server')->find($id);
        if (empty($server)) {
            return new View("server not found", Response::HTTP_NOT_FOUND);
        } 

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $name = $request->get('name');
        $address = $request->get('address');

        $dbm = $this->getDoctrine()->getManager();

        !empty($name) ? $server->setName($name) : 0;
        !empty($address) ? $server->setAddress($address) : 0;

        $dbm->flush();

        $this->notify('Server n°'.$server->getId().' modified');

        return new View("Server Updated Successfully", Response::HTTP_OK);;
    }

    /**
     * @Delete("/server/{id}")
     */
    public function deleteAction($id)
    {
        $server = $this->getDoctrine()->getRepository('AppBundle:Server')->find($id);
        if (empty($server)) {
            return new View("server not found", Response::HTTP_NOT_FOUND);
        } 

        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $this->notify('Server n°'.$server->getId().' deleted');
        $dbm = $this->getDoctrine()->getManager();
        $dbm->remove($server);
        $dbm->flush();
    
        return new View("deleted successfully", Response::HTTP_OK);
    }
}
