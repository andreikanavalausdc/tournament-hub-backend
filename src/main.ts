import { setAppSettings } from '@shared/helpers/set-app-settings.helper';
import { NestFactory } from '@nestjs/core';
import { environment } from '@src/environment';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  let app = await NestFactory.create(AppModule);

  app = await setAppSettings(app, { enableSwagger: true });

  await app.listen(environment.app.port);
}

void bootstrap();
