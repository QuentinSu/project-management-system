<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use AppBundle\Entity\Project;
use AppBundle\Entity\Checklist;
use AppBundle\Entity\ChecklistMessage;
use AppBundle\Entity\ChecklistItem;
use AppBundle\Controller\RestServiceController;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Controller\Annotations;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
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

// TODO : optimize the code status
// TODO : cascade remove voir https://openclassrooms.com/forum/sujet/symfony-2-suppression-d-une-entite-69526

/**
 * @RouteResource("project", pluralize=false)
 */
class ChecklistController extends RestServiceController
{
    /**
     * @Get("/project/{project}/checklist")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * 
     * NOTE: NOT REALLY USEFUL BECAUS WHEN WE GET A PROJECT WE GET ALL HIS CHECKLISTS...
     */
    public function getAction(Project $project)
    {
        if ($this->getUser()->isAdmin()) {
            return $project->getChecklists();
        }
        if (!$this->getUser()->getProjects()->contains($project)) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }
        return $project->getChecklists();
    }

    /**
     * @Post("/project/{project}/checklist")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * 
     */
    public function postAction(Request $request, Project $project)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin /*&& !$isUserProject*/) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        $data = new Checklist;
        $label = $request->get('label');

        if (empty($label)) {
            return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
        } 
        $data->setLabel($label);
        $data->setProject($project);
        $em = $this->getDoctrine()->getManager();
        $em->persist($data);
        $em->flush();
        $this->notify('Checklist for project: '.$project->getName().', created with label: '.$label);
        return new View("Checklist Added Successfully", Response::HTTP_OK);
    }

    /**
     * @Put("/project/{project}/checklist/{checklist}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("checklist", class="AppBundle:Checklist")
     * 
     */
    public function putAction(Request $request, Project $project, Checklist $checklist)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $checklist)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $label = $request->get('label');

        if (empty($label)) {
            return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
        } 

        $checklist->setLabel($label);
        $em = $this->getDoctrine()->getManager();
        $em->persist($checklist);
        $em->flush();
        $this->notify('Checklist n°'.$checklist->getId().' from project: '.$project->getName().', modified');
        return new View("Checklist Modified Successfully", Response::HTTP_OK);
    }


    /**
     * @Delete("/project/{project}/checklist/{checklist}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("checklist", class="AppBundle:Checklist")
     * 
     */
    public function deleteAction(Project $project, Checklist $checklist)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $checklist)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $em = $this->getDoctrine()->getManager();
        $this->notify('Checklist n°'.$checklist->getId().' from project: '.$project->getName().', deleted');
        $em->remove($checklist);
        $em->flush();
        return new View("Checklist deleted successfully", Response::HTTP_OK);
    }

    /**
     * @Post("/project/{project}/checklist/{checklist}/message")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("checklist", class="AppBundle:Checklist")
     * 
     */
    public function postMessageAction(Request $request, Project $project, Checklist $checklist)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin && !$isUserProject) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $checklist)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $data = new ChecklistMessage;
        $label = $request->get('label');

        if (empty($label)) {
            return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
        } 
        $data->setLabel($label);
        $data->setChecklist($checklist);
        $em = $this->getDoctrine()->getManager();
        $em->persist($data);
        $em->flush();
        $this->notify('Checklist message created with label: '.$label);
        return new View("ChecklistMessage Added Successfully", Response::HTTP_OK);
    }

    /**
     * @Put("/project/{project}/checklist/{checklist}/message/{message}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("checklist", class="AppBundle:Checklist")
     * @ParamConverter("message", class="AppBundle:ChecklistMessage")
     * 
     */
    public function putMessageAction(Request $request, Project $project, Checklist $checklist, ChecklistMessage $message)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $checklist, $message)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $label = $request->get('label');

        if (empty($label)) {
            return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
        } 

        $message->setLabel($label);
        $em = $this->getDoctrine()->getManager();
        $em->persist($message);
        $em->flush();
        return new View("Checklist Modified Successfully", Response::HTTP_OK);
    }

    /**
     * @Delete("/project/{project}/checklist/{checklist}/message/{message}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("checklist", class="AppBundle:Checklist")
     * 
     */
    public function deleteMessageAction(Project $project, Checklist $checklist, ChecklistMessage $message)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $checklist, $message)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($message);
        $em->flush();
        $this->notify('Checklist message n°'.$message->getId().' deleted');
        return new View("Checklist deleted successfully", Response::HTTP_OK);
    }

    /**
     * @Post("/project/{project}/checklist/{checklist}/item")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("checklist", class="AppBundle:Checklist")
     * 
     */
    public function postItemAction(Request $request, Project $project, Checklist $checklist)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $checklist)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $data = new ChecklistItem;
        $label = $request->get('label');

        if (empty($label)) {
            return new View("NULL VALUES ARE NOT ALLOWED", Response::HTTP_NOT_ACCEPTABLE); 
        } 
        $data->setLabel($label);
        $data->setChecked(false);
        $data->setChecklist($checklist);
        $em = $this->getDoctrine()->getManager();
        $em->persist($data);
        $em->flush();
        $this->notify('Checklist item created with label: '.$label);
        return new View("ChecklistItem Added Successfully", Response::HTTP_OK);
    }

    /**
     * @Put("/project/{project}/checklist/{checklist}/item/{item}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("checklist", class="AppBundle:Checklist")
     * @ParamConverter("item", class="AppBundle:ChecklistItem")
     * 
     */
    public function putItemAction(Request $request, Project $project, Checklist $checklist, ChecklistItem $item)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $checklist, null, $item)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $label = $request->get('label');
        $checked = $request->get('checked');

        if (!empty($label)) {
            $item->setLabel($label);
        }
        if (!empty($checked)) {
            $item->setChecked($checked);
        } 

        $em = $this->getDoctrine()->getManager();
        $em->persist($item);
        $em->flush();
        return new View("Checklist Modified Successfully", Response::HTTP_OK);
    }

    /**
     * @Delete("/project/{project}/checklist/{checklist}/item/{item}")
     * 
     * @ParamConverter("project", class="AppBundle:Project")
     * @ParamConverter("checklist", class="AppBundle:Checklist")
     * 
     */
    public function deleteItemAction(Project $project, Checklist $checklist, ChecklistItem $item)
    {
        $isAdmin  = $this->getUser()->isAdmin();
        $isUserProject = $this->getUser()->getProjects()->contains($project);

        if (!$isAdmin) {
            return new View("not allowed", Response::HTTP_FORBIDDEN);
        }

        if ($this->_isInconsistent($project, $checklist, null, $item)) {
            return new View("Inconsistent state", Response::HTTP_FORBIDDEN);
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($item);
        $em->flush();
        $this->notify('Checklist item n°'.$item->getId().' deleted');
        return new View("Checklist deleted successfully", Response::HTTP_OK);
    }

    private function _isInconsistent(
        Project $project, 
        Checklist $checklist,
        ChecklistMessage $message = null,
        ChecklistItem $item = null
    )
    {
        $inconsistentState = false;
        $inconsistentState = !$project->getChecklists()->contains($checklist);
        if ($message) {
            $inconsistentState = !$checklist->getMessages()->contains($message);
        }
        if ($item) {
            $inconsistentState = !$checklist->getItems()->contains($item);
        }
        return $inconsistentState;
    }
}
