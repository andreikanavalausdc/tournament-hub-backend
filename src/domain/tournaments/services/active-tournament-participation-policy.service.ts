import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

import { UserAlreadyInActiveTournamentException } from '../errors/user-already-in-active-tournament.exception';
import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';

@Injectable()
export class ActiveTournamentParticipationPolicyService {
  constructor(private readonly participantRepository: TournamentParticipantRepository) {}

  async assertNoOtherActiveTournament(
    userId: string,
    excludeTournamentId?: string,
    manager?: EntityManager,
  ): Promise<void> {
    const activeParticipation = await this.participantRepository.findActiveTournamentParticipationByUserId(
      userId,
      excludeTournamentId,
      manager,
    );

    if (activeParticipation) {
      throw new UserAlreadyInActiveTournamentException(activeParticipation.tournamentId);
    }
  }

  async assertParticipantsHaveNoOtherActiveTournament(
    userIds: string[],
    excludeTournamentId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const uniqueUserIds = [...new Set(userIds)];

    for (const userId of uniqueUserIds) {
      await this.assertNoOtherActiveTournament(userId, excludeTournamentId, manager);
    }
  }
}
