<?php

namespace AppBundle\Repository;

use AppBundle\Entity\ServerReminder;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method ServerReminder|null find($id, $lockMode = null, $lockVersion = null)
 * @method ServerReminder|null findOneBy(array $criteria, array $orderBy = null)
 * @method ServerReminder[]    findAll()
 * @method ServerReminder[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ServerReminderRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, ServerReminder::class);
    }

    // /**
    //  * @return ServerReminder[] Returns an array of ServerReminder objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('s.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?ServerReminder
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
