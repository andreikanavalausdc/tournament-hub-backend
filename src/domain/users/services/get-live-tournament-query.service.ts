import { Injectable } from '@nestjs/common';
import { TournamentParticipantRepository } from '@src/domain/tournaments/repositories/tournament-participant.repository';
import { GetLiveTournamentResponseRTO } from '@src/domain/users/contracts/rto/get-live-tournament-response.rto';

@Injectable()
export class GetLiveTournamentQueryService {
  constructor(private readonly participantRepository: TournamentParticipantRepository) {}

  async execute(userId: string): Promise<GetLiveTournamentResponseRTO> {
    const tournament = await this.participantRepository.findActiveLiveTournamentByUserId(userId);

    if (!tournament) {
      return {
        hasActiveTournament: false,
        tournament: null,
      };
    }

    return {
      hasActiveTournament: true,
      tournament,
    };
  }
}
