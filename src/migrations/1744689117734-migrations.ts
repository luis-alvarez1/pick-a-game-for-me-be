import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1744689117734 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create platforms table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "platform" (
                "id" SERIAL PRIMARY KEY,
                "name" text NOT NULL UNIQUE
            )
        `);

    // Create users table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" text NOT NULL DEFAULT 'Anon',
                "email" text NOT NULL UNIQUE,
                "password" text NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "role" text NOT NULL DEFAULT 'user',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

    // Create games table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "game" (
                "id" SERIAL PRIMARY KEY,
                "name" text NOT NULL,
                "completed" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "platformId" integer,
                CONSTRAINT "FK_game_platform" FOREIGN KEY ("platformId") 
                    REFERENCES "platform"("id") ON DELETE SET NULL ON UPDATE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "game"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform"`);
  }
}
