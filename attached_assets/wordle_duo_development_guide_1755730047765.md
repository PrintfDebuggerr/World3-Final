# 🚀 WORDLE DUO - YAZILIM GELİŞTİRME KILAVUZU

## 1. PROJE YAPISININ KURULUMU

### 1.1 Next.js Proje İnisyalizasyonu
```bash
# Next.js projesi oluşturma
npx create-next-app@latest wordle-duo
cd wordle-duo

# Gerekli paketlerin yüklenmesi
npm install firebase framer-motion react-use-sound
npm install -D tailwindcss @types/node
```

### 1.2 Klasör Yapısı
```
wordle-duo/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Ana Menü)
│   │   ├── create/
│   │   │   ├── page.tsx (Oda Oluşturma)
│   │   │   └── mode/page.tsx (Mod Seçimi)
│   │   ├── join/
│   │   │   └── page.tsx (Odaya Katılma)
│   │   ├── room/
│   │   │   └── [code]/
│   │   │       ├── page.tsx (Oyun Ekranı)
│   │   │       └── waiting/page.tsx (Bekleme)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── game/
│   │   │   ├── GameBoard.tsx
│   │   │   ├── SequentialBoard.tsx
│   │   │   ├── DuelBoard.tsx
│   │   │   ├── Keyboard.tsx
│   │   │   ├── LetterCell.tsx
│   │   │   └── PlayerIndicator.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── BackButton.tsx
│   │   └── animations/
│   │       ├── ConfettiAnimation.tsx
│   │       ├── FlipAnimation.tsx
│   │       └── TurnChangeAnimation.tsx
│   ├── hooks/
│   │   ├── useRoom.ts
│   │   ├── useGame.ts
│   │   ├── useKeyboard.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── game-logic.ts
│   │   ├── turkish-words.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── game.ts
│   │   ├── room.ts
│   │   └── player.ts
│   └── constants/
│       ├── gameConfig.ts
│       ├── animations.ts
│       └── colors.ts
├── public/
│   ├── sounds/
│   │   ├── letter-input.wav
│   │   ├── correct-guess.wav
│   │   ├── wrong-guess.wav
│   │   └── victory.wav
│   └── icons/
└── package.json
```

## 2. MOBİL-FIRST TASARIM SİSTEMİ

### 2.1 Responsive Breakpoints (Tailwind Config)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      colors: {
        'dark-bg': '#0F172A',
        'dark-secondary': '#1E293B',
        'turkish-red': '#E11D48',
        'turkish-gold': '#F59E0B',
        'success-green': '#10B981',
        'neon-blue': '#06B6D4',
      },
      fontFamily: {
        'game': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      }
    }
  }
}
```

### 2.2 Mobil Klavye Component
```typescript
// components/game/MobileKeyboard.tsx
'use client';
import { motion } from 'framer-motion';

interface MobileKeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardStatus: Record<string, 'correct' | 'present' | 'absent'>;
  disabled: boolean;
}

const TURKISH_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'BACKSPACE']
];

export default function MobileKeyboard({ onKeyPress, keyboardStatus, disabled }: MobileKeyboardProps) {
  const getKeyStatus = (key: string) => {
    if (keyboardStatus[key]) return keyboardStatus[key];
    return 'default';
  };

  const getKeyStyles = (key: string) => {
    const status = getKeyStatus(key);
    const baseStyles = "min-h-[48px] rounded-lg font-semibold text-white transition-all duration-200 active:scale-95";
    
    switch (status) {
      case 'correct': return `${baseStyles} bg-success-green shadow-lg`;
      case 'present': return `${baseStyles} bg-turkish-gold shadow-lg`;
      case 'absent': return `${baseStyles} bg-gray-600`;
      default: return `${baseStyles} bg-gray-800 hover:bg-gray-700 active:bg-gray-600`;
    }
  };

  return (
    <div className={`w-full px-2 pb-safe ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {TURKISH_LAYOUT.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="flex justify-center gap-1 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: rowIndex * 0.1 }}
        >
          {row.map((key) => (
            <motion.button
              key={key}
              className={`
                ${getKeyStyles(key)}
                ${key === 'ENTER' || key === 'BACKSPACE' ? 'px-3 text-xs' : 'flex-1 text-lg'}
                ${key === 'ENTER' ? 'max-w-[80px]' : ''}
                ${key === 'BACKSPACE' ? 'max-w-[80px]' : ''}
              `}
              onClick={() => onKeyPress(key)}
              whileTap={{ scale: 0.95 }}
              disabled={disabled}
            >
              {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'GİR' : key}
            </motion.button>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
```

### 2.3 Mobil Letter Cell Component
```typescript
// components/game/LetterCell.tsx
'use client';
import { motion } from 'framer-motion';

interface LetterCellProps {
  letter: string;
  status: 'empty' | 'filled' | 'correct' | 'present' | 'absent';
  isActive?: boolean;
  delay?: number;
}

export default function LetterCell({ letter, status, isActive, delay = 0 }: LetterCellProps) {
  const getCellStyles = () => {
    const baseStyles = "w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-300";
    
    switch (status) {
      case 'correct':
        return `${baseStyles} bg-success-green border-success-green text-white`;
      case 'present':
        return `${baseStyles} bg-turkish-gold border-turkish-gold text-white`;
      case 'absent':
        return `${baseStyles} bg-gray-600 border-gray-600 text-white`;
      case 'filled':
        return `${baseStyles} bg-dark-secondary border-gray-400 text-white`;
      default:
        return `${baseStyles} bg-transparent border-gray-600 text-white ${isActive ? 'border-neon-blue shadow-lg shadow-neon-blue/30' : ''}`;
    }
  };

  return (
    <motion.div
      className={getCellStyles()}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.span
        key={letter}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {letter}
      </motion.span>
    </motion.div>
  );
}
```

## 3. OYUN LOGİĞİ VE STATE YÖNETİMİ

### 3.1 Custom Hooks

#### useGame Hook
```typescript
// hooks/useGame.ts
'use client';
import { useState, useCallback, useEffect } from 'react';
import { GameState, GuessResult } from '@/types/game';
import { checkGuess, isValidWord } from '@/lib/game-logic';

interface UseGameProps {
  roomCode: string;
  gameMode: 'sequential' | 'duel';
  isMyTurn: boolean;
  targetWord: string;
}

export function useGame({ roomCode, gameMode, isMyTurn, targetWord }: UseGameProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameHistory, setGameHistory] = useState<GuessResult[]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addLetter = useCallback((letter: string) => {
    if (!isMyTurn || currentGuess.length >= 5 || isSubmitting) return;
    
    setCurrentGuess(prev => prev + letter);
  }, [isMyTurn, currentGuess.length, isSubmitting]);

  const removeLetter = useCallback(() => {
    if (!isMyTurn || isSubmitting) return;
    
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [isMyTurn, isSubmitting]);

  const submitGuess = useCallback(async () => {
    if (!isMyTurn || currentGuess.length !== 5 || isSubmitting) return;
    
    if (!isValidWord(currentGuess)) {
      // Hata animasyonu tetikle
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = checkGuess(currentGuess, targetWord);
      
      setGameHistory(prev => [...prev, {
        guess: currentGuess,
        result,
        rowIndex: currentRow
      }]);
      
      // Check win condition
      if (result.every(r => r === 'correct')) {
        setGameStatus('won');
      } else if (currentRow >= 5) {
        setGameStatus('lost');
      }
      
      setCurrentRow(prev => prev + 1);
      setCurrentGuess('');
      
      // Firebase'e güncelleme gönder
      await updateGameState(roomCode, {
        guess: currentGuess,
        result,
        rowIndex: currentRow
      });
      
    } catch (error) {
      console.error('Guess submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isMyTurn, currentGuess, currentRow, targetWord, roomCode, isSubmitting]);

  return {
    currentGuess,
    gameHistory,
    currentRow,
    gameStatus,
    isSubmitting,
    addLetter,
    removeLetter,
    submitGuess
  };
}
```

#### useRoom Hook
```typescript
// hooks/useRoom.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { onValue, ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { RoomData, Player } from '@/types/room';

export function useRoom(roomCode: string) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(database, `rooms/${roomCode}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      setLoading(false);
      
      if (snapshot.exists()) {
        setRoomData(snapshot.val());
        setError(null);
      } else {
        setError('Oda bulunamadı');
        setRoomData(null);
      }
    }, (error) => {
      setLoading(false);
      setError('Bağlantı hatası');
      console.error('Room listener error:', error);
    });

    return () => unsubscribe();
  }, [roomCode]);

  const updateRoom = useCallback(async (updates: Partial<RoomData>) => {
    if (!roomCode) return;
    
    try {
      await update(ref(database, `rooms/${roomCode}`), updates);
    } catch (error) {
      console.error('Room update error:', error);
      setError('Güncelleme hatası');
    }
  }, [roomCode]);

  return {
    roomData,
    loading,
    error,
    updateRoom
  };
}
```

### 3.2 Game Logic Utilities
```typescript
// lib/game-logic.ts
import { turkishWords } from './turkish-words';

export type LetterStatus = 'correct' | 'present' | 'absent';

export interface GuessResult {
  guess: string;
  result: LetterStatus[];
  rowIndex: number;
  playerId?: string;
  timestamp?: number;
}

export function checkGuess(guess: string, targetWord: string): LetterStatus[] {
  const result: LetterStatus[] = [];
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');
  
  // First pass: Mark correct positions
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = '';
      guessLetters[i] = '';
    }
  }
  
  // Second pass: Mark present letters
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] !== '') {
      const foundIndex = targetLetters.findIndex(letter => letter === guessLetters[i]);
      if (foundIndex !== -1) {
        result[i] = 'present';
        targetLetters[foundIndex] = '';
      } else {
        result[i] = 'absent';
      }
    }
  }
  
  return result;
}

export function isValidWord(word: string): boolean {
  return turkishWords.includes(word.toUpperCase());
}

export function generateRandomWord(): string {
  return turkishWords[Math.floor(Math.random() * turkishWords.length)];
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

## 4. SAYFA UYGULAMALARI

### 4.1 Ana Menü Sayfası
```typescript
// app/page.tsx
'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName);
      router.push('/create');
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName);
      router.push('/join');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg to-dark-secondary flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
          WORDLE <span className="text-turkish-red">DUO</span>
        </h1>
        <p className="text-gray-400 text-lg">İkili Türkçe Kelime Oyunu</p>
      </motion.div>

      {/* Player Name Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md mb-8"
      >
        <input
          type="text"
          placeholder="Oyuncu adınız..."
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/30"
          maxLength={20}
        />
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-4">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleCreateRoom}
          disabled={!playerName.trim()}
          className="w-full py-4 bg-turkish-red hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          whileTap={{ scale: 0.95 }}
        >
          🏠 ODA OLUŞTUR
        </motion.button>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleJoinRoom}
          disabled={!playerName.trim()}
          className="w-full py-4 bg-neon-blue hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          whileTap={{ scale: 0.95 }}
        >
          🚪 ODAYA KATIL
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center text-gray-500"
      >
        <p>Arkadaşınızla birlikte kelime bulmacası çözün!</p>
      </motion.div>
    </div>
  );
}
```

### 4.2 Oyun Ekranı - Sequential Mode
```typescript
// components/game/SequentialBoard.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import LetterCell from './LetterCell';
import MobileKeyboard from './MobileKeyboard';
import PlayerIndicator from './PlayerIndicator';

interface SequentialBoardProps {
  roomData: RoomData;
  currentPlayer: Player;
  isMyTurn: boolean;
}

export default function SequentialBoard({ roomData, currentPlayer, isMyTurn }: SequentialBoardProps) {
  const {
    currentGuess,
    gameHistory,
    currentRow,
    gameStatus,
    addLetter,
    removeLetter,
    submitGuess
  } = useGame({
    roomCode: roomData.code,
    gameMode: 'sequential',
    isMyTurn,
    targetWord: roomData.word
  });

  const handleKeyPress = (key: string) => {
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      removeLetter();
    } else {
      addLetter(key);
    }
  };

  // Calculate total rows (minimum 6, expand as needed)
  const totalRows = Math.max(6, gameHistory.length + 1);
  const rows = Array.from({ length: totalRows }, (_, index) => {
    if (index < gameHistory.length) {
      return gameHistory[index];
    } else if (index === currentRow) {
      return {
        guess: currentGuess.padEnd(5, ''),
        result: Array(5).fill('filled'),
        isActive: true
      };
    } else {
      return {
        guess: '     ',
        result: Array(5).fill('empty'),
        isActive: false
      };
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-dark-bg to-dark-secondary">
      {/* Header with Players */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <PlayerIndicator 
            player={roomData.players[0]}
            isActive={roomData.currentTurn === 0}
            isMe={roomData.players[0].id === currentPlayer.id}
          />
          <div className="text-white font-bold">VS</div>
          <PlayerIndicator 
            player={roomData.players[1]}
            isActive={roomData.currentTurn === 1}
            isMe={roomData.players[1].id === currentPlayer.id}
          />
        </div>
        
        {/* Turn Indicator */}
        <motion.div
          className="text-center mt-2"
          key={roomData.currentTurn}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <span className={`text-lg font-semibold ${isMyTurn ? 'text-neon-blue' : 'text-gray-400'}`}>
            {isMyTurn ? 'SİZİN SIRANIZ!' : 'RAKİBİNİZİN SIRASI'}
          </span>
        </motion.div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-sm mx-auto space-y-2">
          <AnimatePresence>
            {rows.map((row, rowIndex) => (
              <motion.div
                key={rowIndex}
                className="flex justify-center gap-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: rowIndex * 0.05 }}
              >
                {Array.from({ length: 5 }).map((_, cellIndex) => (
                  <LetterCell
                    key={`${rowIndex}-${cellIndex}`}
                    letter={row.guess[cellIndex] || ''}
                    status={row.result[cellIndex]}
                    isActive={row.isActive && cellIndex === currentGuess.length}
                    delay={cellIndex * 0.1}
                  />
                ))}
                
                {/* Player indicator for each row */}
                {gameHistory[rowIndex] && (
                  <div className="flex items-center ml-2">
                    <span className={`w-3 h-3 rounded-full ${
                      gameHistory[rowIndex].playerId === roomData.players[0].id 
                        ? 'bg-blue-500' 
                        : 'bg-red-500'
                    }`} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Keyboard */}
      <MobileKeyboard
        onKeyPress={handleKeyPress}
        keyboardStatus={getKeyboardStatus(gameHistory)}
        disabled={!isMyTurn || gameStatus !== 'playing'}
      />
    </div>
  );
}
```

### 4.3 Oyun Ekranı - Duel Mode
```typescript
// components/game/DuelBoard.tsx
'use client';
import { motion } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import LetterCell from './LetterCell';
import MobileKeyboard from './MobileKeyboard';

interface DuelBoardProps {
  roomData: RoomData;
  currentPlayer: Player;
  myWord: string;
}

export default function DuelBoard({ roomData, currentPlayer, myWord }: DuelBoardProps) {
  const {
    currentGuess,
    gameHistory,
    currentRow,
    gameStatus,
    addLetter,
    removeLetter,
    submitGuess
  } = useGame({
    roomCode: roomData.code,
    gameMode: 'duel',
    isMyTurn: true, // Always true in duel mode
    targetWord: myWord
  });

  const handleKeyPress = (key: string) => {
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      removeLetter();
    } else {
      addLetter(key);
    }
  };

  // Get opponent's progress (only colors)
  const opponentProgress = roomData.opponentProgress || [];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-dark-bg to-dark-secondary">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 text-center">
        <h2 className="text-xl font-bold text-white">DÜELLO MODU</h2>
        <p className="text-gray-400">Rakibinizle aynı anda yarışın!</p>
      </div>

      {/* Split Screen - Mobile: Stacked */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* My Board */}
        <div className="flex-1 p-2 border-b md:border-b-0 md:border-r border-gray-700">
          <div className="text-center mb-2">
            <span className="text-neon-blue font-semibold">SİZİN TAHMİNLERİNİZ</span>
          </div>
          
          <div className="max-w-sm mx-auto space-y-1">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, cellIndex) => {
                  let letter = '';
                  let status = 'empty';
                  
                  if (rowIndex < gameHistory.length) {
                    letter = gameHistory[rowIndex].guess[cellIndex];
                    status = gameHistory[rowIndex].result[cellIndex];
                  } else if (rowIndex === currentRow) {
                    letter = currentGuess[cellIndex] || '';
                    status = letter ? 'filled' : 'empty';
                  }
                  
                  return (
                    <LetterCell
                      key={cellIndex}
                      letter={letter}
                      status={status}
                      isActive={rowIndex === currentRow && cellIndex === currentGuess.length}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Opponent Board (Colors Only) */}
        <div className="flex-1 p-2">
          <div className="text-center mb-2">
            <span className="text-turkish-red font-semibold">RAKİBİNİZİN İLERLEMESİ</span>
          </div>
          
          <div className="max-w-sm mx-auto space-y-1">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, cellIndex) => {
                  const opponentRow = opponentProgress[rowIndex];
                  let status = 'empty';
                  
                  if (opponentRow && opponentRow.colors) {
                    status = opponentRow.colors[cellIndex];
                  }
                  
                  return (
                    <div
                      key={cellIndex}
                      className={`w-8 h-8 border-2 rounded flex items-center justify-center ${
                        status === 'correct' ? 'bg-success-green border-success-green' :
                        status === 'present' ? 'bg-turkish-gold border-turkish-gold' :
                        status === 'absent' ? 'bg-gray-600 border-gray-600' :
                        'bg-transparent border-gray-600'
                      }`}
                    >
                      {status !== 'empty' && (
                        <div className="w-2 h-2 rounded-full bg-white opacity-50" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Keyboard */}
      <MobileKeyboard
        onKeyPress={handleKeyPress}
        keyboardStatus={getKeyboardStatus(gameHistory)}
        disabled={gameStatus !== 'playing'}
      />
    </div>
  );
}
```

## 5. FIREBASE ENTEGRASYONU

### 5.1 Firebase Konfigürasyonu
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
```

### 5.2 Room Management Functions
```typescript
// lib/room-manager.ts
import { ref, set, update, get, onValue, off } from 'firebase/database';
import { database } from './firebase';
import { RoomData, Player } from '@/types/room';
import { generateRoomCode, generateRandomWord } from './game-logic';

export async function createRoom(gameMode: 'sequential' | 'duel', hostPlayer: Player): Promise<string> {
  const roomCode = generateRoomCode();
  
  const roomData: RoomData = {
    code: roomCode,
    mode: gameMode,
    host: hostPlayer.id,
    players: [hostPlayer],
    status: 'waiting',
    word: generateRandomWord(),
    currentTurn: 0,
    gameHistory: [],
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  // If duel mode, assign different words
  if (gameMode === 'duel') {
    roomData.player1Word = generateRandomWord();
    roomData.player2Word = generateRandomWord();
    // Ensure different words
    while (roomData.player1Word === roomData.player2Word) {
      roomData.player2Word = generateRandomWord();
    }
  }

  await set(ref(database, `rooms/${roomCode}`), roomData);
  return roomCode;
}

export async function joinRoom(roomCode: string, player: Player): Promise<RoomData> {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) {
    throw new Error('Oda bulunamadı!');
  }
  
  const roomData = snapshot.val() as RoomData;
  
  if (roomData.players.length >= 2) {
    throw new Error('Oda dolu!');
  }
  
  if (roomData.status !== 'waiting') {
    throw new Error('Oyun zaten başlamış!');
  }

  const updatedRoomData = {
    ...roomData,
    players: [...roomData.players, player],
    status: 'playing',
    lastActivity: Date.now()
  };

  await update(roomRef, updatedRoomData);
  return updatedRoomData;
}

export async function updateGameState(roomCode: string, updates: any) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  await update(roomRef, {
    ...updates,
    lastActivity: Date.now()
  });
}

export function subscribeToRoom(roomCode: string, callback: (roomData: RoomData | null) => void) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  const listener = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });

  return () => off(roomRef, 'value', listener);
}
```

## 6. TYPESCRİPT TANIMLARI

### 6.1 Game Types
```typescript
// types/game.ts
export type LetterStatus = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

export interface GuessResult {
  guess: string;
  result: LetterStatus[];
  rowIndex: number;
  playerId?: string;
  playerName?: string;
  timestamp?: number;
}

export interface GameState {
  currentRow: number;
  currentGuess: string;
  gameHistory: GuessResult[];
  status: 'waiting' | 'playing' | 'won' | 'lost' | 'paused';
  winner?: string;
}

export interface KeyboardStatus {
  [key: string]: 'correct' | 'present' | 'absent';
}
```

### 6.2 Room Types
```typescript
// types/room.ts
export interface Player {
  id: string;
  name: string;
  avatar: string;
  joinTime: number;
  status: 'online' | 'offline' | 'disconnected';
  lastSeen: number;
}

export interface RoomData {
  code: string;
  mode: 'sequential' | 'duel';
  host: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished' | 'paused';
  word: string;
  player1Word?: string; // For duel mode
  player2Word?: string; // For duel mode
  currentTurn: number;
  gameHistory: GuessResult[];
  opponentProgress?: any[];
  totalRows?: number;
  createdAt: number;
  lastActivity: number;
  winner?: string;
  winReason?: 'correct_guess' | 'opponent_quit' | 'time_limit';
}
```

## 7. MOBİL OPTİMİZASYON VE PWA

### 7.1 PWA Konfigürasyonu
```json
// public/manifest.json
{
  "name": "Wordle Duo - İkili Türkçe Kelime Oyunu",
  "short_name": "Wordle Duo",
  "description": "Arkadaşınızla birlikte Türkçe kelime bulmaca oyunu",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#E11D48",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 7.2 Service Worker (PWA)
```javascript
// public/sw.js
const CACHE_NAME = 'wordle-duo-v1';
const STATIC_CACHE = [
  '/',
  '/create',
  '/join',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

### 7.3 Mobil Dokunmatik Optimizasyonu
```typescript
// components/ui/TouchOptimized.tsx
'use client';
import { ReactNode, TouchEvent, useState } from 'react';

interface TouchOptimizedProps {
  children: ReactNode;
  onTap?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function TouchOptimized({ 
  children, 
  onTap, 
  disabled, 
  className = '' 
}: TouchOptimizedProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (e: TouchEvent) => {
    if (!disabled) {
      setIsPressed(true);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!disabled && isPressed) {
      setIsPressed(false);
      onTap?.();
      e.preventDefault();
    }
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
  };

  return (
    <div
      className={`
        ${className}
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-transform duration-100 ease-out
        select-none
        touch-manipulation
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
}
```

## 8. PERFORMANS VE OPTİMİZASYON

### 8.1 React Memo ve Optimizasyonlar
```typescript
// components/game/OptimizedLetterCell.tsx
'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface LetterCellProps {
  letter: string;
  status: string;
  isActive?: boolean;
  position: number;
}

const LetterCell = memo(({ letter, status, isActive, position }: LetterCellProps) => {
  return (
    <motion.div
      className={getStatusStyles(status, isActive)}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ delay: position * 0.05 }}
      layout
    >
      {letter}
    </motion.div>
  );
});

LetterCell.displayName = 'LetterCell';
export default LetterCell;
```

### 8.2 Lazy Loading ve Code Splitting
```typescript
// app/room/[code]/page.tsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load game components
const SequentialBoard = lazy(() => import('@/components/game/SequentialBoard'));
const DuelBoard = lazy(() => import('@/components/game/DuelBoard'));

export default function RoomPage({ params }: { params: { code: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Room content */}
    </Suspense>
  );
}
```

## 9. TEST STRATEJISI

### 9.1 Unit Testler
```typescript
// __tests__/game-logic.test.ts
import { checkGuess, isValidWord } from '@/lib/game-logic';

describe('Game Logic', () => {
  test('checkGuess returns correct results', () => {
    const result = checkGuess('ARABA', 'KITAP');
    expect(result).toEqual(['absent', 'absent', 'present', 'present', 'absent']);
  });

  test('isValidWord validates Turkish words', () => {
    expect(isValidWord('ARABA')).toBe(true);
    expect(isValidWord('INVALID')).toBe(false);
  });
});
```

### 9.2 Integration Testler
```typescript
// __tests__/room-management.test.ts
import { createRoom, joinRoom } from '@/lib/room-manager';

describe('Room Management', () => {
  test('creates room successfully', async () => {
    const player = { id: '1', name: 'Test', avatar: '👨‍💻', joinTime: Date.now() };
    const roomCode = await createRoom('sequential', player);
    expect(roomCode).toHaveLength(6);
  });
});
```

## 10. DEPLOYMENT VE PRODUCTION

### 10.1 Vercel Deployment
```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL": "@firebase-database-url"
  }
}
```

### 10.2 Environment Variables
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 10.3 Build ve Deploy Scripts
```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit",
    "deploy": "vercel --prod"
  }
}
```

## 11. MONİTÖRİNG VE ANALİTİK

### 11.1 Error Tracking
```typescript
// lib/error-tracking.ts
export function trackError(error: Error, context?: any) {
  console.error('Game Error:', error, context);
  
  // Production'da Sentry veya başka bir service kullanılabilir
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context });
  }
}
```

### 11.2 Game Analytics
```typescript
// lib/analytics.ts
export function trackGameEvent(event: string, data?: any) {
  console.log('Game Event:', event, data);
  
  // Production'da Google Analytics veya başka bir service
  if (process.env.NODE_ENV === 'production') {
    // gtag('event', event, data);
  }
}

// Oyun olayları
export const GAME_EVENTS = {
  ROOM_CREATED: 'room_created',
  ROOM_JOINED: 'room_joined',
  GAME_STARTED: 'game_started',
  GUESS_SUBMITTED: 'guess_submitted',
  GAME_WON: 'game_won',
  GAME_LOST: 'game_lost'
};
```

## 12. GÜVENLİK VE VALIDASYON

### 12.1 Input Sanitization
```typescript
// lib/validation.ts
export function sanitizePlayerName(name: string): string {
  return name
    .trim()
    .slice(0, 20)
    .replace(/[<>]/g, '') // XSS korunması
    .replace(/\s+/g, ' '); // Fazla boşlukları temizle
}

export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function validateGuess(guess: string): boolean {
  return /^[A-ZÇĞIİÖŞÜ]{5}$/.test(guess.toUpperCase());
}
```

### 12.2 Rate Limiting
```typescript
// lib/rate-limiter.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(playerId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const playerData = rateLimitMap.get(playerId);
  
  if (!playerData || now > playerData.resetTime) {
    rateLimitMap.set(playerId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (playerData.count >= maxRequests) {
    return false;
  }
  
  playerData.count++;
  return true;
}
```

Bu kapsamlı geliştirme kılavuzu, WORDLE DUO oyununun Next.js ile mobil-first yaklaşımında geliştirilmesi için gereken tüm bileşenleri ve yaklaşımları içermektedir. Responsive tasarım, real-time multiplayer functionality, PWA özellikleri ve production-ready optimizasyonlar dahil edilmiştir.