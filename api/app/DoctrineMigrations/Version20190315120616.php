<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190315120616 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE server ADD project_id INT DEFAULT NULL, ADD created VARCHAR(255) NOT NULL, CHANGE live_date live_date DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE server ADD CONSTRAINT FK_5A6DD5F6166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('CREATE INDEX IDX_5A6DD5F6166D1F9C ON server (project_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE server DROP FOREIGN KEY FK_5A6DD5F6166D1F9C');
        $this->addSql('DROP INDEX IDX_5A6DD5F6166D1F9C ON server');
        $this->addSql('ALTER TABLE server DROP project_id, DROP created, CHANGE live_date live_date VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
    }
}
