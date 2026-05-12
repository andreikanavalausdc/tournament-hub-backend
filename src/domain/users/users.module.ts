import { Module } from '@nestjs/common';
import { TournamentsModule } from '@src/domain/tournaments/tournaments.module';
import { UserControllerV1 } from '@src/domain/users/controllers/user.controller.v1';
import { UserRepository } from '@src/domain/users/repositories/user.repository';
import { GetLiveTournamentQueryService } from '@src/domain/users/services/get-live-tournament-query.service';
import { PasswordHashingService } from '@src/domain/users/services/password-hashing.service';
import { UserService } from '@src/domain/users/services/user.service';

@Module({
  imports: [TournamentsModule],
  controllers: [UserControllerV1],
  providers: [UserRepository, UserService, PasswordHashingService, GetLiveTournamentQueryService],
  exports: [UserService],
})
export class UsersModule {}
