import { useCallback, useEffect } from 'react';
import { useGameState } from './useGameState';
import { useFirebase } from './useFirebase';
import { GameRoom, GameMode, GuessHistory } from '../types/game';
import { 
  generateRoomCode, 
  checkLetterStatus, 
  validateInput, 
  updateKeyboardStatus 
} from '../lib/gameLogic';
import { selectRandomWord, selectDifferentWords, isValidWord } from '../lib/turkishWords';

export function useWordleDuo() {
  const gameState = useGameState();
  const {
    setPhase,
    setMode,
    setRoomCode,
    setRoomData,
    setCurrentInput,
    setCurrentRow,
    setIsMyTurn,
    setKeyboardStatus,
    setError,
    createPlayer
  } = useGameState();

  const {
    saveRoomToDatabase,
    getRoomFromDatabase,
    updateRoomInDatabase,
    setupRoomListener
  } = useFirebase();

  // Create a new room
  const createRoom = useCallback(async (gameMode: GameMode, playerName: string) => {
    try {
      setError(null);
      const player = createPlayer(playerName);
      const roomCode = generateRoomCode();
      
      let word: string;
      let player1Word: string | undefined;
      let player2Word: string | undefined;
      
      if (gameMode === 'duel') {
        [player1Word, player2Word] = selectDifferentWords();
        word = player1Word; // Host gets first word
      } else {
        word = selectRandomWord();
      }

      const roomData: GameRoom = {
        code: roomCode,
        mode: gameMode,
        host: player.id,
        players: [player],
        status: 'waiting',
        word,
        player1Word,
        player2Word,
        currentTurn: 0,
        createdAt: Date.now(),
        gameHistory: [],
        totalRows: 1
      };

      await saveRoomToDatabase(roomCode, roomData);
      
      setMode(gameMode);
      setRoomCode(roomCode);
      setRoomData(roomData);
      setPhase('waiting');
      
      return roomCode;
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Oda oluşturulamadı');
      throw error;
    }
  }, [createPlayer, saveRoomToDatabase, setMode, setRoomCode, setRoomData, setPhase, setError]);

  // Join an existing room
  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    try {
      setError(null);
      const room = await getRoomFromDatabase(roomCode);
      
      if (!room) {
        throw new Error('Oda bulunamadı!');
      }
      
      if (room.players.length >= 2) {
        throw new Error('Oda dolu!');
      }
      
      if (room.status !== 'waiting') {
        throw new Error('Oyun zaten başlamış!');
      }

      const player = createPlayer(playerName);
      const updatedRoom: GameRoom = {
        ...room,
        players: [...room.players, player],
        status: 'playing'
      };

      // In duel mode, assign second word to joining player
      if (room.mode === 'duel' && room.player2Word) {
        // Joining player gets the second word
      }

      await updateRoomInDatabase(roomCode, updatedRoom);
      
      setMode(room.mode);
      setRoomCode(roomCode);
      setRoomData(updatedRoom);
      setPhase('playing');
      
      return updatedRoom;
    } catch (error) {
      console.error('Error joining room:', error);
      setError(error instanceof Error ? error.message : 'Odaya katılamadı');
      throw error;
    }
  }, [getRoomFromDatabase, createPlayer, updateRoomInDatabase, setMode, setRoomCode, setRoomData, setPhase, setError]);

  // Submit a guess
  const submitGuess = useCallback(async () => {
    if (!gameState.roomCode || !gameState.roomData || !gameState.playerData) {
      return;
    }

    try {
      const input = validateInput(gameState.currentInput);
      
      if (!isValidWord(input)) {
        throw new Error('Geçerli bir Türkçe kelime giriniz!');
      }

      const targetWord = gameState.roomData.mode === 'duel' 
        ? (gameState.playerData.id === gameState.roomData.host 
           ? gameState.roomData.player1Word || gameState.roomData.word
           : gameState.roomData.player2Word || gameState.roomData.word)
        : gameState.roomData.word;

      const result = checkLetterStatus(input, targetWord);
      
      // Update keyboard status
      const newKeyboardStatus = updateKeyboardStatus(
        gameState.keyboardStatus,
        input,
        result
      );
      setKeyboardStatus(newKeyboardStatus);

      // Create guess history entry
      const guessEntry: GuessHistory = {
        rowIndex: gameState.currentRow,
        playerId: gameState.playerData.id,
        playerName: gameState.playerData.name,
        playerAvatar: gameState.playerData.avatar,
        guess: input,
        result,
        timestamp: Date.now()
      };

      // Check if game is won
      const isCorrect = result.every(status => status === 'correct');
      
      if (isCorrect) {
        // Game won
        const updates: Partial<GameRoom> = {
          gameHistory: [...gameState.roomData.gameHistory, guessEntry],
          status: 'finished'
        };
        
        await updateRoomInDatabase(gameState.roomCode, updates);
        setPhase('finished');
      } else {
        // Continue game
        const updates: Partial<GameRoom> = {
          gameHistory: [...gameState.roomData.gameHistory, guessEntry],
          currentTurn: gameState.roomData.mode === 'sequential' 
            ? (gameState.roomData.currentTurn + 1) % 2 
            : gameState.roomData.currentTurn,
          totalRows: gameState.roomData.mode === 'sequential' 
            ? gameState.roomData.totalRows + 1 
            : gameState.roomData.totalRows
        };

        await updateRoomInDatabase(gameState.roomCode, updates);
        
        if (gameState.roomData.mode === 'sequential') {
          setCurrentRow(gameState.currentRow + 1);
        }
      }

      setCurrentInput('');
      
    } catch (error) {
      console.error('Error submitting guess:', error);
      setError(error instanceof Error ? error.message : 'Tahmin gönderilemedi');
    }
  }, [
    gameState,
    updateRoomInDatabase,
    setKeyboardStatus,
    setPhase,
    setCurrentRow,
    setCurrentInput,
    setError
  ]);

  // Handle keyboard input
  const handleKeyPress = useCallback((key: string) => {
    if (!gameState.roomData || !gameState.playerData) return;

    // Check if it's player's turn (for sequential mode)
    if (gameState.roomData.mode === 'sequential') {
      const isMyTurn = gameState.roomData.players[gameState.roomData.currentTurn]?.id === gameState.playerData.id;
      if (!isMyTurn) return;
    }

    if (key === 'ENTER') {
      if (gameState.currentInput.length === 5) {
        submitGuess();
      }
    } else if (key === 'BACKSPACE') {
      setCurrentInput(gameState.currentInput.slice(0, -1));
    } else if (gameState.currentInput.length < 5 && /^[A-ZÇĞIİÖŞÜ]$/.test(key)) {
      setCurrentInput(gameState.currentInput + key);
    }
  }, [gameState, submitGuess, setCurrentInput]);

  // Set up room listener
  useEffect(() => {
    if (!gameState.roomCode) return;

    const unsubscribe = setupRoomListener(gameState.roomCode, (roomData) => {
      if (roomData) {
        setRoomData(roomData);
        
        // Update turn indicator
        if (roomData.mode === 'sequential' && gameState.playerData) {
          const isMyTurn = roomData.players[roomData.currentTurn]?.id === gameState.playerData.id;
          setIsMyTurn(isMyTurn);
        }
        
        // Check game phase
        if (roomData.status === 'finished' && gameState.phase !== 'finished') {
          setPhase('finished');
        }
      }
    });

    return unsubscribe;
  }, [gameState.roomCode, gameState.playerData, gameState.phase, setupRoomListener, setRoomData, setIsMyTurn, setPhase]);

  return {
    gameState,
    createRoom,
    joinRoom,
    submitGuess,
    handleKeyPress,
    setError,
    resetGame: () => setPhase('menu')
  };
}
