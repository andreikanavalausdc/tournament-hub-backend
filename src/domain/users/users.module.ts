import { Module } from '@nestjs/common';
import { UserControllerV1 } from '@src/domain/users/controllers/user.controller.v1';
import { UserRepository } from '@src/domain/users/repositories/user.repository';
import { PasswordHashingService } from '@src/domain/users/services/password-hashing.service';
import { UserService } from '@src/domain/users/services/user.service';

@Module({
  imports: [],
  controllers: [UserControllerV1],
  providers: [UserRepository, UserService, PasswordHashingService],
})
export class UsersModule {}
