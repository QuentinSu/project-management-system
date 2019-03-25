<?php 

namespace AppBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use FOS\RestBundle\Controller\Annotations;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Event\GetResponseUserEvent;
use FOS\UserBundle\FOSUserEvents;
use FOS\UserBundle\Event\FormEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\User\UserInterface;
use Psr\Log\LoggerInterface;

use AppBundle\Entity\User;
use AppBundle\Entity\Project;
use AppBundle\Entity\Company;
use AppBundle\Entity\Reminder;
use AppBundle\Controller\ReminderController;


class ReminderYearUpdate extends ContainerAwareCommand
{


    public function __construct()
    {
        parent::__construct();
    }

    protected static $defaultName = 'app:autoreminders-regen-year';

    protected function configure() {
        $this
            ->setDescription('Check each day if (bday project + 2 weeks) is reach to regen auto reminders.')

            ->setHelp('This command allows you to regenerate date of automatic reminders when bday project + 2 weeks is reached...');
    }

    protected function execute(InputInterface $input, OutputInterface $output) {

        $dbm = $this->getContainer()->get('doctrine')->getManager();
        $projects = $this->getContainer()->get('doctrine')->getRepository('AppBundle:Project')->findAll();

        foreach ($projects as $cardReminder) {
            $name = $cardReminder->getName();
            $golive = $cardReminder->getGoLiveDate();
            $status = $cardReminder->getStatus();
            $bdayPlus2Weeks;
            $remind = $this->getContainer()->get('doctrine')->getRepository('AppBundle:Reminder')->findBy(array('project'=>($cardReminder->getId())));
            if($remind) {
                foreach ($remind as $row) {
                    if($row->getType()==='bday') {
                        $bdayPlus2Weeks = date("Y-m-d", strtotime($row->getDeadline(). '+2 week'));
                        break;
                    }
                }
                //bday + 2 weeks reach
                $today = date("Y-m-d");
                
                if($today === $bdayPlus2Weeks) {
                    foreach ($remind as $row) {
                        if($row->getType()==='3m' || $row->getType()==='6m' || $row->getType()==='bday' ) {
                            $row->setDeadline(date("Y-m-d", strtotime($row->getDeadline(). '+1 year')));
                            $row->setStatus('notok'); //reminders updated so new validation mandatory
                        }
                    }
                }

                $dbm->flush();
            }
        }
    }
}