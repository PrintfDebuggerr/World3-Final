import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { LetterGrid } from './LetterGrid';
import { useOrientation } from '../../hooks/useOrientation';

export function SequentialMode() {
  const { gameState } = useWordleDuo();
  const { isMobile } = useOrientation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new rows are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [gameState.roomData?.gameHistory]);

  if (!gameState.roomData) return null;

  // Create grid rows from game history
  const gridRows = gameState.roomData.gameHistory.map((entry: any) => ({
    playerId: entry.playerId,
    playerName: gameState.roomData!.players.find((p: any) => p.id === entry.playerId)?.name || 'Unknown',
    playerAvatar: gameState.roomData!.players.find((p: any) => p.id === entry.playerId)?.avatar || '👤',
    guess: entry.guess,
    result: entry.result,
    rowIndex: entry.rowIndex
  }));

  // Handle letter click for current input
  const handleLetterClick = (index: number) => {
    if (!gameState.isMyTurn) return;
    
    // Bu fonksiyon useWordleDuo'dan gelecek
    // Şimdilik sadece console'a yazdıralım
    console.log(`Letter clicked at index: ${index}`);
  };

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col space-y-4 p-4"
      >
        {/* Turn Indicator */}
        <div className="flex-shrink-0">
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Sıra Kimde?</h2>
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {gameState.roomData.players.map((player: any, index: number) => (
                <div
                  key={player.id}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all ${
                    gameState.roomData!.currentTurn === index
                      ? 'bg-red-500/30 ring-2 ring-red-500'
                      : 'bg-white/10'
                  }`}
                >
                  <span className="text-lg sm:text-2xl">{player.avatar}</span>
                  <span className="text-white font-medium text-xs sm:text-base truncate max-w-16 sm:max-w-none">{player.name}</span>
                  {gameState.roomData!.currentTurn === index && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!gameState.isMyTurn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-300 text-sm sm:text-base"
            >
              {gameState.roomData.players[gameState.roomData.currentTurn]?.name} oynuyor...
            </motion.div>
          )}
        </div>

        {/* Game Grid - Scrollable */}
        <div className="flex-1 min-h-0" style={{ maxHeight: '320px' }}>
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto space-y-1 sm:space-y-2 pr-1 sm:pr-2 scroll-smooth"
          >
          {gridRows.map((row, index) => (
            <motion.div
              key={`${row.playerId}-${row.rowIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2 sm:space-x-4 py-0.5 sm:py-1 min-h-12 sm:min-h-16"
            >
              {/* Player Avatar - Responsive */}
              <div className="flex items-center space-x-1 sm:space-x-2 w-20 sm:w-32 md:w-36 max-w-20 sm:max-w-32 md:max-w-36 flex-shrink-0">
                <span className="text-lg sm:text-xl md:text-2xl flex-shrink-0">{row.playerAvatar}</span>
                <span className="text-sm sm:text-base md:text-lg text-gray-300 truncate min-w-0 overflow-hidden">
                  {row.playerName.length > 8 ? row.playerName.slice(0, 8) + '...' : row.playerName}
                </span>
              </div>

              {/* Letter Row */}
              <div className="flex-1">
                <LetterGrid
                  letters={row.guess.split('')}
                  statuses={row.result}
                  animate={row.result.some((r: any) => r !== 'empty')}
                />
              </div>
            </motion.div>
          ))}

          {/* Current turn row - Always show when it's user's turn */}
          {gameState.isMyTurn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 sm:space-x-4 py-0.5 sm:py-1 min-h-12 sm:min-h-16"
            >
              <div className="flex items-center space-x-1 sm:space-x-2 w-20 sm:w-32 md:w-36 max-w-20 sm:max-w-32 md:max-w-36 flex-shrink-0">
                <span className="text-lg sm:text-xl md:text-2xl flex-shrink-0">{gameState.playerData?.avatar}</span>
                <span className="text-sm sm:text-base md:text-lg text-gray-300 truncate min-w-0 overflow-hidden">
                  {(gameState.playerData?.name || '').length > 8 ? (gameState.playerData?.name || '').slice(0, 8) + '...' : gameState.playerData?.name}
                </span>
              </div>
              <div className="flex-1">
                <LetterGrid
                  letters={gameState.currentInput ? 
                    [...gameState.currentInput.split(''), ...Array(5 - gameState.currentInput.length).fill('')] : 
                    ['', '', '', '', '']
                  }
                  statuses={Array(5).fill('empty')}
                  animate={false}
                  interactive={true} // Tıklanabilir yap
                  onLetterClick={handleLetterClick} // Harf tıklama callback'i
                />
              </div>
            </motion.div>
          )}
          </div>
        </div>

        {/* Instructions - Fixed */}
        <div className="flex-shrink-0 mt-3 sm:mt-6 text-center text-gray-400 text-xs sm:text-sm">
          <p>Her oyuncu sırayla 5 harfli Türkçe kelime tahmin eder</p>
          {isMobile && gameState.isMyTurn && (
            <p className="mt-2 text-blue-400">
              💡 Harf kutucuklarına tıklayarak yazabilirsiniz!
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
