import { TournamentParticipantJoinedPayload } from '@src/domain/tournaments/contracts/payloads/participant-joined.payload';
import { TournamentParticipantLeftPayload } from '@src/domain/tournaments/contracts/payloads/participant-left.payload';
import { TournamentPresenceUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/presence-updated.payload';
import { TournamentRoundCompletedPayload } from '@src/domain/tournaments/contracts/payloads/round-completed.payload';
import { TournamentRoundCreatedPayload } from '@src/domain/tournaments/contracts/payloads/round-created.payload';
import { TournamentRoundPhaseChangedPayload } from '@src/domain/tournaments/contracts/payloads/round-phase-changed.payload';
import { TournamentRoundProgressUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/round-progress-updated.payload';
import { TournamentFinishedPayload } from '@src/domain/tournaments/contracts/payloads/tournament-finished.payload';
import { TournamentStartedPayload } from '@src/domain/tournaments/contracts/payloads/tournament-started.payload';
import { TournamentVoteFinalizedPayload } from '@src/domain/tournaments/contracts/payloads/vote-finalized.payload';
import { TournamentVoteProgressUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/vote-progress-updated.payload';
import { TournamentVotingSubmissionRevealedPayload } from '@src/domain/tournaments/contracts/payloads/voting-submission-revealed.payload';

export type TournamentEventPayload =
  | TournamentParticipantJoinedPayload
  | TournamentParticipantLeftPayload
  | TournamentPresenceUpdatedPayload
  | TournamentRoundCompletedPayload
  | TournamentRoundCreatedPayload
  | TournamentRoundPhaseChangedPayload
  | TournamentRoundProgressUpdatedPayload
  | TournamentFinishedPayload
  | TournamentStartedPayload
  | TournamentVoteFinalizedPayload
  | TournamentVoteProgressUpdatedPayload
  | TournamentVotingSubmissionRevealedPayload;
