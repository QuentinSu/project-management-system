<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class ServerReminderController extends Controller
{
    /**
     * @Route("/server/reminder", name="server_reminder")
     */
    public function index()
    {
        return $this->render('server_reminder/index.html.twig', [
            'controller_name' => 'ServerReminderController',
        ]);
    }
}
