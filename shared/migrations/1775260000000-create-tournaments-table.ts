import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTournamentsTable1775260000000 implements MigrationInterface {
  name = 'CreateTournamentsTable1775260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "tournament_visibility_enum" AS ENUM ('PUBLIC', 'PRIVATE')
    `);
    await queryRunner.query(`
      CREATE TYPE "tournament_status_enum" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')
    `);
    await queryRunner.query(`
      CREATE TABLE "tournaments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "title" character varying NOT NULL,
        "description" character varying,
        "visibility" "tournament_visibility_enum" NOT NULL,
        "rounds_count" integer NOT NULL,
        "status" "tournament_status_enum" NOT NULL DEFAULT 'DRAFT',
        "invite_token" uuid,
        "owner_id" uuid NOT NULL,
        CONSTRAINT "PK_tournaments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tournaments_owner_id"
          FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tournaments"`);
  }
}
