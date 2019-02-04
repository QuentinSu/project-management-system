<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\Project;
use AppBundle\Controller\RestServiceController;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Controller\Annotations;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Event\GetResponseUserEvent;
use FOS\UserBundle\FOSUserEvents;
use FOS\UserBundle\Event\FormEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @RouteResource("profile", pluralize=false)
 */
class RestProfileController extends RestServiceController implements ClassResourceInterface
{
    /**
     * @Get("/profile")
     *
     * Note: Could be refactored to make use of the User Resolver in Symfony 3.2 onwards
     * more at : http://symfony.com/blog/new-in-symfony-3-2-user-value-resolver-for-controllers
     */
    public function getCurrentAction(UserInterface $user)
    {
        if ($this->getUser()->isAdmin()) {
            $users = $this->getDoctrine()->getRepository('AppBundle:User')->findAll();
            $data = array();
            $data['users'] = array_map(function($userData) use($data) {
                return array(
                    'id' => $userData->getId(),
                    'username' => $userData->getUsername(),
                    'email' => $userData->getEmail(),
                    'enabled' => $userData->isEnabled(),
                    'lastLogin' => $userData->getLastLogin(),
                    'roles' => $userData->getRoles(),
                    'projects' => $userData->getProjects()
                );
            }, $users);
            $data['current_username'] = $this->getUser()->getUsername();
            $data['is_admin'] = $this->getUser()->isAdmin();
            $data['is_advanced'] = $this->getUser()->isAdvanced();
            return $data;    
        } else if ($this->getUser()) {
            $data = array(
                'username' => $this->getUser()->getUsername(),
                'roles' => $this->getUser()->getRoles(),
            );
            $data['is_admin'] = $this->getUser()->isAdmin();
            $data['is_advanced'] = $this->getUser()->isAdvanced();
            return $data;
        } else {
            throw new AccessDeniedHttpException();
        }
    }
    
    /**
     * @Get("/profile/{user}")
     *
     * @ParamConverter("user", class="AppBundle:User")
     *
     * Note: Could be refactored to make use of the User Resolver in Symfony 3.2 onwards
     * more at : http://symfony.com/blog/new-in-symfony-3-2-user-value-resolver-for-controllers
     */
    public function getAction(UserInterface $user)
    {
        if ($this->getUser()->isAdmin()) {
            return array(
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'enabled' => $user->isEnabled(),
                'lastLogin' => $user->getLastLogin(),
                'roles' => $user->getRoles(),
                'projects' => $user->getProjects()
            );
        } else if ($user !== $this->getUser()) {
            throw new AccessDeniedHttpException();
        }
        return array(
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'enabled' => $user->isEnabled(),
            'lastLogin' => $user->getLastLogin(),
            'roles' => $user->getRoles(),
            'projects' => $user->getProjects()
        );
    }

    /**
     * @Put("/profile/{user}/project/{project}")
     * 
     * @param Request       $request
     * @param UserInterface $user
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("user", class="AppBundle:User")
     */
    public function addProjectAction(Project $project, UserInterface $user)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        $user->addProject($project);

        /** @var $userManager \FOS\UserBundle\Model\UserManagerInterface */
        $userManager = $this->get('fos_user.user_manager');
        $userManager->updateUser($user);

        $this->notify('Project n°'.$project->getId().' added on username: '.$user->getUsername()); 

        return $user;
    }

    /**
     * @Delete("/profile/{user}/project/{project}")
     * 
     * @param Request       $request
     * @param UserInterface $user
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("user", class="AppBundle:User")
     */
    public function removeProjectAction(Project $project, UserInterface $user)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $user->removeProject($project);

        /** @var $userManager \FOS\UserBundle\Model\UserManagerInterface */
        $userManager = $this->get('fos_user.user_manager');
        $userManager->updateUser($user);

        $this->notify('Project n°'.$project->getId().' removed from username: '.$user->getUsername()); 

        return $user;
    }

    /**
     * Partial put authorized (kind of a patch)
     * 
     * @Put("/profile/{user}")
     * 
     * @param Request       $request
     * @param UserInterface $user
     *
     * @ParamConverter("user", class="AppBundle:User")
     *
     * @return View|\Symfony\Component\Form\FormInterface
     */
    public function putAction(Request $request, UserInterface $user)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        $enabled = $request->get('enabled');
        $email = $request->get('email');
        $roles = $request->get('roles');
        $dbm = $this->getDoctrine()->getManager();
        $user = $this->getDoctrine()->getRepository('AppBundle:User')->find($user->getId());
        if (empty($user)) {
            return new View("User not found", Response::HTTP_NOT_FOUND);
        } 

        $user->setEnabled($enabled);
        $user->setEmail($email);
        $user->setRoles($roles);

        $dbm->flush();

        $this->notify('User n°'.$user->getId().' modified (e-mail or roles)'); 

        return new View("User Updated Successfully", Response::HTTP_OK);;
    }

    /**
     * @Delete("/profile/{id}")
     */
    public function deleteAction($id)
    {
        // Admin restriction for this view
        if (!$this->getUser()->isAdmin()) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        
        $dbm = $this->getDoctrine()->getManager();
        $user = $this->getDoctrine()->getRepository('AppBundle:User')->find($id);
        if (empty($user)) {
            return new View("user not found", Response::HTTP_NOT_FOUND);
        }
        else {
            $this->notify('User n°'.$user->getId().' deleted'); 
            $dbm->remove($user);
            $dbm->flush();
        }

        return new View("deleted successfully", Response::HTTP_OK);
    }
}