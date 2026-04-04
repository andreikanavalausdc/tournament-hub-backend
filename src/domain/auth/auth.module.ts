import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthControllerV1 } from '@src/domain/auth/controllers/auth.controller.v1';
import { AuthService } from '@src/domain/auth/services/auth.service';
import { TokenService } from '@src/domain/auth/services/token.service';
import { AccessTokenStrategy } from '@src/domain/auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '@src/domain/auth/strategies/refresh-token.strategy';
import { UsersModule } from '@src/domain/users/users.module';
import { environment } from '@src/environment';
import { RedisModule } from '@src/modules/redis/redis.module';

@Module({
  imports: [
    JwtModule.register({
      secret: environment.jwt.secret,
      signOptions: { expiresIn: environment.jwt.expires },
    }),
    UsersModule,
    RedisModule,
  ],
  controllers: [AuthControllerV1],
  providers: [AuthService, TokenService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
