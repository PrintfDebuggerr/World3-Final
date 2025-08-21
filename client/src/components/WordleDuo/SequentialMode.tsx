import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { LetterGrid } from './LetterGrid';

export function SequentialMode() {
  const { gameState } = useWordleDuo();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!gameState.roomData) return null;

  // Create grid from game history only
  const gridRows = [...gameState.roomData.gameHistory];

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [gridRows.length]);

  return (
    <div className="flex flex-col p-2 sm:p-4 min-h-0 h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto flex flex-col min-h-0 h-full"
      >
        {/* Turn Indicator - Fixed */}
        <div className="flex-shrink-0 mb-3 sm:mb-6 text-center">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-2 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Sırayla Modu</h3>
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
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
                />
              </div>
            </motion.div>
          )}
          </div>
        </div>

        {/* Instructions - Fixed */}
        <div className="flex-shrink-0 mt-3 sm:mt-6 text-center text-gray-400 text-xs sm:text-sm">
          <p>Her oyuncu sırayla 5 harfli Türkçe kelime tahmin eder</p>
        </div>
      </motion.div>
    </div>
  );
}
