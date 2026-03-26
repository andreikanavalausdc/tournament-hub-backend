import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IGNORE_INTERCEPTOR = 'ignoreInterceptor';
export const IgnoreInterceptor = (): CustomDecorator<string> => SetMetadata(IGNORE_INTERCEPTOR, true);
