import { TournamentRoundPromptType } from '@src/domain/tournaments/enums/tournament-round-prompt-type.enum';

export interface TournamentRoundPromptContent {
  en: string;
  ru: string;
}

export interface TournamentRoundPrompt {
  key: string;
  type: TournamentRoundPromptType.TEXT;
  content: TournamentRoundPromptContent;
}
