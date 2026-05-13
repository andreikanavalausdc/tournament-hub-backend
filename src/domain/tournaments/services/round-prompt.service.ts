import { randomInt } from 'node:crypto';

import { ConflictException, Injectable } from '@nestjs/common';
import { ROUND_PROMPTS } from '@src/domain/tournaments/constants/round-prompts.constant';
import type { TournamentRoundPrompt } from '@src/domain/tournaments/contracts/interfaces/round-prompt.interface';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { TournamentError } from '@src/domain/tournaments/enums/tournament-error.enum';
import { EntityManager } from 'typeorm';

export interface PersistedRoundPromptFields {
  promptKey: string;
  promptType: TournamentRoundPrompt['type'];
  promptContentEn: string;
  promptContentRu: string;
}

@Injectable()
export class RoundPromptService {
  async generateForTournament(tournamentId: string, entityManager: EntityManager): Promise<PersistedRoundPromptFields> {
    const usedPromptKeys = await this.findUsedPromptKeys(tournamentId, entityManager);
    const availablePrompts = ROUND_PROMPTS.filter((prompt) => !usedPromptKeys.has(prompt.key));

    if (availablePrompts.length === 0) {
      throw new ConflictException(TournamentError.NO_AVAILABLE_ROUND_PROMPTS);
    }

    const prompt = availablePrompts[randomInt(availablePrompts.length)];

    return {
      promptKey: prompt.key,
      promptType: prompt.type,
      promptContentEn: prompt.content.en,
      promptContentRu: prompt.content.ru,
    };
  }

  toPrompt(round: TournamentRoundEntity): TournamentRoundPrompt {
    return {
      key: round.promptKey,
      type: round.promptType,
      content: {
        en: round.promptContentEn,
        ru: round.promptContentRu,
      },
    };
  }

  private async findUsedPromptKeys(tournamentId: string, entityManager: EntityManager): Promise<Set<string>> {
    const rounds = await entityManager.find(TournamentRoundEntity, {
      where: { tournamentId },
      select: { promptKey: true },
    });

    return new Set(rounds.map((round) => round.promptKey));
  }
}
