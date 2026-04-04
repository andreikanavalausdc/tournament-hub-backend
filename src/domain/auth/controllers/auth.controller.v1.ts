import { Body, Delete, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiController } from '@shared/decorators/api-controller.decorator';
import { ApiResponse } from '@shared/decorators/api-response.decorator';
import { UserPayload } from '@shared/decorators/user-payload.decorator';
import type { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { LoginBodyDTO } from '@src/domain/auth/contracts/dto/login-body.dto';
import { RefreshBodyDTO } from '@src/domain/auth/contracts/dto/refresh-body.dto';
import { RegisterBodyDTO } from '@src/domain/auth/contracts/dto/register-body.dto';
import { JwtRTO } from '@src/domain/auth/contracts/rto/jwt.rto';
import { AccessTokenGuard } from '@src/domain/auth/guards/access-token.guard';
import { RefreshTokenGuard } from '@src/domain/auth/guards/refresh-token.guard';
import { AuthService } from '@src/domain/auth/services/auth.service';
import { FingerprintPayload } from '@src/modules/fingerprint/decorators/fingerprint-payload.decorator';
import type { Fingerprint } from '@src/modules/fingerprint/interfaces/fingerprint.interface';

@ApiTags('Auth')
@ApiController('auth', 1)
export class AuthControllerV1 {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse(HttpStatus.CREATED, JwtRTO)
  @Post('register')
  async register(@Body() body: RegisterBodyDTO, @FingerprintPayload() fingerprint: Fingerprint): Promise<JwtRTO> {
    const input = {
      email: body.email,
      username: body.username,
      password: body.password,
    };
    const payload = {
      fingerprint: fingerprint.id,
    };

    return this.authService.register(input, payload);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiResponse(HttpStatus.CREATED, JwtRTO)
  @Post('login')
  async login(@Body() body: LoginBodyDTO, @FingerprintPayload() fingerprint: Fingerprint): Promise<JwtRTO> {
    const input = {
      email: body.email,
      password: body.password,
    };
    const payload = {
      fingerprint: fingerprint.id,
    };

    return this.authService.login(input, payload);
  }

  @ApiOperation({ summary: 'Refresh jwt tokens' })
  @ApiResponse(HttpStatus.CREATED, JwtRTO)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Body() body: RefreshBodyDTO,
    @UserPayload() user: JwtUserPayload,
    @FingerprintPayload() fingerprint: Fingerprint,
  ): Promise<JwtRTO> {
    const params = {
      refreshToken: body.refreshToken,
      userId: user.id,
    };
    const payload = {
      fingerprint: fingerprint.id,
    };

    return this.authService.refresh(params, payload);
  }

  @ApiOperation({ summary: 'Logout' })
  @ApiResponse(HttpStatus.OK, Boolean, { primitive: 'boolean' })
  @UseGuards(AccessTokenGuard)
  @Delete('logout')
  async logout(@UserPayload() user: JwtUserPayload, @FingerprintPayload() fingerprint: Fingerprint): Promise<boolean> {
    const params = {
      userId: user.id,
    };
    const payload = {
      fingerprint: fingerprint.id,
    };

    return this.authService.logout(params, payload);
  }
}
