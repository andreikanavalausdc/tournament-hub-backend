import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type { CreateTournamentInput } from '../contracts/inputs/create-tournament.input';
import { TournamentEntity } from '../entities/tournament.entity';
import { TournamentParticipantEntity } from '../entities/tournament-participant.entity';
import { TournamentError } from '../enums/tournament-error.enum';
import { TournamentRepository } from '../repositories/tournament.repository';
import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';

@Injectable()
export class TournamentService {
  constructor(
    private readonly repository: TournamentRepository,
    private readonly participantRepository: TournamentParticipantRepository,
  ) {}

  async create(input: CreateTournamentInput): Promise<TournamentEntity> {
    const { title, description, visibility, roundsCount, ownerId } = input;
    const inviteToken = visibility === 'private' ? randomUUID() : null;

    const tournament = this.repository.create({
      title,
      description: description ?? null,
      visibility,
      roundsCount,
      status: 'draft',
      inviteToken,
      ownerId,
    });

    try {
      return await this.repository.manager.transaction(async (em) => {
        const saved = await em.save(TournamentEntity, tournament);
        await em.save(TournamentParticipantEntity, { tournamentId: saved.id, userId: ownerId });
        return saved;
      });
    } catch {
      throw new BadRequestException(TournamentError.CREATION_FAILED);
    }
  }
}
