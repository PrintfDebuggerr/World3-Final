import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { LetterGrid } from './LetterGrid';
import { useOrientation } from '../../hooks/useOrientation';

export function SequentialMode() {
  const { gameState, handleLetterClick } = useWordleDuo();
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
    guess: Array.isArray(entry.guess) ? entry.guess : entry.guess.split(''),
    result: entry.result,
    rowIndex: entry.rowIndex
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Wordle Duo</h1>
        <p className="text-blue-200">Sıralı Mod - {gameState.roomData.players.length} Oyuncu</p>
      </div>

      {/* Game Container - Scrollable */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Current Turn Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {gameState.roomData.players[gameState.roomData.currentTurn]?.name || 'Bilinmeyen Oyuncu'}'ın Sırası
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <span className="text-2xl">
              {gameState.roomData.players[gameState.roomData.currentTurn]?.avatar || '👤'}
            </span>
            <span className="text-lg text-blue-200">
              {gameState.roomData.players[gameState.roomData.currentTurn]?.name || 'Bilinmeyen Oyuncu'}
            </span>
          </div>
        </div>

        {/* Current Input Row */}
        {gameState.isMyTurn && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Tahmininizi Girin</h3>
              {isMobile && (
                <p className="text-sm text-blue-200 mb-2">
                  💡 Harf kutucuklarına tıklayarak yazabilirsiniz!
                </p>
              )}
            </div>
            
            <LetterGrid
              letters={gameState.currentInput.padEnd(5, '')}
              statuses={Array(5).fill('empty')}
              interactive={true}
              onLetterClick={handleLetterClick}
            />
            
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  if (gameState.currentInput.length === 5) {
                    // Submit guess logic will be handled by useWordleDuo
                    console.log('Submitting guess:', gameState.currentInput);
                  }
                }}
                disabled={gameState.currentInput.length !== 5}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
              >
                Tahmin Et
              </button>
            </div>
          </div>
        )}

        {/* Game Grid - Scrollable */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Oyun Geçmişi</h3>
          <div className="max-h-80 overflow-y-auto space-y-3 pr-2 scroll-smooth">
            {gridRows.map((row, index) => (
              <motion.div
                key={`${row.playerId}-${row.rowIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{row.playerAvatar}</span>
                    <span className="font-medium">{row.playerName}</span>
                  </div>
                  <span className="text-sm text-gray-300">Satır {row.rowIndex + 1}</span>
                </div>
                
                <LetterGrid
                  letters={row.guess}
                  statuses={row.result}
                  interactive={false}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <p className="text-lg">
            {gameState.roomData.status === 'playing' 
              ? `Oyun devam ediyor - ${gameState.roomData.players.length} oyuncu aktif`
              : 'Oyun tamamlandı!'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
