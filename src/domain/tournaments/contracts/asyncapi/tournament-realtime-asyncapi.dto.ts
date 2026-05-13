import { ApiProperty } from '@nestjs/swagger';
import { TournamentRoundPromptType } from '@src/domain/tournaments/enums/tournament-round-prompt-type.enum';

class TournamentIdField {
  @ApiProperty({
    description: 'Tournament UUID.',
    example: '3f7a1c20-1c4b-4b28-9f92-b3f8d3c0e001',
    format: 'uuid',
  })
  tournamentId: string;
}

class OccurredAtField extends TournamentIdField {
  @ApiProperty({
    description: 'ISO 8601 timestamp when the event occurred.',
    example: '2026-04-20T12:00:00.000Z',
    format: 'date-time',
  })
  occurredAt: string;
}

export class TournamentRoomActionAsyncApiDto extends TournamentIdField {}

export class TournamentParticipantJoinedAsyncApiDto extends OccurredAtField {
  @ApiProperty({
    description: 'User UUID of the participant who joined.',
    example: 'a1b2c3d4-1111-4a22-8b33-123456789001',
    format: 'uuid',
  })
  userId: string;
}

export class TournamentParticipantLeftAsyncApiDto extends OccurredAtField {
  @ApiProperty({
    description: 'User UUID of the participant who left.',
    example: 'a1b2c3d4-1111-4a22-8b33-123456789001',
    format: 'uuid',
  })
  userId: string;
}

export class TournamentStartedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ enum: ['ACTIVE'], example: 'ACTIVE' })
  status: 'ACTIVE';

  @ApiProperty({ description: 'Configured number of tournament rounds.', example: 5, minimum: 1 })
  roundsCount: number;
}

export class RoundPromptContentAsyncApiDto {
  @ApiProperty({ example: 'The best way to impress an alien visiting Earth.' })
  en: string;

  @ApiProperty({ example: 'Лучший способ впечатлить инопланетянина, который прилетел на Землю.' })
  ru: string;
}

export class RoundPromptAsyncApiDto {
  @ApiProperty({ example: 'alien_impress' })
  key: string;

  @ApiProperty({ enum: TournamentRoundPromptType, example: TournamentRoundPromptType.TEXT })
  type: TournamentRoundPromptType.TEXT;

  @ApiProperty({ type: () => RoundPromptContentAsyncApiDto })
  content: RoundPromptContentAsyncApiDto;
}

export class RoundCreatedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ description: 'Round UUID.', example: 'c1a2b3c4-2222-4a22-8b33-123456789002', format: 'uuid' })
  roundId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  roundNumber: number;

  @ApiProperty({ enum: ['SUBMISSION'], example: 'SUBMISSION' })
  phase: 'SUBMISSION';

  @ApiProperty({ type: () => RoundPromptAsyncApiDto })
  prompt: RoundPromptAsyncApiDto;

  @ApiProperty({ example: '2026-04-20T12:10:00.000Z', format: 'date-time' })
  submissionDeadline: string;
}

export class RoundPhaseChangedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ description: 'Round UUID.', example: 'c1a2b3c4-2222-4a22-8b33-123456789002', format: 'uuid' })
  roundId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  roundNumber: number;

  @ApiProperty({
    description: 'This event is only used for SUBMISSION -> VOTING.',
    enum: ['SUBMISSION'],
    example: 'SUBMISSION',
  })
  previousPhase: 'SUBMISSION';

  @ApiProperty({
    description: 'This event is only used for SUBMISSION -> VOTING.',
    enum: ['VOTING'],
    example: 'VOTING',
  })
  currentPhase: 'VOTING';
}

export class TournamentPresenceUpdatedAsyncApiDto extends OccurredAtField {
  @ApiProperty({
    description: 'Unique active participants with at least one open socket in the room.',
    example: 5,
    minimum: 0,
  })
  activeCount: number;
}

export class RoundProgressUpdatedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ description: 'Round UUID.', example: 'c1a2b3c4-2222-4a22-8b33-123456789002', format: 'uuid' })
  roundId: string;

  @ApiProperty({ enum: ['SUBMISSION'], example: 'SUBMISSION' })
  phase: 'SUBMISSION';

  @ApiProperty({
    description: 'Number of received submissions. Raw submission content is not broadcast here.',
    example: 3,
    minimum: 0,
  })
  submittedCount: number;

  @ApiProperty({
    description: 'Connected active participants used for submission progress.',
    example: 6,
    minimum: 0,
  })
  totalActiveParticipants: number;
}

class VotingSubmissionAsyncApiDto {
  @ApiProperty({ description: 'Submission UUID.', example: 'd9e8f7a6-3333-4a22-8b33-123456789003', format: 'uuid' })
  id: string;

  @ApiProperty({
    description: 'Author user UUID. The author is not eligible to vote on this submission.',
    example: 'a1b2c3d4-1111-4a22-8b33-123456789001',
    format: 'uuid',
  })
  authorId: string;

  @ApiProperty({
    description: 'Submission content revealed only after the submission phase is closed.',
    example: 'My answer to the prompt',
  })
  content: string;

  @ApiProperty({ example: '2026-04-20T12:08:45.000Z', format: 'date-time' })
  submittedAt: string;
}

export class VotingSubmissionRevealedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ description: 'Round UUID.', example: 'c1a2b3c4-2222-4a22-8b33-123456789002', format: 'uuid' })
  roundId: string;

  @ApiProperty({ type: () => VotingSubmissionAsyncApiDto })
  submission: VotingSubmissionAsyncApiDto;

  @ApiProperty({ description: 'Zero-based reveal order index.', example: 0, minimum: 0 })
  revealIndex: number;

  @ApiProperty({ example: 7, minimum: 0 })
  totalSubmissions: number;

  @ApiProperty({ example: '2026-04-20T12:10:30.000Z', format: 'date-time' })
  votingDeadline: string;
}

export class VoteProgressUpdatedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ description: 'Round UUID.', example: 'c1a2b3c4-2222-4a22-8b33-123456789002', format: 'uuid' })
  roundId: string;

  @ApiProperty({
    description: 'Currently revealed submission UUID.',
    example: 'd9e8f7a6-3333-4a22-8b33-123456789003',
    format: 'uuid',
  })
  submissionId: string;

  @ApiProperty({ example: 4, minimum: 0 })
  votedCount: number;

  @ApiProperty({
    description: 'Eligible active voters for the current submission, excluding its author.',
    example: 5,
    minimum: 0,
  })
  totalEligibleActiveVoters: number;
}

export class VoteFinalizedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ description: 'Round UUID.', example: 'c1a2b3c4-2222-4a22-8b33-123456789002', format: 'uuid' })
  roundId: string;

  @ApiProperty({
    description: 'Finalized submission UUID.',
    example: 'd9e8f7a6-3333-4a22-8b33-123456789003',
    format: 'uuid',
  })
  submissionId: string;

  @ApiProperty({ example: 4, minimum: 0 })
  likeCount: number;

  @ApiProperty({ example: 1, minimum: 0 })
  dislikeCount: number;
}

class RoundRankingEntryAsyncApiDto {
  @ApiProperty({ example: 'd9e8f7a6-3333-4a22-8b33-123456789003', format: 'uuid' })
  submissionId: string;

  @ApiProperty({ example: 'a1b2c3d4-1111-4a22-8b33-123456789001', format: 'uuid' })
  authorId: string;

  @ApiProperty({ example: 4, minimum: 0 })
  likeCount: number;

  @ApiProperty({ example: 1, minimum: 0 })
  dislikeCount: number;

  @ApiProperty({ example: 3 })
  score: number;
}

class LeaderboardEntryAsyncApiDto {
  @ApiProperty({ example: 'a1b2c3d4-1111-4a22-8b33-123456789001', format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 12 })
  cumulativeScore: number;

  @ApiProperty({ example: 1, minimum: 1 })
  rank: number;
}

export class RoundCompletedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ description: 'Round UUID.', example: 'c1a2b3c4-2222-4a22-8b33-123456789002', format: 'uuid' })
  roundId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  roundNumber: number;

  @ApiProperty({ type: () => [RoundRankingEntryAsyncApiDto] })
  rankings: RoundRankingEntryAsyncApiDto[];

  @ApiProperty({ type: () => [LeaderboardEntryAsyncApiDto] })
  leaderboard: LeaderboardEntryAsyncApiDto[];

  @ApiProperty({ example: 2, nullable: true, minimum: 1 })
  nextRoundNumber: number | null;

  @ApiProperty({ example: false })
  isLastRound: boolean;
}

export class TournamentFinishedAsyncApiDto extends OccurredAtField {
  @ApiProperty({ enum: ['COMPLETED'], example: 'COMPLETED' })
  status: 'COMPLETED';

  @ApiProperty({ example: 'a1b2c3d4-1111-4a22-8b33-123456789001', format: 'uuid', nullable: true })
  overallWinnerId: string | null;

  @ApiProperty({ type: () => [LeaderboardEntryAsyncApiDto] })
  finalLeaderboard: LeaderboardEntryAsyncApiDto[];
}
