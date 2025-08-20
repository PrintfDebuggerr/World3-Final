import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { PlayerIndicator } from './PlayerIndicator';
import { SequentialMode } from './SequentialMode';
import { DuelMode } from './DuelMode';
import { TurkishKeyboard } from './TurkishKeyboard';
import { WinScreen } from './WinScreen';

export function GameBoard() {
  const { gameState, handleKeyPress, resetGame } = useWordleDuo();

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('BACKSPACE');
      } else if (/^[A-ZÇĞIİÖŞÜ]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  if (!gameState.roomData || !gameState.playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Oyun yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">WORDLE DUO</h1>
            <div className="glass-card px-3 py-1 rounded-lg">
              <span className="text-sm text-gray-300">Oda: </span>
              <span className="text-sm font-mono text-white">{gameState.roomCode}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <PlayerIndicator />
            <button
              onClick={resetGame}
              className="glass-button px-4 py-2 rounded-lg text-white text-sm hover:scale-105 transition-transform"
            >
              Ana Menü
            </button>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col">
        {gameState.phase === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-3xl font-bold text-white mb-4">Oyuncu Bekleniyor</h2>
              <p className="text-gray-300 mb-6">
                Arkadaşınızın katılmasını bekleyin...
              </p>
              <div className="glass-card p-6 rounded-2xl">
                <p className="text-sm text-gray-300 mb-2">Oda Kodu:</p>
                <p className="text-3xl font-mono font-bold text-white tracking-widest">
                  {gameState.roomCode}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Bu kodu arkadaşınızla paylaşın
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {gameState.phase === 'playing' && (
          <div className="flex-1 flex flex-col">
            {gameState.roomData.mode === 'sequential' ? (
              <SequentialMode />
            ) : (
              <DuelMode />
            )}
            
            {/* Keyboard */}
            <div className="p-4 border-t border-white/10">
              <div className="max-w-2xl mx-auto">
                <TurkishKeyboard
                  onKeyPress={handleKeyPress}
                  keyboardStatus={gameState.keyboardStatus}
                  disabled={
                    gameState.roomData.mode === 'sequential' && !gameState.isMyTurn
                  }
                />
              </div>
            </div>
          </div>
        )}

        {gameState.phase === 'finished' && <WinScreen />}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {gameState.error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 max-w-md mx-auto"
          >
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-center">
              {gameState.error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
