import type { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';

export interface CreateTournamentInput {
  title: string;
  description?: string;
  visibility: TournamentVisibility;
  roundsCount: number;
  ownerId: string;
}
