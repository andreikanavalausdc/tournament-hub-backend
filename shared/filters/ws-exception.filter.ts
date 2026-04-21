import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  override catch(exception: WsException, host: ArgumentsHost): void {
    const client: Socket = host.switchToWs().getClient();

    client.emit('exception', { message: exception.getError() });
  }
}

