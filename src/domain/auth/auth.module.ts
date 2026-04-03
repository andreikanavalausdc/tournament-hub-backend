import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '@src/domain/auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '@src/domain/auth/strategies/refresh-token.strategy';
import { environment } from '@src/environment';

@Module({
  imports: [
    JwtModule.register({
      secret: environment.jwt.secret,
      signOptions: { expiresIn: environment.jwt.expires },
    }),
  ],
  providers: [AccessTokenStrategy, RefreshTokenStrategy],
  exports: [],
})
export class AuthModule {}
