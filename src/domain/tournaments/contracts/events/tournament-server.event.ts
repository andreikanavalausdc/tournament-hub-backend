export enum TournamentServerEvent {
  PARTICIPANT_JOINED = 'tournament:participant_joined',
  PARTICIPANT_LEFT = 'tournament:participant_left',
  TOURNAMENT_STARTED = 'tournament:started',
  ROUND_CREATED = 'round:created',
  ROUND_PHASE_CHANGED = 'round:phase_changed',
  PRESENCE_UPDATED = 'tournament:presence_updated',
  ROUND_PROGRESS_UPDATED = 'round:progress_updated',
  VOTING_SUBMISSION_REVEALED = 'voting:submission_revealed',
  VOTE_PROGRESS_UPDATED = 'vote:progress_updated',
  VOTE_FINALIZED = 'vote:finalized',
  ROUND_COMPLETED = 'round:completed',
  TOURNAMENT_FINISHED = 'tournament:finished',
}
