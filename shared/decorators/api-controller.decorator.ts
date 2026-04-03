import { applyDecorators, Controller } from '@nestjs/common';

export function ApiController(postfix: string, version: number): ClassDecorator {
  return applyDecorators(Controller({ path: `api/v${version}/${postfix}` }));
}
