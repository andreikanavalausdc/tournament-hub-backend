export interface CreateTournamentInput {
  title: string;
  description?: string;
  visibility: 'public' | 'private';
  roundsCount: number;
  ownerId: string;
}
