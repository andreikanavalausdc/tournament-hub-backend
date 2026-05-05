# План: запуск турнира и авто-переход `SUBMISSION -> VOTING`

## Кратко

Добавить запуск турнира и связать его с логикой раунда: владелец запускает турнир, если в нем минимум 4 участника, backend переводит турнир в `ACTIVE`, создает первый раунд в `SUBMISSION`, ставит дедлайн на 15/30/45 секунд и дальше автоматически переводит раунд в `VOTING` по таймеру или когда все активные подключенные участники отправили ответы.

## Что добавляется

- Поле в создании турнира:
  - `submissionDurationSeconds`
  - допустимые значения: `15`, `30`, `45`
- REST-методы:
  - `POST /tournaments/:id/start` - запуск турнира владельцем
  - `POST /tournaments/:id/leave` - выход из турнира только до запуска
  - `POST /rounds/:roundId/submissions` - создать/обновить ответ во время `SUBMISSION`
- Минимальные таблицы:
  - `tournament_rounds`
  - `tournament_round_submissions`
- In-memory registry таймеров для MVP.
- Сервис завершения submission-фазы с транзакционной защитой от двойного перехода.

## Запуск турнира

- Старт разрешен только владельцу турнира.
- Турнир можно стартовать только из `DRAFT`.
- Для старта нужно минимум 4 участника в `tournament_participants`.
- При старте:
  - `tournaments.status` становится `ACTIVE`
  - создается первый раунд:
    - `number = 1`
    - `phase = SUBMISSION`
    - `submissionDeadline = now + submissionDurationSeconds`
  - регистрируется deadline timer
  - эмитятся события:
    - `tournament:started`
    - `round:created`

## Запрет выхода после запуска

- Если турнир в `DRAFT`, участник может выйти.
- Если турнир в `ACTIVE`, выход запрещен до окончания.
- Если выходит владелец в `DRAFT`, выход запрещается, чтобы не оставлять турнир без owner.
- После успешного выхода из `DRAFT`:
  - удалить строку из `tournament_participants`
  - эмитить `tournament:participant_left`
  - вызвать `TournamentEventsService.ejectFromRoom(userId, tournamentId)`

## Завершение `SUBMISSION`

- После каждого успешного сохранения ответа:
  - проверить, что раунд еще в `SUBMISSION`
  - посчитать активных участников через `TournamentPresenceService.getCount(tournamentId)`
  - посчитать уникальных авторов ответов в текущем раунде
  - эмитить `round:progress_updated` только со счетчиками
  - если `activeCount > 0` и `submittedCount >= activeCount`, попытаться завершить фазу досрочно
- Если таймер истек раньше, он вызывает тот же общий метод завершения.
- Если `activeCount = 0`, досрочного завершения нет; фазу завершает дедлайн.

## Защита от гонок

- Использовать один общий метод `tryCompleteSubmissionPhase(roundId, reason)`.
- Внутри использовать TypeORM transaction.
- Брать `pessimistic_write` lock на строку раунда.
- Повторно проверять `phase === SUBMISSION` внутри транзакции.
- Если фаза уже не `SUBMISSION`, метод молча завершает работу как idempotent.
- При успешном завершении:
  - `phase = VOTING`
  - `submissionClosedAt = now`
  - таймер отменяется
  - эмитится `round:phase_changed`

## WebSocket-контракт

Имена событий должны соответствовать `docs`:

- `round:created`
- `round:phase_changed`
- `round:progress_updated`
- `voting:submission_revealed`
- `vote:progress_updated`
- `vote:finalized`
- `round:completed`

Минимальный payload для перехода фазы:

```ts
{
  tournamentId: string;
  roundId: string;
  roundNumber: number;
  previousPhase: TournamentRoundPhase.SUBMISSION;
  currentPhase: TournamentRoundPhase.VOTING;
  occurredAt: string;
}
```

Во время `SUBMISSION` нельзя эмитить контент ответов, только прогресс:

```ts
{
  tournamentId: string;
  roundId: string;
  phase: TournamentRoundPhase.SUBMISSION;
  submittedCount: number;
  totalActiveParticipants: number;
  occurredAt: string;
}
```

## Основные файлы реализации

- `src/domain/tournaments/entities/tournament-round.entity.ts`
- `src/domain/tournaments/entities/tournament-round-submission.entity.ts`
- `src/domain/tournaments/repositories/tournament-round.repository.ts`
- `src/domain/tournaments/repositories/tournament-round-submission.repository.ts`
- `src/domain/tournaments/services/submission-phase-deadline-registry.service.ts`
- `src/domain/tournaments/services/round-submission-phase.service.ts`
- `src/domain/tournaments/services/tournament-round-submission.service.ts`
- `src/domain/tournaments/controllers/tournament-round-submission.controller.v1.ts`
- `src/domain/tournaments/enums/submission-phase-completion-reason.enum.ts`
- `shared/migrations/1775260000002-create-tournament-rounds-and-submissions-table.ts`

## Проверка

- `npm run lint`
- `npm run build`
- старт запрещен не-владельцу
- старт запрещен при количестве участников меньше 4
- старт создает первый `SUBMISSION` round и ставит дедлайн
- после старта выйти из турнира нельзя
- до старта обычный участник может выйти
- дедлайн переводит раунд в `VOTING`
- последний активный участник завершает фазу досрочно
- после перехода в `VOTING` ответы нельзя менять
- параллельный дедлайн и последняя отправка не создают двойной переход
- WebSocket progress event не содержит submission content

## Не входит в эту задачу

- полный voting flow
- reveal конкретных submissions
- score calculation
- leaderboard
- завершение турнира
- BullMQ/Redis scheduler для дедлайнов
- frontend
