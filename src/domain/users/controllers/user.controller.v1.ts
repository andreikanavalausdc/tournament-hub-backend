import { Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { ApiResponse } from '@shared/decorators/api-response.decorator';
import { UserPayload } from '@shared/decorators/user-payload.decorator';
import type { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { AccessTokenGuard } from '@src/domain/auth/guards/access-token.guard';
import { GetLiveTournamentResponseRTO } from '@src/domain/users/contracts/rto/get-live-tournament-response.rto';
import { UserProfileRTO } from '@src/domain/users/contracts/rto/user-profile.rto';
import { GetLiveTournamentQueryService } from '@src/domain/users/services/get-live-tournament-query.service';
import { UserService } from '@src/domain/users/services/user.service';

@ApiTags('Users')
@UseGuards(AccessTokenGuard)
@ApiController('users', 1)
export class UserControllerV1 {
  constructor(
    private readonly userService: UserService,
    private readonly getLiveTournamentQueryService: GetLiveTournamentQueryService,
  ) {}

  @ApiOperation({ summary: 'Get profile' })
  @ApiResponse(HttpStatus.OK, UserProfileRTO)
  @Get('profile')
  async getProfile(@UserPayload() user: JwtUserPayload): Promise<UserProfileRTO> {
    const dto = { id: user.id };

    return this.userService.getProfile(dto);
  }

  @ApiOperation({ summary: 'Get current active live tournament' })
  @ApiResponse(HttpStatus.OK, GetLiveTournamentResponseRTO)
  @Get('me/live-tournament')
  async getLiveTournament(@UserPayload() user: JwtUserPayload): Promise<GetLiveTournamentResponseRTO> {
    return this.getLiveTournamentQueryService.execute(user.id);
  }
}
