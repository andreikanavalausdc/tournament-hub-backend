import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ResponseInterceptor } from '@shared/interceptors/response.interceptor';
import { Reflector } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared/filters/all-exception.filter';
import { environment } from '@src/environment';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setAppSettings = async (
  app: INestApplication,
  options: { enableSwagger: boolean },
): Promise<INestApplication> => {
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));

  if (options.enableSwagger) {
    setUpSwagger(app);
  }

  app.enableShutdownHooks();
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  return app;
};

function setUpSwagger<T extends INestApplication<unknown>>(app: T): void {
  if (environment.app.nodeEnv === 'production') {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FIT S3 API')
    .setDescription('FIT S3 API routes')
    .setVersion('1.0')
    .addCookieAuth('session_id')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
    },
  });
}
