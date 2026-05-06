import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSequentialVotingFlow1775260000003 implements MigrationInterface {
  name = 'AddSequentialVotingFlow1775260000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tournaments"
      ADD "vote_duration_seconds" integer NOT NULL DEFAULT 30
    `);
    await queryRunner.query(`
      CREATE TYPE "tournament_round_voting_step_status_enum" AS ENUM ('IDLE', 'OPEN', 'FINALIZING', 'FINISHED')
    `);
    await queryRunner.query(`
      CREATE TYPE "tournament_vote_value_enum" AS ENUM ('LIKE', 'DISLIKE')
    `);
    await queryRunner.query(`
      CREATE TYPE "tournament_vote_source_enum" AS ENUM ('MANUAL', 'AUTO_TIMEOUT')
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      ADD "current_voting_submission_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      ADD "current_reveal_index" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      ADD "voting_deadline" TIMESTAMP WITH TIME ZONE
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      ADD "voting_step_status" "tournament_round_voting_step_status_enum" NOT NULL DEFAULT 'IDLE'
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      ADD "voting_completed_at" TIMESTAMP WITH TIME ZONE
    `);
    await queryRunner.query(`
      CREATE TABLE "tournament_round_votes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "round_id" uuid NOT NULL,
        "submission_id" uuid NOT NULL,
        "voter_id" uuid NOT NULL,
        "value" "tournament_vote_value_enum" NOT NULL,
        "source" "tournament_vote_source_enum" NOT NULL,
        "voted_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "UQ_tournament_round_votes_round_submission_voter" UNIQUE ("round_id", "submission_id", "voter_id"),
        CONSTRAINT "PK_tournament_round_votes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tournament_round_votes_round_id"
          FOREIGN KEY ("round_id") REFERENCES "tournament_rounds"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tournament_round_votes_submission_id"
          FOREIGN KEY ("submission_id") REFERENCES "tournament_round_submissions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tournament_round_votes_voter_id"
          FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      ADD CONSTRAINT "FK_tournament_rounds_current_voting_submission_id"
        FOREIGN KEY ("current_voting_submission_id") REFERENCES "tournament_round_submissions"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      DROP CONSTRAINT "FK_tournament_rounds_current_voting_submission_id"
    `);
    await queryRunner.query(`DROP TABLE "tournament_round_votes"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "voting_completed_at"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "voting_step_status"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "voting_deadline"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "current_reveal_index"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "current_voting_submission_id"`);
    await queryRunner.query(`DROP TYPE "tournament_vote_source_enum"`);
    await queryRunner.query(`DROP TYPE "tournament_vote_value_enum"`);
    await queryRunner.query(`DROP TYPE "tournament_round_voting_step_status_enum"`);
    await queryRunner.query(`ALTER TABLE "tournaments" DROP COLUMN "vote_duration_seconds"`);
  }
}
