import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTournamentParticipantsTable1775260000001 implements MigrationInterface {
  name = 'CreateTournamentParticipantsTable1775260000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tournament_participants" (
        "tournament_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tournament_participants"
          PRIMARY KEY ("tournament_id", "user_id"),
        CONSTRAINT "FK_tournament_participants_tournament_id"
          FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tournament_participants_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tournament_participants"`);
  }
}
