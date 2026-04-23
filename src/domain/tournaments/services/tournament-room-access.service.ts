import { Injectable } from '@nestjs/common';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';

import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';
import { TournamentRepository } from '../repositories/tournament.repository';

interface TournamentJoinAccessResult {
  allowed: boolean;
  reason?: string;
}

@Injectable()
export class TournamentRoomAccessService {
  constructor(
    private readonly participantRepository: TournamentParticipantRepository,
    private readonly tournamentRepository: TournamentRepository,
  ) {}

  async canJoin(userId: string, tournamentId: string): Promise<TournamentJoinAccessResult> {
    const [record, tournament] = await Promise.all([
      this.participantRepository.findOne({ where: { userId, tournamentId } }),
      this.tournamentRepository.findOne({ where: { id: tournamentId } }),
    ]);

    if (!tournament) {
      return { allowed: false, reason: 'Tournament not found' };
    }

    if (!record) {
      const canJoinAsPublicViewer =
        tournament.visibility === TournamentVisibility.PUBLIC && tournament.status === TournamentStatus.ACTIVE;

      if (canJoinAsPublicViewer) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: 'You are not a participant. Join via REST POST /v1/tournaments/:id/join first',
      };
    }

    const hasUnfinishedParticipationElsewhere = await this.participantRepository.hasUnfinishedParticipation(
      userId,
      tournamentId,
    );

    if (hasUnfinishedParticipationElsewhere) {
      return { allowed: false, reason: 'You are already participating in another unfinished tournament' };
    }

    return { allowed: true };
  }
}
