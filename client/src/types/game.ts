export type GamePhase = 'menu' | 'waiting' | 'playing' | 'finished';
export type GameMode = 'sequential' | 'duel';
export type LetterStatus = 'empty' | 'correct' | 'present' | 'absent';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'disconnected';
  joinTime: number;
  lastSeen: number;
}

export interface GameRoom {
  code: string;
  mode: GameMode;
  host: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  word: string;
  player1Word?: string;
  player2Word?: string;
  currentTurn: number;
  createdAt: number;
  gameHistory: GuessHistory[];
  totalRows: number;
  newGameRequests?: string[]; // Oyuncu ID'leri
}

export interface GuessHistory {
  rowIndex: number;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  guess: string;
  result: LetterStatus[];
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode | null;
  playerData: Player | null;
  roomCode: string | null;
  roomData: GameRoom | null;
  currentInput: string;
  currentRow: number;
  isMyTurn: boolean;
  keyboardStatus: Record<string, LetterStatus>;
  error: string | null;
}

export interface LetterCell {
  letter: string;
  status: LetterStatus;
  playerId?: string;
}

export interface GameGrid {
  rows: LetterCell[][];
}
