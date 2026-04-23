import { Injectable, ValidationPipe } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { WsError } from '@shared/enums/ws-error.enum';
import { BaseWsException } from '@shared/exceptions/base-ws.exception';
import { ValidationError } from 'class-validator';

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  createExceptionFactory() {
    return (validationErrors: ValidationError[] = []): BaseWsExceptionFilter => {
      if (this.isDetailedOutputDisabled) {
        return new BaseWsExceptionFilter();
      }

      const errors = this.flattenValidationErrors(validationErrors);

      throw new BaseWsException(WsError.VALIDATION_ERROR, errors.join(', '));
    };
  }
}
