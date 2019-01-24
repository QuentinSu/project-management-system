<?php

namespace AppBundle\Entity;

use AppBundle\Entity\Project;
use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as JMSSerializer;

/**
 * @ORM\Entity
 * @ORM\Table(name="fos_user")
 * 
 * @JMSSerializer\ExclusionPolicy("all")
 */
class User extends BaseUser
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     * 
     * @JMSSerializer\Expose
     * @JMSSerializer\Type("string")
     */
    protected $id;

    /**
     * @JMSSerializer\Expose
     * @JMSSerializer\Type("string")
     */
    protected $username;

    /**
     * @var string The email of the user.
     *
     * @JMSSerializer\Expose
     * @JMSSerializer\Type("string")
     */
    protected $email;

    /**
     * Many Users have Many Projects.
     * @ORM\ManyToMany(targetEntity="Project", inversedBy="users")
     * @ORM\JoinTable(name="users_projects")
     */
    private $projects;

    public function __construct()
    {
        parent::__construct();
        $this->projects = new \Doctrine\Common\Collections\ArrayCollection();
    }

    public function getProjects()
    {
        return $this->projects;
    }

    public function isAdmin()
    {
        return in_array('ROLE_ADMIN', $this->roles);
    }

    public function addProject(Project $project)
    {
        $isAlreadyThere = false;
        foreach ($this->projects as $projectToCheck) {
            if ($project === $projectToCheck) {
                $isAlreadyThere = true;
            }
        }
        if (!$isAlreadyThere) {
            $project->addUser($this); // synchronously updating inverse side
            $this->projects[] = $project;
        }
    }

    public function removeProject(Project $project)
    {
        $project->deleteUser($this);
        $this->projects->removeElement($project);
    }
}