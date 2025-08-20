import React from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { LetterGrid } from './LetterGrid';

export function SequentialMode() {
  const { gameState } = useWordleDuo();

  if (!gameState.roomData) return null;

  // Create grid from game history and current input
  const gridRows = [...gameState.roomData.gameHistory];
  
  // Add current input row if it's the current player's turn
  if (gameState.isMyTurn && gameState.currentInput) {
    const currentRow = {
      rowIndex: gridRows.length,
      playerId: gameState.playerData?.id || '',
      playerName: gameState.playerData?.name || '',
      playerAvatar: gameState.playerData?.avatar || '👤',
      guess: gameState.currentInput.padEnd(5, ' '),
      result: Array(5).fill('empty'),
      timestamp: Date.now()
    };
    gridRows.push(currentRow);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Turn Indicator */}
        <div className="mb-6 text-center">
          <div className="glass-card rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-bold text-white mb-2">Sırayla Modu</h3>
            <div className="flex items-center justify-center space-x-4">
              {gameState.roomData.players.map((player: any, index: number) => (
                <div
                  key={player.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    gameState.roomData!.currentTurn === index
                      ? 'bg-red-500/30 ring-2 ring-red-500'
                      : 'bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="text-white font-medium">{player.name}</span>
                  {gameState.roomData!.currentTurn === index && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!gameState.isMyTurn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-300"
            >
              {gameState.roomData.players[gameState.roomData.currentTurn]?.name} oynuyor...
            </motion.div>
          )}
        </div>

        {/* Game Grid */}
        <div className="space-y-2">
          {gridRows.map((row, index) => (
            <motion.div
              key={`${row.playerId}-${row.rowIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              {/* Player Avatar */}
              <div className="flex items-center space-x-2 w-32">
                <span className="text-2xl">{row.playerAvatar}</span>
                <span className="text-sm text-gray-300 truncate">{row.playerName}</span>
              </div>

              {/* Letter Row */}
              <LetterGrid
                letters={row.guess.split('')}
                statuses={row.result}
                animate={row.result.some((r: any) => r !== 'empty')}
              />
            </motion.div>
          ))}

          {/* Empty row for current turn if no input */}
          {gameState.isMyTurn && !gameState.currentInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2 w-32">
                <span className="text-2xl">{gameState.playerData?.avatar}</span>
                <span className="text-sm text-gray-300 truncate">{gameState.playerData?.name}</span>
              </div>
              <LetterGrid
                letters={['', '', '', '', '']}
                statuses={['empty', 'empty', 'empty', 'empty', 'empty']}
                animate={false}
              />
            </motion.div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Her oyuncu sırayla 5 harfli Türkçe kelime tahmin eder</p>
        </div>
      </motion.div>
    </div>
  );
}
