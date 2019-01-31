<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class ServerController extends Controller
{
    /**
     * @Route("/server", name="server")
     */
    public function index()
    {
        return $this->render('server/index.html.twig', [
            'controller_name' => 'ServerController',
        ]);
    }
}
