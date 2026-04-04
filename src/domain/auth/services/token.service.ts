import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtTokens } from '@shared/interfaces/jwt-tokens.interface';
import { GenerateTokensInput } from '@src/domain/auth/contracts/inputs/generate-tokens.input';
import type { DeleteRefreshTokenParams } from '@src/domain/auth/contracts/params/delete-refresh-token.params';
import type { VerifyRefreshTokenParams } from '@src/domain/auth/contracts/params/verify-refresh-token.params';
import type { DeleteRefreshTokenPayload } from '@src/domain/auth/contracts/payloads/delete-refresh-token.payload';
import type { GenerateTokensPayload } from '@src/domain/auth/contracts/payloads/generate-tokens.payload';
import type { VerifyRefreshTokenPayload } from '@src/domain/auth/contracts/payloads/verify-refresh-token.payload';
import { environment } from '@src/environment';
import { RedisService } from '@src/modules/redis/services/redis.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async generate(input: GenerateTokensInput, payload: GenerateTokensPayload): Promise<JwtTokens> {
    const { userId } = input;
    const { fingerprint } = payload;

    const jwtPayload = {
      id: userId,
    };

    const accessToken = this.jwtService.sign(jwtPayload);
    const refreshToken = this.jwtService.sign(jwtPayload, { expiresIn: environment.jwt.refreshExpires });

    await this.redisService.set(
      this.getRefreshTokenKey(userId, fingerprint),
      refreshToken,
      environment.jwt.refreshExpires,
    );

    return { accessToken, refreshToken };
  }

  async deleteRefresh(params: DeleteRefreshTokenParams, payload: DeleteRefreshTokenPayload): Promise<void> {
    const { userId } = params;
    const { fingerprint } = payload;

    const key = this.getRefreshTokenKey(userId, fingerprint);

    await this.redisService.delete(key);
  }

  async verifyRefresh(params: VerifyRefreshTokenParams, payload: VerifyRefreshTokenPayload): Promise<void> {
    const { refreshToken, userId } = params;
    const { fingerprint } = payload;

    const key = this.getRefreshTokenKey(userId, fingerprint);

    const redisRefreshToken = await this.redisService.get<string>(key);

    if (redisRefreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }
  }

  private getRefreshTokenKey(userId: string, hash: string): string {
    return `${userId}:${hash}`;
  }
}
