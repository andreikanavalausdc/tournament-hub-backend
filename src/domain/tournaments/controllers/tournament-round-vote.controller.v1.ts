import { Body, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { APP_UUID_VERSION } from '@shared/constants/app.constants';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { ApiResponse } from '@shared/decorators/api-response.decorator';
import { UserPayload } from '@shared/decorators/user-payload.decorator';
import type { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { AccessTokenGuard } from '@src/domain/auth/guards/access-token.guard';
import { UpsertRoundVoteBodyDTO } from '@src/domain/tournaments/contracts/dto/upsert-round-vote-body.dto';
import { TournamentRoundVoteEntity } from '@src/domain/tournaments/entities/tournament-round-vote.entity';
import { TournamentRoundVoteService } from '@src/domain/tournaments/services/tournament-round-vote.service';

@ApiTags('Tournament rounds')
@UseGuards(AccessTokenGuard)
@ApiController('rounds', 1)
export class TournamentRoundVoteControllerV1 {
  constructor(private readonly voteService: TournamentRoundVoteService) {}

  @ApiOperation({ summary: 'Create or update vote for currently revealed round submission' })
  @ApiResponse(HttpStatus.OK, TournamentRoundVoteEntity)
  @Post(':roundId/votes')
  async upsert(
    @Param('roundId', new ParseUUIDPipe({ version: APP_UUID_VERSION })) roundId: string,
    @Body() body: UpsertRoundVoteBodyDTO,
    @UserPayload() user: JwtUserPayload,
  ): Promise<TournamentRoundVoteEntity> {
    return this.voteService.upsertManualVote({
      roundId,
      submissionId: body.submissionId,
      voterId: user.id,
      value: body.value,
    });
  }
}
