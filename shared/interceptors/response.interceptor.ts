import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IGNORE_INTERCEPTOR } from '@shared/decorators/ignore.decorator';
import { CommonResponseRTO } from '@shared/rto/common-response.rto';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<CommonResponseRTO<unknown>> {
    const code = context.switchToHttp().getResponse()?.statusCode ?? 200;

    const ignoreInterceptor = this.reflector.get<boolean>(IGNORE_INTERCEPTOR, context.getHandler());

    if (ignoreInterceptor) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return {
          code,
          message: ['success'],
          data,
          error: null,
        };
      }),
    );
  }
}
