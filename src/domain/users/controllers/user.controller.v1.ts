import { Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { ApiResponse } from '@shared/decorators/api-response.decorator';
import { UserPayload } from '@shared/decorators/user-payload.decorator';
import type { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { AccessTokenGuard } from '@src/domain/auth/guards/access-token.guard';
import { UserProfileRTO } from '@src/domain/users/contracts/rto/user-profile.rto';
import { UserService } from '@src/domain/users/services/user.service';

@ApiTags('Users')
@UseGuards(AccessTokenGuard)
@ApiController('users', 1)
export class UserControllerV1 {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get profile' })
  @ApiResponse(HttpStatus.OK, UserProfileRTO)
  @Get('profile')
  async getProfile(@UserPayload() user: JwtUserPayload): Promise<UserProfileRTO> {
    const dto = { id: user.id };

    return this.userService.getProfile(dto);
  }
}
