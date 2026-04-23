import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { environment } from '@src/environment';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async authenticate(client: Socket): Promise<JwtUserPayload | null> {
    try {
      const token: string | undefined = client.handshake.auth?.token ?? client.handshake.headers?.token;

      if (!token) {
        return null;
      }

      return this.jwtService.verify<JwtUserPayload>(token, {
        secret: environment.jwt.secret,
      });
    } catch {
      return null;
    }
  }
}
