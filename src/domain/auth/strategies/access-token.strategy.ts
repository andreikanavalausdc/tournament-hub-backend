import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { environment } from '@src/environment';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access-token') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: environment.jwt.secret,
    });
  }

  async validate(payload: JwtUserPayload): Promise<JwtUserPayload> {
    return payload;
  }
}
