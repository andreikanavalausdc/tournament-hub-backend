import { NestFactory } from '@nestjs/core';
import { setAppSettings } from '@shared/helpers/set-app-settings.helper';
import { setUpAsyncApi } from '@shared/helpers/set-up-asyncapi.helper';
import { environment } from '@src/environment';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  let app = await NestFactory.create(AppModule);

  app = await setAppSettings(app, { enableSwagger: true });

  if (environment.app.swaggerEnabled) {
    setUpAsyncApi(app);
  }

  await app.listen(environment.app.port);
}

void bootstrap();
