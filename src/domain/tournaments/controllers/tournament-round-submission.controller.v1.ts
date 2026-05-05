import { Body, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { APP_UUID_VERSION } from '@shared/constants/app.constants';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { ApiResponse } from '@shared/decorators/api-response.decorator';
import { UserPayload } from '@shared/decorators/user-payload.decorator';
import type { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { AccessTokenGuard } from '@src/domain/auth/guards/access-token.guard';
import { UpsertRoundSubmissionBodyDTO } from '@src/domain/tournaments/contracts/dto/upsert-round-submission-body.dto';
import { TournamentRoundSubmissionEntity } from '@src/domain/tournaments/entities/tournament-round-submission.entity';
import { TournamentRoundSubmissionService } from '@src/domain/tournaments/services/tournament-round-submission.service';

@ApiTags('Tournament rounds')
@UseGuards(AccessTokenGuard)
@ApiController('rounds', 1)
export class TournamentRoundSubmissionControllerV1 {
  constructor(private readonly submissionService: TournamentRoundSubmissionService) {}

  @ApiOperation({ summary: 'Create or update round submission' })
  @ApiResponse(HttpStatus.OK, TournamentRoundSubmissionEntity)
  @Post(':roundId/submissions')
  async upsert(
    @Param('roundId', new ParseUUIDPipe({ version: APP_UUID_VERSION })) roundId: string,
    @Body() body: UpsertRoundSubmissionBodyDTO,
    @UserPayload() user: JwtUserPayload,
  ): Promise<TournamentRoundSubmissionEntity> {
    return this.submissionService.upsert({
      roundId,
      authorId: user.id,
      content: body.content,
    });
  }
}
