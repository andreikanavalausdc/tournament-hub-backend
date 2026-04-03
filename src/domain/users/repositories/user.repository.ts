import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from '@shared/repositories/base.repository';
import { UserEntity } from '@src/domain/users/entities/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(UserEntity, entityManager);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ where: { email } });
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.exists({ where: { username } });
  }
}
