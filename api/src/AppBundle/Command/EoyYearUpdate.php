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

use AppBundle\Entity\Project;
use AppBundle\Entity\Company;
use AppBundle\Entity\User;
use AppBundle\Controller\CompanyController;


class EoyYearUpdate extends ContainerAwareCommand
{


    public function __construct()
    {
        parent::__construct();
    }

    protected static $defaultName = 'app:eoy-regen-year';

    protected function configure() {
        $this
            ->setDescription('Check each day if company eoy is reached. In this case eoy -> +1year')

            ->setHelp('This command allows you to regenerate date of company eoy when eoy is reached ...');
    }

    protected function execute(InputInterface $input, OutputInterface $output) {

        $dbm = $this->getContainer()->get('doctrine')->getManager();
        $companies = $this->getContainer()->get('doctrine')->getRepository('AppBundle:Company')->findAll();

        foreach ($companies as $company) {
            $name = $company->getName();
            $eoy = $company->getEoy();
            
            $today = date("Y-m-d");

            if($today === $eoy) {
                $company->setEoy(date("Y-m-d", strtotime($eoy. '+1 year')));
            }
            $dbm->flush();
        }
    }
}