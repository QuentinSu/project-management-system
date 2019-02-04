<?php

namespace AppBundle\Controller;

use AppBundle\Controller\RestServiceController;
use FOS\RestBundle\Controller\Annotations;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\Controller\Annotations\RouteResource;

/**
 * @RouteResource("login", pluralize=false)
 * @RouteResource("login/advanced", pluralize=false)
 */
class RestLoginController extends RestServiceController implements ClassResourceInterface
{
    public function postAction()
    {
        // route handled by Lexik JWT Authentication Bundle
        throw new \DomainException('You should never see this');
    }
}