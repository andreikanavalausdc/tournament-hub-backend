import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { FingerprintMiddleware } from './middlewares/fingerprint.middleware';
import { FingerprintService } from './services/fingerprint.service';

@Module({
  providers: [FingerprintService],
  exports: [FingerprintService],
})
export class FingerprintModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(FingerprintMiddleware).forRoutes('*');
  }
}
