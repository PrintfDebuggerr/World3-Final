import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { PlayerIndicator } from './PlayerIndicator';
import { SequentialMode } from './SequentialMode';
import { DuelMode } from './DuelMode';
import { TurkishKeyboard } from './TurkishKeyboard';
import { WinScreen } from './WinScreen';
import { useOrientation } from '../../hooks/useOrientation';

export function GameBoard() {
  const { gameState, handleKeyPress, resetGame, setError } = useWordleDuo();
  const { orientation, isMobile } = useOrientation();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      
      if (key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[A-ZÇĞIİÖŞÜa-zçğıiöşü]$/.test(key)) {
        // Convert Turkish characters properly before sending to handleKeyPress
        const turkishUpperKey = key
          .replace(/i/g, 'İ')  // i → İ
          .replace(/ı/g, 'I')  // ı → I
          .toUpperCase();
        handleKeyPress(turkishUpperKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // Auto-clear error after 2 seconds
  useEffect(() => {
    if (gameState.error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [gameState.error, setError]);

  if (!gameState.roomData || !gameState.playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Oyun yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-4">Ana Menüye Dön</h3>
              <p className="text-gray-300 mb-6">
                Ana menüye dönmek istediğinizden emin misiniz? 
                <br />
                <span className="text-red-400 font-semibold">Oyun kaydedilmeyecek!</span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 glass-button px-4 py-2 rounded-lg text-white hover:scale-105 transition-transform"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white hover:scale-105 transition-transform"
                >
                  Ana Menüye Dön
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">WORDL3</h1>
            <div className="glass-card px-3 py-1 rounded-lg">
              <span className="text-sm text-gray-300">Oda: </span>
              <span className="text-sm font-mono text-white">{gameState.roomCode}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <PlayerIndicator />
            <button
              onClick={() => setShowExitConfirm(true)}
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
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Game Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {gameState.roomData.mode === 'sequential' ? (
                <SequentialMode />
              ) : (
                <DuelMode />
              )}
            </div>
            
            {/* Keyboard - Hide in duel mode mobile landscape */}
            {!(gameState.roomData.mode === 'duel' && isMobile && orientation === 'landscape') && (
              <div className="flex-shrink-0 p-4 border-t border-white/10">
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
            )}
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
            className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50"
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
