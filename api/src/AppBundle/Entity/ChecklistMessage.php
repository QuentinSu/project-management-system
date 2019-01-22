<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ChecklistMessage
 *
 * @ORM\Table(name="checklist_message")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ChecklistMessageRepository")
 */
class ChecklistMessage
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
     * Many Checklist messages have One Checklist.
     * @ORM\ManyToOne(targetEntity="Checklist", inversedBy="messages")
     * @ORM\JoinColumn(name="checklist_id", referencedColumnName="id")
     */
    private $checklist;


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
     * @return ChecklistMessage
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
     * Set checklist
     */
    public function setChecklist($checklist)
    {
        $this->checklist = $checklist;

        return $this;
    }
}

