<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use AppBundle\Entity\date;
use AppBundle\Entity\User;
use JMS\Serializer\Annotation as JMSSerializer;

/**
 * Company
 * @ORM\Table(name="company")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\CompanyRepository")
 */
class Company
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="string", length=1000, nullable=true)
     */
    private $description;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $phone;

    /**
     * @ORM\Column(type="string", name="dateCreation", nullable=true)
     */
    private $dateCreation;  // deprecated but imposssible to remove (metadata issue...)

    /**
     * @ORM\OneToMany(targetEntity="User", mappedBy="company")
     */
    private $users;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $creation;

    /**
     * @ORM\Column(type="array", nullable=true)
     */
    private $files = [];

    /**
     * @ORM\Column(type="boolean")
     */
    private $status;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $eoy;

    /**
     * @ORM\Column(type="smallint")
     */
    private $testimonial;

    /**
     * @ORM\Column(type="smallint")
     */
    private $social;

    public function __construct()
    {
        $this->users = new ArrayCollection();

        // we set up "created"+"modified"
        $date = new \DateTime();
        $this->setCreation($date->format('Y-m-d H:i:s'));
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }
    // deprecated but imposssible to remove (metadata issue...)
    public function getDateCreation(): ?string  
    {
        return (string) $this->dateCreation;
    }
    // deprecated but imposssible to remove (metadata issue...)
    public function setDateCreation(?string $dateCreation): self
    {
        $this->dateCreation = $dateCreation;

        return $this;
    }

    /**
     * @return Collection|user[]
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(user $user): self
    {
        if (!$this->users->contains($user)) {
            $this->users[] = $user;
            $user->setCompany($this);
        }

        return $this;
    }

    public function removeUser(user $user): self
    {
        if ($this->users->contains($user)) {
            $this->users->removeElement($user);
            // set the owning side to null (unless already changed)
            if ($user->getCompany() === $this) {
                $user->setCompany(null);
            }
        }

        return $this;
    }

    public function getCreation(): ?string
    {
        return $this->creation;
    }

    public function setCreation(string $creation): self
    {
        $this->creation = $creation;

        return $this;
    }

    public function getFiles(): ?array
    {
        return $this->files;
    }

    public function setFiles(?array $files): self
    {
        $this->files = $files;

        return $this;
    }

    public function getStatus(): ?bool
    {
        return $this->status;
    }

    public function setStatus(bool $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getEoy(): ?string
    {
        return $this->eoy;
    }

    public function setEoy(?string $eoy): self
    {
        $this->eoy = $eoy;

        return $this;
    }

    public function getTestimonial(): ?int
    {
        return $this->testimonial;
    }

    public function setTestimonial(int $testimonial): self
    {
        $this->testimonial = $testimonial;

        return $this;
    }

    public function getSocial(): ?int
    {
        return $this->social;
    }

    public function setSocial(int $social): self
    {
        $this->social = $social;

        return $this;
    }
}
