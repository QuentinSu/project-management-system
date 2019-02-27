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

    public function getAction() {

        $reminders = [];
        $projects = $this->getContainer()->get('doctrine')->getRepository('AppBundle:Project')->findAll();

        foreach ($projects as $cardReminder) {
            $id = $cardReminder->getId();
            $name = $cardReminder->getName();
            $golive = $cardReminder->getGoLiveDate();
            $status = $cardReminder->getStatus();
            $remind = $this->getContainer()->get('doctrine')->getRepository('AppBundle:Reminder')->findBy(array('project'=>($cardReminder->getId())));
            if(!$remind) {
                $remindResult = ['empty'];
            } else {
                //$iterableResult = $remind->iterate();
                $remindResult = [];
                foreach ($remind as $row) {
                    //$remindResult .= 'c ';
                    $remindInfos = [];
                    array_push($remindInfos,$row->getId());
                    array_push($remindInfos,$row->getStatus());
                    array_push($remindInfos,$row->getType());
                    array_push($remindInfos,$row->getDeadline());
                    array_push($remindResult,$remindInfos);
                }
            }
            //search company of each users, next find eoy of each companies and add their eoy in eoy return (often unique but smtimes plural). Finally eoy will containes list of [nameOfCompany, eoyOfCompany]
            $userLinkToProject = $cardReminder->getUsers();
            $companiesEoy = [];
            foreach ($userLinkToProject as $user) {
                $company = $user->getCompany();
                $company ? ($companyEoy=$company->getEoy()) : ($companyEoy=null);
                if ($company) {
                    $companyInfo = [];
                    array_push($companyInfo, $company->getName());
                    array_push($companyInfo, $companyEoy);
                    array_push($companiesEoy, $companyInfo);
                }
            }
            if($companiesEoy) {
                // $eoys = array_unique($companiesEoy, SORT_REGULAR);
                $eoys=$companiesEoy;
            } else {
                $eoys = ['noCompaniesLinked'];
            }

            $newRemind = ['id'=>$id, 'name'=>$name, 'go_live_date'=>$golive, 'status'=>$status, 'reminders'=>$remindResult, 'eoys'=> $eoys];
            //to add : eoy project->user->company
            array_push($reminders,$newRemind);
        }
        return $reminders;
    }

    protected static $defaultName = 'app:send-daily-mail';

    protected function configure() {
        $this
            ->setDescription('Send automatic reminders mail everyday.')

            ->setHelp('This command allows you to send automatic reminder mail to Rhys, everyday...');
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        $allreminder = $this->getAction();
        $message = (new \Swift_Message('Reminder of the day '.date("d.m")))
                    ->setFrom('crm.rhyswelsh@gmail.com')
                    ->setTo('quentin.sutkowski@gmail.com')
                    ->setBody('test body'.json_encode($allreminder));
        $this->swiftMailerService->send($message);
    }
}