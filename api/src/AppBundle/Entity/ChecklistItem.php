<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ChecklistItem
 *
 * @ORM\Table(name="checklist_item")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ChecklistItemRepository")
 */
class ChecklistItem
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
     * @var bool
     *
     * @ORM\Column(name="checked", type="boolean")
     */
    private $checked;

    /**
     * Many Checklist items have One Checklist.
     * @ORM\ManyToOne(targetEntity="Checklist", inversedBy="items")
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
     * @return ChecklistItem
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
     * Set checked
     *
     * @param boolean $checked
     *
     * @return ChecklistItem
     */
    public function setChecked($checked)
    {
        $this->checked = $checked;

        return $this;
    }

    /**
     * Get checked
     *
     * @return bool
     */
    public function getChecked()
    {
        return $this->checked;
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

