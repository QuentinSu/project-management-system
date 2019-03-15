<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ServerRepository")
 */
class Server
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
    private $address;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Project")
     */
    private $project;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $liveDate;//deprecated

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\ServerReminder", mappedBy="server", orphanRemoval=true)
     */
    private $serverReminders;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $created;

    public function __construct()
    {
        $this->serverReminders = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): self
    {
        $this->address = $address;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): self
    {
        $this->project = $project;

        return $this;
    }

    public function getLiveDate(): ?\DateTimeInterface
    {
        return $this->liveDate;
    }

    public function setLiveDate(?\DateTimeInterface $liveDate): self
    {
        $this->liveDate = $liveDate;

        return $this;
    }

    /**
     * @return Collection|ServerReminder[]
     */
    public function getServerReminders(): Collection
    {
        return $this->serverReminders;
    }

    public function addServerReminder(ServerReminder $serverReminder): self
    {
        if (!$this->serverReminders->contains($serverReminder)) {
            $this->serverReminders[] = $serverReminder;
            $serverReminder->setServer($this);
        }

        return $this;
    }

    public function removeServerReminder(ServerReminder $serverReminder): self
    {
        if ($this->serverReminders->contains($serverReminder)) {
            $this->serverReminders->removeElement($serverReminder);
            // set the owning side to null (unless already changed)
            if ($serverReminder->getServer() === $this) {
                $serverReminder->setServer(null);
            }
        }

        return $this;
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

    public function getCreated(): ?string
    {
        return $this->created;
    }

    public function setCreated(string $created): self
    {
        $this->created = $created;

        return $this;
    }
}
