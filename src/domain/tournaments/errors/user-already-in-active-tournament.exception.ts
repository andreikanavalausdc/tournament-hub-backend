import { ConflictException } from '@nestjs/common';
import { getExceptionWithArgs } from '@shared/helpers/get-exception-with-args.helper';

import { TournamentError } from '../enums/tournament-error.enum';
import { TournamentParticipationErrorCode } from './tournament-participation-error-code.enum';

export class UserAlreadyInActiveTournamentException extends ConflictException {
  constructor(activeTournamentId: string) {
    super({
      message: getExceptionWithArgs(TournamentError.USER_ALREADY_IN_ACTIVE_TOURNAMENT, { activeTournamentId }),
      error: TournamentParticipationErrorCode.USER_ALREADY_IN_ACTIVE_TOURNAMENT,
    });
  }
}
