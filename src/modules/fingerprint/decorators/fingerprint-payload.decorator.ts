import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Fingerprint } from '../interfaces/fingerprint.interface';

export const FingerprintPayload = createParamDecorator((_, ctx: ExecutionContext): Fingerprint => {
  const request: Request & { fp: string } = ctx.switchToHttp().getRequest();

  return { id: request.fp };
});
