<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class ReminderController extends Controller
{
    /**
     * @Route("/reminder", name="reminder")
     */
    public function index()
    {
        return $this->render('reminder/index.html.twig', [
            'controller_name' => 'ReminderController',
        ]);
    }
}
