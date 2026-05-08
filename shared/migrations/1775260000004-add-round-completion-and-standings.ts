import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoundCompletionAndStandings1775260000004 implements MigrationInterface {
  name = 'AddRoundCompletionAndStandings1775260000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      ADD "completed_at" TIMESTAMP WITH TIME ZONE
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_round_submissions"
      ADD "like_count" integer NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_round_submissions"
      ADD "dislike_count" integer NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_round_submissions"
      ADD "round_score" integer NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "tournament_participants"
      ADD "cumulative_score" integer NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "tournaments"
      ADD "winner_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "tournaments"
      ADD CONSTRAINT "FK_tournaments_winner_id"
        FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tournaments"
      DROP CONSTRAINT "FK_tournaments_winner_id"
    `);
    await queryRunner.query(`ALTER TABLE "tournaments" DROP COLUMN "winner_id"`);
    await queryRunner.query(`ALTER TABLE "tournament_participants" DROP COLUMN "cumulative_score"`);
    await queryRunner.query(`ALTER TABLE "tournament_round_submissions" DROP COLUMN "round_score"`);
    await queryRunner.query(`ALTER TABLE "tournament_round_submissions" DROP COLUMN "dislike_count"`);
    await queryRunner.query(`ALTER TABLE "tournament_round_submissions" DROP COLUMN "like_count"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "completed_at"`);
  }
}
