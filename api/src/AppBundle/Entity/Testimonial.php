<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use AppBundle\Entity\User;
use JMS\Serializer\Annotation as JMSSerializer;

/**
 * Testimonial
 *
 * @ORM\Table(name="testimonial")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\TestimonialRepository")
 */
class Testimonial
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
     * @ORM\Column(name="description", type="string", length=255)
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column(name="author", type="string", length=255)
     */
    private $author;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     * @JMSSerializer\Exclude
     */
    private $user;

    public function __construct($user) {
        // we set up "created"+"modified"
        $this->setCreated(new \DateTime());
        if ($this->getModified() == null) {
            $this->setModified(new \DateTime());
        }
        $this->setUser($user);
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
     * Get author
     *
     * @return string
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * Set author
     *
     * @param string $author
     *
     * @return SupportTicket
     */
    public function setAuthor($author)
    {
        $this->author = $author;
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
     * Get user
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set user
     */
    public function setUser(User $user)
    {
        $this->user = $user;
    }
}

