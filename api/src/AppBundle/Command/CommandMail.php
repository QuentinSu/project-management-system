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

class CommandMail extends ContainerAwareCommand
{

    private $swiftMailerService;

    public function __construct(\Swift_Mailer $swiftMailerService)
    {
        parent::__construct();
        $this->swiftMailerService = $swiftMailerService;
    }

    public function getRemindersOfTheDay() {

        $remindersOfTheDay = [];
        $projects = $this->getContainer()->get('doctrine')->getRepository('AppBundle:Project')->findAll();

        foreach ($projects as $cardReminder) {
            $name = $cardReminder->getName();
            $golive = $cardReminder->getGoLiveDate();
            $status = $cardReminder->getStatus();
            $remind = $this->getContainer()->get('doctrine')->getRepository('AppBundle:Reminder')->findBy(array('project'=>($cardReminder->getId())));
            if($remind) {
                //$iterableResult = $remind->iterate();
                $today = date("Y-m-d");
                $todayTMS = strtotime($today);
                
                $remindResult = [];
                foreach ($remind as $row) {
                    if($row->getStatus()!=='ok') {
                        $deadline = $row->getDeadline();
                        $deadlineTMS = strtotime($deadline);
                        $deadlineTodayDifference = $deadlineTMS - $todayTMS;
                        $remindInfos = [];
                        /* late and today reminders */
                        if($deadlineTodayDifference < 0) {
                            array_push($remindInfos, 'late');
                            array_push($remindInfos, $row->getType());
                            array_push($remindInfos,$row->getDeadline());
                            // $bodyMessage .= $row->getType()." late \n";
                        } else if ($deadlineTodayDifference <86400) { //86400 sec = 1days
                            array_push($remindInfos, 'today');
                            array_push($remindInfos, $row->getType());
                            array_push($remindInfos,$row->getDeadline());
                        }
                        // } else if ($deadlineTodayDifference < 1209600) { //1 209 600 = 14 days
                        //     $bodyMessage .= $row->getType()." soon ! \n";
                        // }
                        
                        // array_push($remindInfos,$row->getId());
                        // array_push($remindInfos,$row->getStatus());
                        // array_push($remindInfos,$row->getType());
                        // array_push($remindInfos,$row->getDeadline());
                        if(!empty($remindInfos)) {
                            array_push($remindResult,$remindInfos);
                        }
                    }
                }

                if(!empty($remindResult)) {
                    //search company of each users, next find eoy of each companies and add their eoy in eoy return (often unique but smtimes plural). Finally eoy will containes list of [nameOfCompany, eoyOfCompany]
                    $userLinkToProject = $cardReminder->getUsers();
                    $userToContact = [];
                    foreach ($userLinkToProject as $user) {
                        $nameUser = $user->getUsername();
                        $email = $user->getEmail();
                        $newUser = [];
                        array_push($newUser, $nameUser);
                        array_push($newUser, $email);
                        if(!empty($newUser)) {
                            array_push($userToContact, $newUser);
                        }
                    }
                    $projectWithRemindersToSent = [];
                    array_push($projectWithRemindersToSent, $name);
                    array_push($projectWithRemindersToSent, $remindResult);
                    array_push($projectWithRemindersToSent, $userToContact);

                    array_push($remindersOfTheDay, $projectWithRemindersToSent);
                    
                    //$newRemind = ['id'=>$id, 'name'=>$name, 'go_live_date'=>$golive, 'status'=>$status, 'reminders'=>$remindResult, 'eoys'=> $eoys];
                    //to add : eoy project->user->company
                    //array_push($reminders,$newRemind);
                }
            }
        }
        return $remindersOfTheDay;
    }

    protected static $defaultName = 'app:send-daily-mail';

    protected function configure() {
        $this
            ->setDescription('Send automatic reminders mail everyday.')

            ->setHelp('This command allows you to send automatic reminder mail to Rhys, everyday...');
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        //call getRemindersOfTheDay
        $remindersOfTheDay = $this->getRemindersOfTheDay();
        foreach ($remindersOfTheDay as &$clientReminders) {
            $message = (new \Swift_Message('💡 Reminder of the day - '.$clientReminders[0].' - '.date("d.m")))
                ->setFrom('crm.rhyswelsh@gmail.com')
                ->setTo('quentin.sutkowski@gmail.com')
                ->setBody(json_encode($clientReminders));
            $this->swiftMailerService->send($message);
        }
        
    }
}