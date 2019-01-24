<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use AppBundle\Entity\Project;

/**
 * Checklist
 *
 * @ORM\Table(name="checklist")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ChecklistRepository")
 */
class Checklist
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="label", type="string", length=255)
     */
    private $label;

    /**
     * Many Checklists have One Project.
     * @ORM\ManyToOne(targetEntity="Project", inversedBy="checklists")
     * @ORM\JoinColumn(name="project_id", referencedColumnName="id")
     */
    private $project;

    /**
     * One Checklist has Many Checklist messages.
     * @ORM\OneToMany(targetEntity="ChecklistMessage", mappedBy="checklist", cascade={"remove"})
     */
    private $messages;

    /**
     * One Checklist has Many Checklist items.
     * @ORM\OneToMany(targetEntity="ChecklistItem", mappedBy="checklist", cascade={"remove"})
     */
    private $items;


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set label
     *
     * @param string $label
     *
     * @return Checklist
     */
    public function setLabel($label)
    {
        $this->label = $label;

        return $this;
    }

    /**
     * Get label
     *
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * Get project
     */
    public function getProject()
    {
        return $this->project;
    }

    /**
     * Set project
     */
    public function setProject(Project $project)
    {
        $this->project = $project;
    }

    /**
     * Get messages
     */
    public function getMessages()
    {
        return $this->messages;
    }

    /**
     * Get items
     */
    public function getItems()
    {
        return $this->items;
    }
}

