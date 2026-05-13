import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoundPrompts1775260000005 implements MigrationInterface {
  name = 'AddRoundPrompts1775260000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "tournament_round_prompt_type_enum" AS ENUM ('TEXT')
    `);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" ADD "prompt_key" character varying`);
    await queryRunner.query(`
      ALTER TABLE "tournament_rounds"
      ADD "prompt_type" "tournament_round_prompt_type_enum"
    `);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" ADD "prompt_content_en" text`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" ADD "prompt_content_ru" text`);
    await queryRunner.query(`
      UPDATE "tournament_rounds"
      SET
        "prompt_key" = 'alien_impress',
        "prompt_type" = 'TEXT',
        "prompt_content_en" = 'The best way to impress an alien visiting Earth.',
        "prompt_content_ru" = 'Лучший способ впечатлить инопланетянина, который прилетел на Землю.'
      WHERE "prompt_key" IS NULL
    `);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" ALTER COLUMN "prompt_key" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" ALTER COLUMN "prompt_type" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" ALTER COLUMN "prompt_content_en" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" ALTER COLUMN "prompt_content_ru" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "prompt_content_ru"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "prompt_content_en"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "prompt_type"`);
    await queryRunner.query(`ALTER TABLE "tournament_rounds" DROP COLUMN "prompt_key"`);
    await queryRunner.query(`DROP TYPE "tournament_round_prompt_type_enum"`);
  }
}
