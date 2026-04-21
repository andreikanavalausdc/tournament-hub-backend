# Tournament Hub Backend

A NestJS REST API backend for managing tournaments, participants, and users with JWT authentication and real-time WebSocket support.

## Tech Stack

- **Runtime**: Node.js, TypeScript (ES2023)
- **Framework**: NestJS 11
- **Database**: PostgreSQL 17 via TypeORM
- **Cache / Sessions**: Redis 7 via ioredis
- **Auth**: JWT (access + refresh tokens) with Passport
- **API Docs**: Swagger (conditional via env)
- **i18n**: nestjs-i18n (English & Russian, fallback: Russian)
- **WebSockets**: @nestjs/websockets + socket.io
- **Containerization**: Docker Compose

## Project Structure

```
src/
  app.module.ts              # Root module
  main.ts                    # App entrypoint
  environment.ts             # Typed env vars (env-var)
  domain/
    auth/                    # JWT auth (login, refresh, logout)
    users/                   # User management
    tournaments/             # Tournament CRUD + participants + WebSocket gateway
      contracts/
        dto/                 # Request DTOs (class-validator)
        inputs/              # Internal service input interfaces (incl. join/leave room)
        payloads/            # WS server→client event payload interfaces
        rto/                 # Response transfer objects
      controllers/           # REST controllers
      entities/              # TypeORM entities
      enums/                 # Domain + WS event name enums
      gateway/               # TournamentGateway (@WebSocketGateway)
      guards/                # WsJwtGuard
      repositories/          # TypeORM repositories
      services/              # Domain services + WS services (events, presence, room-access, ws-jwt-auth)
  modules/
    fingerprint/             # Device fingerprint middleware
    redis/                   # Redis module wrapper (set/get/delete + sadd/srem/scard/sismember/smembers)
  i18n/
    en/                      # English translations
    ru/                      # Russian translations
shared/
  config/                    # TypeORM & migration configs
  constants/                 # Shared constants
  decorators/                # Custom decorators (Public, UserPayload, etc.)
  entities/                  # BaseEntity
  filters/                   # Global exception filters (AllExceptionFilter, WsExceptionFilter)
  helpers/                   # App setup helpers
  interceptors/              # Response interceptor
  interfaces/                # JWT payload interfaces
  migrations/                # TypeORM migrations
  repositories/              # BaseRepository
  rto/                       # Common response RTOs
  strategies/                # Custom snake_case naming strategy
  utils/                     # Utility functions
```

## Path Aliases

- `@src/*` → `./src/*`
- `@shared/*` → `./shared/*`

## Domain Modules

### Auth (`src/domain/auth/`)
- JWT-based authentication (access + refresh tokens)
- Guards: `AccessTokenGuard`, `RefreshTokenGuard`
- Strategies: `AccessTokenStrategy`, `RefreshTokenStrategy`
- Services: `AuthService`, `TokenService`

### Users (`src/domain/users/`)
- User entity with CRUD operations

### Tournaments (`src/domain/tournaments/`)
- Tournament entity: title, description, visibility (PUBLIC/PRIVATE), status (DRAFT/ACTIVE/COMPLETED/CANCELLED), rounds_count, invite_token, owner
- Tournament participants entity
- Invite token support for private tournaments
- **WebSocket gateway** (`gateway/tournament.gateway.ts`): JWT handshake auth, `tournament:join` / `tournament:leave` handlers, connection/disconnection lifecycle
- **Services**:
  - `TournamentEventsService` — server→client event emission facade (12 typed emit methods); exported for use by REST services
  - `TournamentPresenceService` — Redis-backed unique-user presence tracking (multi-tab aware)
  - `TournamentRoomAccessService` — participant-only room access validation
  - `WsJwtAuthService` — verifies JWT from `handshake.auth.token`
- **Guards**: `WsJwtGuard` — checks `client.data.user` on every `@SubscribeMessage` handler
- **Enums**: `TournamentClientEvent` (`tournament:join`, `tournament:leave`), `TournamentServerEvent` (12 server→client event names)
- **WS room format**: `tournament:{tournamentId}`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `APP_NODE_ENV` | Node environment | required |
| `APP_PORT` | HTTP port | `3001` |
| `APP_SWAGGER_ENABLED` | Enable Swagger UI | required |
| `JWT_SECRET` | JWT signing secret | required |
| `JWT_EXPIRES` | Access token TTL (seconds) | required |
| `JWT_REFRESH_EXPIRES` | Refresh token TTL (seconds) | required |
| `REDIS_URL` | Redis connection URL | optional |
| `REDIS_HOST` | Redis host | optional |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | optional |
| `DB_URL` | PostgreSQL connection URL | optional |
| `DB_HOST` | PostgreSQL host | optional |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_DATABASE` | Database name | optional |
| `DB_USERNAME` | Database user | optional |
| `DB_PASSWORD` | Database password | optional |

## Scripts

```bash
# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start with debug + watch mode

# Production
npm run build              # Compile TypeScript
npm run start:prod         # Run compiled output

# Docker
npm run docker:up          # Start PostgreSQL + Redis via Docker Compose

# Database Migrations
npm run mig:create --name=migration-name   # Create empty migration
npm run mig:generate --name=migration-name # Auto-generate migration from entities
npm run mig:run            # Run pending migrations
npm run mig:revert         # Revert last migration
npm run mig:show           # Show migration status

# Code Quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
```

## Database Migrations

Migrations live in `shared/migrations/` and are configured via `shared/config/orm-migration.config.ts`.

Existing migrations:
1. `1775252417337-create-users-table` — Creates `users` table
2. `1775260000000-create-tournaments-table` — Creates `tournaments` table with visibility/status enums
3. `1775260000001-create-tournament-participants-table` — Creates `tournament_participants` table

## Shared Utilities

- **`BaseEntity`** (`shared/entities/base.entity.ts`): Common `id`, `createdAt`, `updatedAt` fields (UUID primary key)
- **`BaseRepository`** (`shared/repositories/base.repository.ts`): Extended TypeORM repository
- **`AllExceptionFilter`**: Global filter mapping exceptions to structured responses
- **`WsExceptionFilter`** (`shared/filters/ws-exception.filter.ts`): Catches `WsException` and emits an `exception` event to the requesting socket
- **`ResponseInterceptor`**: Wraps all responses in a standard envelope
- **`@Public()`**: Decorator to skip JWT guard on specific routes
- **`@UserPayload()`**: Parameter decorator to extract JWT payload from request
- **`@ApiController()`**: Combines `@Controller` + Swagger tags
- **Custom snake_case naming strategy**: All DB columns auto-converted to snake_case

## Redis Usage

`RedisService` (`src/modules/redis/services/redis.service.ts`) wraps ioredis and is imported via `RedisModule`.

| Method | Description |
|---|---|
| `set(key, value, ttl?)` | Store JSON-serialized value with optional TTL |
| `get<T>(key)` | Retrieve and deserialize value |
| `delete(key)` | Delete a key |
| `sadd(key, ...members)` | Add members to a Redis Set |
| `srem(key, ...members)` | Remove members from a Redis Set |
| `scard(key)` | Count members in a Redis Set |
| `sismember(key, member)` | Check if a member exists in a Redis Set |
| `smembers(key)` | Get all members of a Redis Set |

**Key namespaces in use:**

| Namespace | Used by | Purpose |
|---|---|---|
| `{userId}:{fingerprint}` | `TokenService` | Store refresh tokens |
| `presence:{tournamentId}:sockets:{userId}` | `TournamentPresenceService` | Track open socket IDs per user per tournament |
| `presence:{tournamentId}:users` | `TournamentPresenceService` | Track unique online users per tournament |

## API Conventions

- Versioned controllers: `v1` suffix (e.g., `auth.controller.v1.ts`)
- All endpoints return a standard `CommonResponseRto` envelope
- HTTP exceptions mapped via `http-status-reverse.constant.ts`
- i18n error messages resolved from `i18n/en/` and `i18n/ru/` JSON files

## WebSocket Conventions

- Transport: Socket.IO via `@nestjs/platform-socket.io`
- Auth: JWT passed in `handshake.auth.token` (access token); invalid token → immediate `client.disconnect()`
- Room format: `tournament:{tournamentId}`
- Client→server messages: `tournament:join` / `tournament:leave` only (transport actions, not domain mutations)
- Domain mutations (join tournament, leave tournament, start, submit, vote) remain in REST
- Presence: tracked in Redis by unique user per tournament; multi-tab safe (user counted once even with multiple sockets)
- Disconnects: presence cleaned up automatically; `tournament:participant_left` is NOT emitted on disconnect (socket disconnect ≠ domain leave)
- Reconnect recovery: client must re-emit `tournament:join` and call `GET /tournaments/:id/full` to restore state; server never replays events
- All server→client payloads include `occurredAt: string` (ISO 8601)
- WsExceptionFilter emits `{ message }` on the `exception` event to the requesting socket only
