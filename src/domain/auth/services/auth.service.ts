import { Injectable } from '@nestjs/common';
import type { LoginInput } from '@src/domain/auth/contracts/inputs/login.input';
import type { RegisterInput } from '@src/domain/auth/contracts/inputs/register.input';
import type { LogoutParams } from '@src/domain/auth/contracts/params/logout.params';
import type { RefreshParams } from '@src/domain/auth/contracts/params/refresh.params';
import type { LoginPayload } from '@src/domain/auth/contracts/payloads/login.payload';
import type { LogoutPayload } from '@src/domain/auth/contracts/payloads/logout.payload';
import type { RefreshPayload } from '@src/domain/auth/contracts/payloads/refresh.payload';
import type { RegisterPayload } from '@src/domain/auth/contracts/payloads/register.payload';
import type { JwtRTO } from '@src/domain/auth/contracts/rto/jwt.rto';
import { TokenService } from '@src/domain/auth/services/token.service';
import { UserService } from '@src/domain/users/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(input: RegisterInput, payload: RegisterPayload): Promise<JwtRTO> {
    const { email, username, password } = input;
    const { fingerprint } = payload;

    const { id: userId } = await this.userService.create({ email, username, password });

    const { accessToken, refreshToken } = await this.tokenService.generate({ userId }, { fingerprint });

    return { accessToken, refreshToken };
  }

  async login(input: LoginInput, payload: LoginPayload): Promise<JwtRTO> {
    const { email, password } = input;
    const { fingerprint } = payload;

    const { id: userId } = await this.userService.validate({ email, password });

    const { accessToken, refreshToken } = await this.tokenService.generate({ userId }, { fingerprint });

    return { accessToken, refreshToken };
  }

  async refresh(params: RefreshParams, payload: RefreshPayload): Promise<JwtRTO> {
    const { refreshToken, userId } = params;
    const { fingerprint } = payload;

    await this.tokenService.verifyRefresh({ refreshToken, userId }, { fingerprint });

    const { accessToken, refreshToken: newRefreshToken } = await this.tokenService.generate(
      { userId },
      { fingerprint },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(params: LogoutParams, payload: LogoutPayload): Promise<boolean> {
    const { userId } = params;
    const { fingerprint } = payload;

    await this.tokenService.deleteRefresh({ userId }, { fingerprint });

    return true;
  }
}
