import { WsException } from '@nestjs/websockets';

export class BaseWsException extends WsException {
  constructor(
    private readonly errorType: string,
    private readonly errorMessage: string,
  ) {
    super(errorType);
  }

  override getError(): string | object {
    return {
      error: this.errorType,
      message: this.errorMessage,
    };
  }
}
