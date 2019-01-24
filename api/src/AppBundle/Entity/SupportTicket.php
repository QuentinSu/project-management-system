<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * SupportTicket
 *
 * @ORM\Table(name="support_ticket")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\SupportTicketRepository")
 */
class SupportTicket
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
     * @var date
     *
     * @ORM\Column(name="created", type="datetime")
     */
    private $created;

    /**
     * @var date
     *
     * @ORM\Column(name="modified", type="datetime")
     */
    private $modified;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text")
     */
    private $description;

    /**
     * @var string
     * 
     * @ORM\Column(name="status", type="string", length=255)
     */
    private $status;

    /**
     * Many SupportTickets have One Project.
     * @ORM\ManyToOne(targetEntity="Project", inversedBy="tickets")
     * @ORM\JoinColumn(name="project_id", referencedColumnName="id")
     */
    private $project;

    /**
     * @ORM\Column(name="files", type="array", nullable=true)
     */
    private $files;

    public function __construct() {
        // we set up "created"+"modified"
        $this->setCreated(new \DateTime());
        if ($this->getModified() == null) {
            $this->setModified(new \DateTime());
        }
        $this->setFiles(array());
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
     * Get created date
     *
     * @return date
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * Get modified date
     *
     * @return date
     */
    public function getModified()
    {
        return $this->modified;
    }

    /**
     * Set created date
     *
     * @param date $date
     */
    public function setCreated($date)
    {
        $this->created = $date;
    }

    /**
     * Set modified date
     *
     * @param date $date
     */
    public function setModified($date)
    {
        $this->modified = $date;
    }


    /**
     * Set description
     *
     * @param string $description
     *
     * @return SupportTicket
     */
    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
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

    /**
     * Set status
     *
     * @param string $status
     *
     * @return SupportTicket
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
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
     * Get files
     */
    public function getFiles()
    {
        return $this->files;
    }

    /**
     * Set files
     */
    public function setFiles($files)
    {
        $this->files = $files;
    }
}

