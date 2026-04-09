import { Body, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { ApiResponse } from '@shared/decorators/api-response.decorator';
import { UserPayload } from '@shared/decorators/user-payload.decorator';
import type { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { AccessTokenGuard } from '@src/domain/auth/guards/access-token.guard';
import { CreateTournamentBodyDTO } from '@src/domain/tournaments/contracts/dto/create-tournament-body.dto';
import { CreateTournamentRTO } from '@src/domain/tournaments/contracts/rto/create-tournament.rto';
import { TournamentService } from '@src/domain/tournaments/services/tournament.service';

@ApiTags('Tournaments')
@UseGuards(AccessTokenGuard)
@ApiController('tournaments', 1)
export class TournamentControllerV1 {
  constructor(private readonly tournamentService: TournamentService) {}

  @ApiOperation({ summary: 'Create tournament' })
  @ApiResponse(HttpStatus.CREATED, CreateTournamentRTO)
  @Post()
  async create(
    @Body() body: CreateTournamentBodyDTO,
    @UserPayload() user: JwtUserPayload,
  ): Promise<CreateTournamentRTO> {
    const input = {
      title: body.title,
      description: body.description,
      visibility: body.visibility,
      roundsCount: body.roundsCount,
      ownerId: user.id,
    };

    return this.tournamentService.create(input);
  }
}
