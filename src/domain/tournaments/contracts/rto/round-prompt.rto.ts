import { ApiProperty } from '@nestjs/swagger';
import { TournamentRoundPromptType } from '@src/domain/tournaments/enums/tournament-round-prompt-type.enum';

export class RoundPromptContentRTO {
  @ApiProperty({ description: 'English prompt text' })
  en: string;

  @ApiProperty({ description: 'Russian prompt text' })
  ru: string;
}

export class RoundPromptRTO {
  @ApiProperty({ description: 'Stable prompt key' })
  key: string;

  @ApiProperty({ enum: TournamentRoundPromptType, description: 'Prompt content type' })
  type: TournamentRoundPromptType.TEXT;

  @ApiProperty({ type: () => RoundPromptContentRTO })
  content: RoundPromptContentRTO;
}
