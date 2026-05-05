import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTournamentRoundsAndSubmissionsTable1775260000002 implements MigrationInterface {
  name = 'CreateTournamentRoundsAndSubmissionsTable1775260000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tournaments"
      ADD "submission_duration_seconds" integer NOT NULL DEFAULT 30
    `);
    await queryRunner.query(`
      CREATE TYPE "tournament_round_phase_enum" AS ENUM ('SUBMISSION', 'VOTING')
    `);
    await queryRunner.query(`
      CREATE TABLE "tournament_rounds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "tournament_id" uuid NOT NULL,
        "number" integer NOT NULL,
        "phase" "tournament_round_phase_enum" NOT NULL,
        "submission_deadline" TIMESTAMP WITH TIME ZONE NOT NULL,
        "submission_closed_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_tournament_rounds_tournament_number" UNIQUE ("tournament_id", "number"),
        CONSTRAINT "PK_tournament_rounds" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tournament_rounds_tournament_id"
          FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "tournament_round_submissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "round_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "content" text NOT NULL,
        "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "UQ_tournament_round_submissions_round_author" UNIQUE ("round_id", "author_id"),
        CONSTRAINT "PK_tournament_round_submissions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tournament_round_submissions_round_id"
          FOREIGN KEY ("round_id") REFERENCES "tournament_rounds"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tournament_round_submissions_author_id"
          FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tournament_round_submissions"`);
    await queryRunner.query(`DROP TABLE "tournament_rounds"`);
    await queryRunner.query(`DROP TYPE "tournament_round_phase_enum"`);
    await queryRunner.query(`ALTER TABLE "tournaments" DROP COLUMN "submission_duration_seconds"`);
  }
}
