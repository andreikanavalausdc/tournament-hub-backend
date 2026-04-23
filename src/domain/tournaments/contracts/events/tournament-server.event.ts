export enum TournamentServerEvent {
  PARTICIPANT_JOINED = 'tournament:participant_joined',
  PARTICIPANT_LEFT = 'tournament:participant_left',
  TOURNAMENT_STARTED = 'tournament:started',
  ROUND_CREATED = 'tournament:round_created',
  ROUND_PHASE_CHANGED = 'tournament:round_phase_changed',
  PRESENCE_UPDATED = 'tournament:presence_updated',
  ROUND_PROGRESS_UPDATED = 'tournament:round_progress_updated',
  VOTING_SUBMISSION_REVEALED = 'tournament:voting_submission_revealed',
  VOTE_PROGRESS_UPDATED = 'tournament:vote_progress_updated',
  VOTE_FINALIZED = 'tournament:vote_finalized',
  ROUND_COMPLETED = 'tournament:round_completed',
  TOURNAMENT_FINISHED = 'tournament:finished',
}

