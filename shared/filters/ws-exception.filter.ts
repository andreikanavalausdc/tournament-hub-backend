import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  override catch(exception: WsException | HttpException, host: ArgumentsHost): void {
    const error = exception instanceof WsException ? exception.getError() : exception.getResponse();

    const details = typeof error === 'object' ? { ...error } : { message: error };

    const properException = new WsException(details);

    super.catch(properException, host);
  }
}
