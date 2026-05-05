## Plan: Live Lobby Presence Tracking

Keep Redis as the mandatory source of truth for live presence and wire join/leave/disconnect flows so `tournament:presence_updated` always reflects unique active users per tournament. The plan keeps domain mutations in REST, keeps WebSocket as transport-only, and adds Redis-backed utilities for affected tournament detection on disconnect.

### Steps
1. Keep `TournamentPresenceService` in `src/domain/tournaments/services/tournament-presence.service.ts` Redis-based and preserve multi-socket semantics (user counted once per tournament even with multiple sockets).
2. Extend `TournamentPresenceService` with utility methods for disconnect cleanup by socket: add a reverse index and implement `removeSocketFromAllTournaments(socketId, userId)` to return affected tournament IDs.
3. Standardize Redis keys for presence operations: `presence:{tournamentId}:sockets:{userId}`, `presence:{tournamentId}:users`, and `presence:socket:{socketId}:tournaments` (for disconnect fan-out).
4. Update `TournamentGateway` in `src/domain/tournaments/gateways/tournament.gateway.ts` to use Redis presence methods on `tournament:join`, `tournament:leave`, and `handleDisconnect`, with idempotent join handling and deduplicated emits.
5. Keep lightweight payload contract in `src/domain/tournaments/contracts/payloads/presence-updated.payload.ts` as `{ tournamentId, activeCount, occurredAt }` and emit through `TournamentEventsService.emitPresenceUpdated`.
6. Ensure cleanup logic removes empty Redis sets/index entries and emits `tournament:presence_updated` once per affected tournament after connectivity changes.

### Further Considerations
1. Use Redis transactions/Lua for atomic multi-key updates (`users` set + per-user sockets set + socket reverse index) to avoid race conditions under rapid reconnects.
2. Decide whether to emit `tournament:presence_updated` only on effective count changes or on every transport change; count-change-only reduces event noise.
3. If queue-based broadcasting remains in `TournamentEventsService`, validate acceptable latency for rapid connect/disconnect bursts in lobby UX.
