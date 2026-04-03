import { NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';

export class BaseRepository<Entity extends BaseEntity> extends Repository<Entity> {
  protected get tableAlias(): string {
    return this.metadata.tableName;
  }

  async getOneById(id: string): Promise<Entity> {
    const entity = await this.findOne({
      where: { id } as FindOptionsWhere<Entity>,
    });
    if (!entity) {
      throw new NotFoundException(`${this.tableAlias}.main.NOT_FOUND`);
    }

    return entity;
  }

  protected getBaseQuery(queryRunner?: QueryRunner): SelectQueryBuilder<Entity> {
    return this.createQueryBuilder(this.tableAlias, queryRunner);
  }
}
