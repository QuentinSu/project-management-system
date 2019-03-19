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
                            array_push($remindInfos, (int)(-$deadlineTodayDifference/86400));
                            // $bodyMessage.= $row->getType()." late <br>";
                        } else if ($deadlineTodayDifference <86400) { //86400 sec = 1days
                            array_push($remindInfos, 'today');
                            array_push($remindInfos, $row->getType());
                            array_push($remindInfos,$row->getDeadline());
                        }
                        // } else if ($deadlineTodayDifference < 1209600) { //1 209 600 = 14 days
                        //     $bodyMessage.= $row->getType()." soon ! <br>";
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

    public function countReminders($tabReminders, $type) {
        $countRemind = 0;
        foreach ($tabReminders as &$reminder) {
            if ($reminder[0] === $type) {
                $countRemind++;
            }
        }
        return $countRemind;
    }

    public function introBody($nbLateReminders, $nbDayReminders) {
        $intro = "You have";
        if($nbLateReminders !== 0) {
            $intro.= " <b>".$nbLateReminders."</b> late reminder(s)";
            if($nbDayReminders !== 0) {
                $intro.= " and";
            }
        }
        if ($nbDayReminders !== 0) {
            $intro.= " <b>".$nbDayReminders."</b> day reminder(s)";
        }
        $intro.= " due !<br>";
        return $intro;
    }

    public function contactBody($clientsTab) {
        $contacts = "";
        foreach ($clientsTab as &$contact) {
            $contacts.= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            $contacts.= "<span style='font-size:150%'>&#129174;</span> <b>".$contact[0]."</b> < ".$contact[1]." ><br>";  #&#129174; -> array white on black composant
        }
        if ($contacts === "") {
            return "No <b>Contacts</b> linked to this project yet.<br>";
        } else {
            return "<b>Contacts</b> linked to this project:<br>".$contacts;
        }
    }

    public function listBody($tabReminders, $nbLate, $nbDay) {
        $list = "";
        $lateList = "";
        $dayList = "";
        foreach($tabReminders as &$remind) {
            $dueDate = date("d-m-Y", strtotime($remind[2]));
            if($remind[0] === 'late') {
                $lateList.= "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                $lateList.= "<span style='font-size:150%'>&#9873;</span> <b>".$remind[1]."</b> due on ".$dueDate." (<b>".$remind[3]." days</b> late).";
            }
            if($remind[0] === 'today') {
                $dayList.= "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                $dayList.= "<span style='font-size:150%'>&#9872;</span> <b>".$remind[1]."</b> due on ".$dueDate.".";
            }
        }

        if($nbLate !== 0) {
            $list.= "<b style='color:#f44336'>Late</b> reminders:";
            $list.= $lateList."<br>";
        }
        if($nbDay !== 0) {
            $list.= "<b style='color:#f6ae47'>Day</b> reminders:";
            $list.= $dayList;
        }

        return $list;
    }


    public function footerBody() {
        $footer = "______________________<br>";
        $footer.= "This is an auto-generated email, you can't answer.<br>";
        $footer.= "Rhys Welsh CRM";
        return $footer;
    }

    protected function execute(InputInterface $input, OutputInterface $output) {

        $this->get('logger')->error('JE SUIS ICIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII BRO');
        //call getRemindersOfTheDay
        $remindersOfTheDay = $this->getRemindersOfTheDay();
        foreach ($remindersOfTheDay as &$clientReminders) {
            $nbLateReminders = $this->countReminders($clientReminders[1], 'late');
            $nbDayReminders = $this->countReminders($clientReminders[1], 'today');

            $introText = $this->introBody($nbLateReminders, $nbDayReminders);

            $contacts = $this->contactBody($clientReminders[2]);

            $listBody = $this->listBody($clientReminders[1], $nbLateReminders, $nbDayReminders);

            $footerBody = $this->footerBody();

            $body = "<html><body>".$introText."<br>".$contacts."<br>".$listBody."<br>".$footerBody."</body></hmtl>";
            
            $message = (new \Swift_Message('💡 Reminder of the day - '.$clientReminders[0].' - '.date("d.m")))
                ->setFrom('crm.rhyswelsh@gmail.com')
                ->setTo(array('quentin.sutkowski@gmail.com', 'quentin.sutkowski@hautsdefrance.fr'))
                ->setBody($body, 'text/html');
            $this->swiftMailerService->send($message);

            // if($clientReminders[0] === "The Art of Workshop") {
            //     $message = (new \Swift_Message('💡 Reminder of the day - '.$clientReminders[0].' - '.date("d.m")))
            //     ->setFrom('crm.rhyswelsh@gmail.com')
            //     ->setTo(array('quentin.sutkowski@gmail.com', 'info@rhyswelsh.com'))
            //     ->setBody($body, 'text/html');
            //     $this->swiftMailerService->send($message);
            // }

        }
    }
}