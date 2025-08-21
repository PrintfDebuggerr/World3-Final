import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, Player, GameRoom, GameMode } from '../types/game';
import { generateUniqueId, generateRandomAvatar } from '../lib/gameLogic';

interface GameStore extends GameState {
  // Actions
  setPhase: (phase: GameState['phase']) => void;
  setMode: (mode: GameMode) => void;
  setPlayerData: (playerData: Player) => void;
  setRoomCode: (roomCode: string | null) => void;
  setRoomData: (roomData: GameRoom | null) => void;
  setCurrentInput: (input: string) => void;
  setCurrentRow: (row: number) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  setKeyboardStatus: (status: Record<string, any>) => void;
  setError: (error: string | null) => void;
  createPlayer: (name: string) => Player;
  resetGame: () => void;
}

const initialState: GameState = {
  phase: 'menu',
  mode: null,
  playerData: null,
  roomCode: null,
  roomData: null,
  currentInput: '',
  currentRow: 0,
  isMyTurn: false,
  keyboardStatus: {},
  error: null
};

export const useGameState = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setPhase: (phase) => set({ phase }),
    setMode: (mode) => set({ mode }),
    setPlayerData: (playerData) => set({ playerData }),
    setRoomCode: (roomCode) => set({ roomCode }),
    setRoomData: (roomData) => {
      set({ roomData });
      // Auto-update phase based on room status
      if (roomData?.status === 'playing' && get().phase === 'waiting') {
        set({ phase: 'playing' });
      }
    },
    setCurrentInput: (currentInput) => set({ currentInput }),
    setCurrentRow: (currentRow) => set({ currentRow }),
    setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
    setKeyboardStatus: (keyboardStatus) => set({ keyboardStatus }),
    setError: (error) => set({ error }),

    createPlayer: (name: string): Player => {
      const player: Player = {
        id: generateUniqueId(),
        name: name || 'Anonim Oyuncu',
        avatar: generateRandomAvatar(),
        status: 'online',
        joinTime: Date.now(),
        lastSeen: Date.now()
      };
      set({ playerData: player });
      // Store player ID in localStorage for persistence
      localStorage.setItem('wordle-duo-player-id', player.id);
      return player;
    },

    resetGame: () => set({ ...initialState, playerData: get().playerData })
  }))
);
