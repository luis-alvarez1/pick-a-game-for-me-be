import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1710000000000 implements MigrationInterface {
  name = 'InitialMigration1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const platformTableExists = await queryRunner.hasTable('platform');
    const userTableExists = await queryRunner.hasTable('user');
    const gameTableExists = await queryRunner.hasTable('game');

    if (!platformTableExists) {
      await queryRunner.query(
        `CREATE TABLE "platform" ("id" SERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_3426fc0d6b1c4b4d8f4e4e4e4e4" UNIQUE ("name"), CONSTRAINT "PK_3426fc0d6b1c4b4d8f4e4e4e4e4" PRIMARY KEY ("id"))`,
      );
    }

    if (!userTableExists) {
      await queryRunner.query(
        `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL DEFAULT 'Anon', "email" text NOT NULL, "password" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" integer NOT NULL, "role" text NOT NULL DEFAULT 'user', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
      );
    }

    if (!gameTableExists) {
      await queryRunner.query(
        `CREATE TABLE "game" ("id" SERIAL NOT NULL, "name" text NOT NULL, "completed" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "platformId" integer, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`,
      );
    }

    const gameTable = await queryRunner.getTable('game');
    const foreignKeyExists = gameTable?.foreignKeys.some(
      (fk) => fk.columnNames[0] === 'platformId',
    );

    if (!foreignKeyExists) {
      await queryRunner.query(
        `ALTER TABLE "game" ADD CONSTRAINT "FK_3426fc0d6b1c4b4d8f4e4e4e4e4" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const gameTable = await queryRunner.getTable('game');
    const foreignKeyExists = gameTable?.foreignKeys.some(
      (fk) => fk.columnNames[0] === 'platformId',
    );

    if (foreignKeyExists) {
      await queryRunner.query(
        `ALTER TABLE "game" DROP CONSTRAINT "FK_3426fc0d6b1c4b4d8f4e4e4e4e4"`,
      );
    }

    const platformTableExists = await queryRunner.hasTable('platform');
    const userTableExists = await queryRunner.hasTable('user');
    const gameTableExists = await queryRunner.hasTable('game');

    if (gameTableExists) {
      await queryRunner.query(`DROP TABLE "game"`);
    }
    if (userTableExists) {
      await queryRunner.query(`DROP TABLE "user"`);
    }
    if (platformTableExists) {
      await queryRunner.query(`DROP TABLE "platform"`);
    }
  }
}
