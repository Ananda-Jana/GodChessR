export interface SecretDialogueTriggers {
  onMatchStart: string[];
  onPlayerCheck: string[];
  onBotCheck: string[];
  onPlayerCapture: string[];
  onBotCapture: string[];
  onBlunder: string[];
  onVictory: string[];
  onDefeat: string[];
  onIdle: string[];
}

export type PlaystyleType = 'boy_friend' | 'girl_friend' | 'war_bot';

export interface SecretPlayerConfig {
  id: string;
  publicName: string; // Shown in modal BEFORE passcode ("Boy Bot", "Girl Bot")
  realName: string;   // Revealed inside game AFTER passcode ("Babai", "Golu")
  opponentAddressingName: string; // "Golu" for Boy Bot, "Babai" for Girl Bot
  title: string;
  avatarSrc?: string; // Path to image asset
  avatarIcon?: string; // Fallback icon
  avatarBg: string;
  passcode: string; // Hardcoded 6-digit PIN
  themeColor: 'silver' | 'rose' | 'amber' | 'cyan';
  gameMode: 'standard';
  preferredOpenings: string[];
  playstyle: PlaystyleType;
  tagline: string;
  description: string;
  dialogue: SecretDialogueTriggers;
}

export interface SecretChatMessage {
  id: string;
  sender: 'bot' | 'player' | 'system';
  senderName: string;
  text: string;
  timestamp: number;
}
