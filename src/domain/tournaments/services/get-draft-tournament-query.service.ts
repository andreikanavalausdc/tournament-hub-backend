import { Injectable, NotFoundException } from '@nestjs/common';
import { GetDraftTournamentsQueryDTO } from '@src/domain/tournaments/contracts/dto/get-draft-tournaments-query.dto';
import {
  DraftTournamentDetailsRTO,
  DraftTournamentListItemRTO,
} from '@src/domain/tournaments/contracts/rto/draft-tournament.rto';
import { TournamentParticipantEntity } from '@src/domain/tournaments/entities/tournament-participant.entity';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';

import { TournamentRepository } from '../repositories/tournament.repository';

export interface PaginatedDraftTournamentsRTO {
  items: DraftTournamentListItemRTO[];
  totalCount: number;
}

@Injectable()
export class GetDraftTournamentQueryService {
  constructor(private readonly tournamentRepository: TournamentRepository) {}

  async findAll(query: GetDraftTournamentsQueryDTO): Promise<PaginatedDraftTournamentsRTO> {
    const { page, limit } = query;
    const [tournaments, totalCount] = await this.tournamentRepository.findAndCount({
      where: { status: TournamentStatus.DRAFT },
      order: { createdAt: 'DESC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (tournaments.length === 0) {
      return { items: [], totalCount };
    }

    const participantCounts = await this.loadParticipantCounts(tournaments.map((tournament) => tournament.id));

    return {
      items: tournaments.map((tournament) => ({
        id: tournament.id,
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt,
        title: tournament.title,
        description: tournament.description,
        visibility: tournament.visibility,
        status: TournamentStatus.DRAFT,
        roundsCount: tournament.roundsCount,
        submissionDurationSeconds: tournament.submissionDurationSeconds,
        voteDurationSeconds: tournament.voteDurationSeconds,
        ownerId: tournament.ownerId,
        participantCount: participantCounts.get(tournament.id) ?? 0,
      })),
      totalCount,
    };
  }

  async getOneById(tournamentId: string): Promise<DraftTournamentDetailsRTO> {
    const tournament = await this.tournamentRepository.getOneById(tournamentId);

    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new NotFoundException(`${this.tournamentRepository.metadata.tableName}.main.NOT_FOUND`);
    }

    const participants = await this.tournamentRepository.manager.find(TournamentParticipantEntity, {
      where: { tournamentId },
      order: { createdAt: 'ASC', userId: 'ASC' },
    });

    return {
      id: tournament.id,
      createdAt: tournament.createdAt,
      updatedAt: tournament.updatedAt,
      title: tournament.title,
      description: tournament.description,
      visibility: tournament.visibility,
      status: TournamentStatus.DRAFT,
      roundsCount: tournament.roundsCount,
      submissionDurationSeconds: tournament.submissionDurationSeconds,
      voteDurationSeconds: tournament.voteDurationSeconds,
      ownerId: tournament.ownerId,
      participantCount: participants.length,
      participants: participants.map((participant) => ({
        userId: participant.userId,
        cumulativeScore: participant.cumulativeScore,
      })),
    };
  }

  private async loadParticipantCounts(tournamentIds: string[]): Promise<Map<string, number>> {
    const rows = await this.tournamentRepository.manager
      .createQueryBuilder()
      .select('participant.tournament_id', 'tournamentId')
      .addSelect('COUNT(*)', 'participantCount')
      .from('tournament_participants', 'participant')
      .where('participant.tournament_id IN (:...tournamentIds)', { tournamentIds })
      .groupBy('participant.tournament_id')
      .getRawMany<{ tournamentId: string; participantCount: string }>();

    return new Map(rows.map((row) => [row.tournamentId, Number(row.participantCount)]));
  }
}
