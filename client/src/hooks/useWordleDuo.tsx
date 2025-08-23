import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameState } from './useGameState';
import { useBackendAPI } from './useFirebase';
import { GameRoom, GameMode, GuessHistory } from '../types/game';
import { 
  generateRoomCode, 
  checkLetterStatus, 
  validateInput, 
  updateKeyboardStatus 
} from '../lib/gameLogic';
import { selectRandomWord, selectDifferentWords, isValidWord } from '../lib/turkishWords';

export function useWordleDuo() {
  const navigate = useNavigate();
  const params = useParams();
  const gameState = useGameState();
  const hasResetForNewGameRef = useRef(false);
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
  } = useBackendAPI();

  // Handle URL room code
  useEffect(() => {
    const roomCodeFromURL = params.roomCode;
    if (roomCodeFromURL && roomCodeFromURL !== gameState.roomCode) {
      // Load room from URL parameter
      const loadRoom = async () => {
        try {
          const room = await getRoomFromDatabase(roomCodeFromURL);
          if (room) {
            setRoomCode(roomCodeFromURL);
            setRoomData(room);
            setMode(room.mode);
            
            // Set appropriate phase based on room status
            if (room.status === 'waiting') {
              setPhase('waiting');
            } else if (room.status === 'playing') {
              setPhase('playing');
            } else if (room.status === 'finished') {
              setPhase('finished');
            }
          } else {
            // Room not found, redirect to home
            navigate('/');
            setError('Oda bulunamadı');
          }
        } catch (error) {
          console.error('Error loading room from URL:', error);
          navigate('/');
          setError('Oda yüklenemedi');
        }
      };
      
      loadRoom();
    }
  }, [params.roomCode, gameState.roomCode, getRoomFromDatabase, setRoomCode, setRoomData, setMode, setPhase, navigate, setError]);


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
        word = player1Word; // Her iki oyuncu da aynı kelimeyi alır
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
      
      // Navigate to room URL
      navigate(`/room/${roomCode}`);
      
      return roomCode;
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Oda oluşturulamadı');
      throw error;
    }
  }, [createPlayer, saveRoomToDatabase, setMode, setRoomCode, setRoomData, setPhase, setError, navigate]);

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
      
      // Navigate to room URL
      navigate(`/room/${roomCode}`);
      
      return updatedRoom;
    } catch (error) {
      console.error('Error joining room:', error);
      setError(error instanceof Error ? error.message : 'Odaya katılamadı');
      throw error;
    }
  }, [getRoomFromDatabase, createPlayer, updateRoomInDatabase, setMode, setRoomCode, setRoomData, setPhase, setError, navigate]);

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
        // Check if duel mode game should end (6 attempts reached)
        if (gameState.roomData.mode === 'duel') {
          const myGuesses = gameState.roomData.gameHistory.filter(
            (h: any) => h.playerId === gameState.playerData.id
          );
          
          // If this player has reached 6 attempts, check if opponent also has 6 attempts
          if (myGuesses.length >= 5) { // 0-5 = 6 attempts
            const opponentGuesses = gameState.roomData.gameHistory.filter(
              (h: any) => h.playerId !== gameState.playerData.id
            );
            
            // If both players have 6 attempts, end the game
            if (opponentGuesses.length >= 5) {
              const updates: Partial<GameRoom> = {
                gameHistory: [...gameState.roomData.gameHistory, guessEntry],
                status: 'finished'
              };
              
              await updateRoomInDatabase(gameState.roomCode, updates);
              setPhase('finished');
              setCurrentInput('');
              return;
            }
          }
        }
        
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
    } else if (gameState.currentInput.length < 5 && /^[A-ZÇĞIİÖŞÜa-zçğıiöşü]$/.test(key)) {
      // Convert Turkish characters properly before adding to input
      const turkishUpperKey = key
        .replace(/i/g, 'İ')  // i → İ
        .replace(/ı/g, 'I')  // ı → I
        .toUpperCase();
      setCurrentInput(gameState.currentInput + turkishUpperKey);
    }
  }, [gameState, submitGuess, setCurrentInput]);

  // Handle letter click for specific position
  const handleLetterClick = useCallback((index: number) => {
    if (!gameState.roomData || !gameState.playerData) return;

    // Check if it's player's turn (for sequential mode)
    if (gameState.roomData.mode === 'sequential') {
      const isMyTurn = gameState.roomData.players[gameState.roomData.currentTurn]?.id === gameState.playerData.id;
      if (!isMyTurn) return;
    }

    // For duel mode, always allow input
    if (gameState.roomData.mode === 'duel') {
      // Check if game is still active
      if (gameState.roomData.status !== 'playing') return;
      
      // Check if player has already won or lost
      const myGuesses = gameState.roomData.gameHistory.filter(
        (h: any) => h.playerId === gameState.playerData.id
      );
      if (myGuesses.length >= 6) return; // Max 6 guesses
      
      // Check if player already found the word
      const hasWon = myGuesses.some((g: any) => g.result.every((r: string) => r === 'correct'));
      if (hasWon) return;
    }

    // Bu fonksiyon mobil input'tan gelecek
    // Şimdilik sadece console'a yazdıralım
    console.log(`Letter clicked at position: ${index}`);
    
    // TODO: Burada gerçek harf ekleme mantığı olacak
    // Şimdilik sadece test için
  }, [gameState]);

  // Define startNewGameFromRequest before it's used
  const startNewGameFromRequest = useCallback(async () => {
    if (!gameState.roomCode || !gameState.roomData) return;
    
    try {
      // Generate new word(s)
      let newWord: string;
      let newPlayer1Word: string | undefined;
      let newPlayer2Word: string | undefined;
      
      if (gameState.roomData.mode === 'duel') {
        [newPlayer1Word, newPlayer2Word] = selectDifferentWords();
        newWord = newPlayer1Word; // Her iki oyuncu da aynı kelimeyi alır
      } else {
        newWord = selectRandomWord();
      }
      
      // Reset game state
      const updates: Partial<GameRoom> = {
        status: 'playing',
        word: newWord,
        player1Word: newPlayer1Word,
        player2Word: newPlayer2Word,
        currentTurn: 0,
        gameHistory: [],
        totalRows: 1,
        newGameRequests: [] // Reset requests
      };
      
      await updateRoomInDatabase(gameState.roomCode, updates);
      
      // Update local state
      setCurrentRow(0);
      setCurrentInput('');
      setKeyboardStatus({});
      setPhase('playing');
      
    } catch (error) {
      console.error('Error starting new game from request:', error);
      setError('Yeni oyun başlatılamadı');
    }
  }, [gameState.roomCode, gameState.roomData, updateRoomInDatabase, setCurrentRow, setCurrentInput, setKeyboardStatus, setPhase, setError]);

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
        
        // Update keyboard status from all game history (including other players' moves)
        if (roomData.gameHistory && roomData.gameHistory.length > 0) {
          let newKeyboardStatus = {};
          for (const entry of roomData.gameHistory) {
            newKeyboardStatus = updateKeyboardStatus(
              newKeyboardStatus,
              entry.guess,
              entry.result
            );
          }
          setKeyboardStatus(newKeyboardStatus);
        }
        
        // Check game phase transitions
        if (roomData.status === 'finished' && gameState.phase !== 'finished') {
          setPhase('finished');
          hasResetForNewGameRef.current = false; // Reset flag when game finishes
        } else if (roomData.status === 'playing' && gameState.phase === 'finished') {
          // Game restarted - reset local state and go back to playing
          // Only reset ONCE if it's actually a new game (totalRows=1, no history)
          if (roomData.totalRows === 1 && roomData.gameHistory.length === 0 && !hasResetForNewGameRef.current) {
            setCurrentRow(0);
            setCurrentInput('');
            setKeyboardStatus({});
            hasResetForNewGameRef.current = true; // Mark that we've reset for this new game
          }
          setPhase('playing');
        } else if (roomData.status === 'playing' && gameState.phase !== 'playing') {
          setPhase('playing');
        }
      }
    });

    return unsubscribe;
  }, [gameState.roomCode, gameState.playerData, gameState.phase, setupRoomListener, setRoomData, setIsMyTurn, setPhase, setCurrentRow, setCurrentInput, setKeyboardStatus, updateKeyboardStatus]);

  return {
    gameState,
    createRoom,
    joinRoom,
    submitGuess,
    handleKeyPress,
    handleLetterClick,
    setError,
    requestNewGame: async () => {
      if (!gameState.roomCode || !gameState.roomData || !gameState.playerData) {
        return;
      }

      try {
        // Oyun zaten başlamışsa işlem yapma
        if (gameState.roomData.status === 'playing') {
          return;
        }

        const currentRequests = gameState.roomData.newGameRequests || [];
        const playerId = gameState.playerData.id;
        
        // Eğer oyuncu zaten istek göndermişse, işlemi iptal et
        if (currentRequests.includes(playerId)) {
          const updatedRequests = currentRequests.filter(id => id !== playerId);
          await updateRoomInDatabase(gameState.roomCode, {
            newGameRequests: updatedRequests
          });
        } else {
          // Her iki oyuncu da istek göndermişse (kendisi hariç), oyunu başlat
          if (currentRequests.length === gameState.roomData.players.length - 1) {
            // Diğer tüm oyuncular istek göndermiş, direkt oyunu başlat
            await startNewGameFromRequest();
          } else {
            // Normal istek gönderme
            const updatedRequests = [...currentRequests, playerId];
            await updateRoomInDatabase(gameState.roomCode, {
              newGameRequests: updatedRequests
            });
          }
        }
      } catch (error) {
        console.error('Error requesting new game:', error);
        setError('Yeni oyun isteği gönderilemedi');
      }
    },
    
    startNewGame: async () => {
      try {
        // Clear current game state
        const gameStateStore = useGameState.getState();
        gameStateStore.resetGame();
        
        // Set phase to menu to show game mode selector
        setPhase('menu');
      } catch (error) {
        console.error('Error starting new game:', error);
        setError('Yeni oyun başlatılamadı');
      }
    },
    
    startNewGameFromRequest,
    
    resetGame: () => {
      // Clear localStorage
      localStorage.removeItem('wordle-duo-player-id');
      localStorage.removeItem('wordle-duo-room-code');
      
      // Reset game state completely
      const gameStateStore = useGameState.getState();
      gameStateStore.resetGame();
      
      // Set phase to menu to return to main menu
      setPhase('menu');
      
      // Navigate to home
      navigate('/');
    }
  };
}
