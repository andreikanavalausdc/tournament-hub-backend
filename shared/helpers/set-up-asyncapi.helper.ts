import { INestApplication } from '@nestjs/common';
import { environment } from '@src/environment';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';

export function setUpAsyncApi<T extends INestApplication<unknown>>(app: T): void {
  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Mini Tournament Hub Realtime API')
    .setDescription(
      [
        'Authoritative tournament realtime contract generated from NestJS decorators via nestjs-asyncapi.',
        'The transport is Socket.IO. Server events are emitted to rooms named tournament:{tournamentId}.',
        'Client socket messages are transport-level room actions only; domain mutations and reconnect recovery use REST.',
      ].join('\n\n'),
    )
    .setVersion('1.0.0')
    .setDefaultContentType('application/json')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: "Socket.IO clients pass the access token as handshake auth: { auth: { token: '<accessToken>' } }.",
      },
      'jwt-auth',
    )
    .addServer('tournament-socket-io', {
      host: `localhost:${environment.app.port}`,
      protocol: 'socket.io',
      protocolVersion: '4',
      description: 'NestJS Socket.IO server. Logical AsyncAPI channels map to concrete Socket.IO event names.',
    })
    .addTag('tournaments', 'Tournament realtime events and Socket.IO room transport actions.')
    .build();

  const asyncApiDocument = AsyncApiModule.createDocument(app, asyncApiOptions);
  let html: string | null = null;
  let pendingHtml: Promise<string> | null = null;

  app.getHttpAdapter().get('/api-ws', async (_req, res) => {
    html ??= await (pendingHtml ??= AsyncApiModule.composeHtml(asyncApiDocument).finally(() => {
      pendingHtml = null;
    }));

    res.type('text/html');
    res.send(html);
  });
}
