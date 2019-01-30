<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use AppBundle\Entity\User;
use JMS\Serializer\Annotation as JMSSerializer;

/**
 * Project
 *
 * @ORM\Table(name="project")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ProjectRepository")
 * 
 */
class Project
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
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="type", type="string", length=255)
     */
    private $type;

    /**
     * @var string
     *
     * @ORM\Column(name="status", type="string", length=255)
     */
    private $status;

    /**
     * Many Projects have Many Users.
     * @ORM\ManyToMany(targetEntity="User", mappedBy="projects")
     * @JMSSerializer\Exclude
     */
    private $users;

    /**
     * One Project has Many Checklists.
     * @ORM\OneToMany(targetEntity="Checklist", mappedBy="project", cascade={"remove"})
     */
    private $checklists;

    /**
     * One Project has Many Support tickets.
     * @ORM\OneToMany(targetEntity="SupportTicket", mappedBy="project", cascade={"remove"})
     */
    private $tickets;

    /**
     * @var int
     *
     * @ORM\Column(name="file_ticket_id", type="integer", nullable=true)
     */
    private $fileTicketId;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $goLiveDate;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Reminder", mappedBy="project", orphanRemoval=true)
     */
    private $reminders;


    /**
     * Constructor
     */
    public function __construct() {
        $this->users = new \Doctrine\Common\Collections\ArrayCollection();
        $this->checklists = new \Doctrine\Common\Collections\ArrayCollection();
        $this->reminders = new ArrayCollection();
    }


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
     * Set name
     *
     * @param string $name
     *
     * @return Project
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set type
     *
     * @param string $type
     *
     * @return Project
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set status
     *
     * @param string $status
     *
     * @return Project
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    public function addUser(User $user)
    {
        $this->users[] = $user;
    }

    public function deleteUser(User $user)
    {
        $this->users->removeElement($user);
    }

    public function getChecklists()
    {
        return $this->checklists;
    }

    public function getSupportTickets()
    {
        return $this->tickets;
    }

    /**
     * Set file ticket id
     *
     * @param int $id
     *
     * @return Project
     */
    public function setFileTicketId($id)
    {
        $this->fileTicketId = $id;

        return $this;
    }

    /**
     * Get file ticket id
     *
     * @return int
     */
    public function getFileTicketId()
    {
        return $this->fileTicketId;
    }

    /**
     * Get users
     */
    public function getUsers()
    {
        return $this->users;
    }

    public function getGoLiveDate(): ?\DateTimeInterface
    {
        return $this->goLiveDate;
    }

    public function setGoLiveDate(?\DateTimeInterface $goLiveDate): self
    {
        $this->goLiveDate = $goLiveDate;

        return $this;
    }

    /**
     * @return Collection|Reminder[]
     */
    public function getReminders(): Collection
    {
        return $this->reminders;
    }

    public function addReminder(Reminder $reminder): self
    {
        if (!$this->reminders->contains($reminder)) {
            $this->reminders[] = $reminder;
            $reminder->setProject($this);
        }

        return $this;
    }

    public function removeReminder(Reminder $reminder): self
    {
        if ($this->reminders->contains($reminder)) {
            $this->reminders->removeElement($reminder);
            // set the owning side to null (unless already changed)
            if ($reminder->getProject() === $this) {
                $reminder->setProject(null);
            }
        }

        return $this;
    }
}

