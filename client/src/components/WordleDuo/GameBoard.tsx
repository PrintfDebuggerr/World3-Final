import React, { useEffect, useState, useCallback } from 'react';
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
  const [isOrientationChanging, setIsOrientationChanging] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

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

  // Handle orientation changes and screen resize
  const handleResize = useCallback(() => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    
    // Detect orientation change
    const wasPortrait = screenSize.height > screenSize.width;
    const isPortrait = newHeight > newWidth;
    
    if (wasPortrait !== isPortrait && isMobile) {
      setIsOrientationChanging(true);
      // Brief delay to allow layout to settle
      setTimeout(() => setIsOrientationChanging(false), 300);
    }
    
    setScreenSize({ width: newWidth, height: newHeight });
  }, [screenSize, isMobile]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // Auto-clear error after 2 seconds (mobile: 3 seconds for better readability)
  useEffect(() => {
    if (gameState.error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, isMobile ? 3000 : 2000);

      return () => clearTimeout(timeout);
    }
  }, [gameState.error, setError, isMobile]);

  if (!gameState.roomData || !gameState.playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Oyun yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${
      isOrientationChanging ? 'opacity-90' : 'opacity-100'
    } ${isMobile ? 'mobile:h-[100dvh]' : ''}`}>
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

      {/* Header - Mobile Responsive */}
      <div className="p-2 sm:p-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Header Layout */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">WORDL3</h1>
              <div className="glass-card px-2 py-1 rounded text-xs">
                <span className="text-gray-300 hidden xs:inline">Oda: </span>
                <span className="font-mono text-white">{gameState.roomCode}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="scale-75 origin-right">
                <PlayerIndicator />
              </div>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="glass-button px-2 py-1 rounded text-white text-xs hover:scale-105 transition-transform"
                aria-label="Ana Menüye Dön"
              >
                <span className="hidden xs:inline">Ana Menü</span>
                <span className="xs:hidden">✕</span>
              </button>
            </div>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden md:flex items-center justify-between">
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
      </div>

      {/* Orientation Change Overlay */}
      <AnimatePresence>
        {isOrientationChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center"
          >
            <div className="glass-card p-4 rounded-xl">
              <div className="text-white text-sm">Ekran döndürülüyor...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Content */}
      <div className="flex-1 flex flex-col">
        {gameState.phase === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center justify-center p-4"
          >
            <div className="text-center max-w-sm w-full">
              <div className="text-4xl sm:text-6xl mb-4">⏳</div>
              <h2 className="text-xl sm:text-3xl font-bold text-white mb-4">Oyuncu Bekleniyor</h2>
              <p className="text-sm sm:text-base text-gray-300 mb-6">
                Arkadaşınızın katılmasını bekleyin...
              </p>
              <div className="glass-card p-4 sm:p-6 rounded-2xl">
                <p className="text-xs sm:text-sm text-gray-300 mb-2">Oda Kodu:</p>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-widest break-all">
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
            {/* Sequential Mode - Special Layout with Fixed Keyboard */}
            {gameState.roomData.mode === 'sequential' ? (
              <div className="flex-1 flex flex-col">
                {/* Scrollable Game History */}
                <div className="flex-1 overflow-hidden">
                  <SequentialMode />
                </div>
                
                {/* Fixed Keyboard at Bottom */}
                {gameState.isMyTurn && (
                  <div className={`flex-shrink-0 border-t border-white/10 bg-gray-900/95 backdrop-blur-sm ${
                    isMobile 
                      ? 'p-2' 
                      : 'p-4'
                  }`}>
                    <div className={`${
                      isMobile 
                        ? 'max-w-full' 
                        : 'max-w-2xl mx-auto'
                    }`}>
                      <TurkishKeyboard
                        onKeyPress={handleKeyPress}
                        keyboardStatus={gameState.keyboardStatus}
                        disabled={!gameState.isMyTurn}
                        autoHide={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Duel Mode - Original Layout */
              <div className="flex-1 overflow-y-auto">
                <div className={`${
                  isMobile 
                    ? 'px-2 py-1 max-w-full' 
                    : 'px-4 py-2 max-w-6xl mx-auto'
                }`}>
                  <DuelMode />
                </div>
              </div>
            )}
          </div>
        )}

        {gameState.phase === 'finished' && <WinScreen />}
      </div>

      {/* Error Display - Mobile Optimized */}
      <AnimatePresence>
        {gameState.error && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 100 : 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? 100 : 50 }}
            className={`fixed z-40 ${
              isMobile 
                ? 'bottom-2 left-2 right-2' 
                : 'bottom-4 left-4 right-4 max-w-md mx-auto'
            }`}
          >
            <div className={`bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-center backdrop-blur-sm ${
              isMobile 
                ? 'p-3 text-sm' 
                : 'p-4'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-red-400">⚠️</span>
                <span className="flex-1">{gameState.error}</span>
                {isMobile && (
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300 ml-2 text-lg leading-none"
                    aria-label="Hatayı kapat"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
