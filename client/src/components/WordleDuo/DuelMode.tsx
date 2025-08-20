import React from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { LetterGrid } from './LetterGrid';

export function DuelMode() {
  const { gameState } = useWordleDuo();

  if (!gameState.roomData || !gameState.playerData) return null;

  // Separate grids for each player
  const player1 = gameState.roomData.players[0];
  const player2 = gameState.roomData.players[1];
  const isPlayer1 = gameState.playerData.id === player1?.id;

  // Get player's own guesses
  const myGuesses = gameState.roomData.gameHistory.filter(
    (h: any) => h.playerId === gameState.playerData.id
  );

  // Get opponent's guesses (only colors, not letters)
  const opponentGuesses = gameState.roomData.gameHistory.filter(
    (h: any) => h.playerId !== gameState.playerData.id
  );

  // Create 6 rows for each player
  const createPlayerGrid = (guesses: any[], showLetters: boolean) => {
    const rows = [];
    
    for (let i = 0; i < 6; i++) {
      const guess = guesses[i];
      if (guess) {
        const letters = showLetters ? guess.guess.split('') : ['■', '■', '■', '■', '■'];
        rows.push({
          letters,
          statuses: guess.result,
          animate: true
        });
      } else if (i === guesses.length && showLetters && gameState.currentInput) {
        // Current input row
        const letters = gameState.currentInput.padEnd(5, ' ').split('');
        rows.push({
          letters,
          statuses: Array(5).fill('empty'),
          animate: false
        });
      } else {
        // Empty row
        rows.push({
          letters: ['', '', '', '', ''],
          statuses: Array(5).fill('empty'),
          animate: false
        });
      }
    }
    
    return rows;
  };

  const myGrid = createPlayerGrid(myGuesses, true);
  const opponentGrid = createPlayerGrid(opponentGuesses, false);

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Mode Header */}
        <div className="text-center mb-6">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-2">🏆 Düello Modu</h3>
            <p className="text-gray-300 text-sm">
              Farklı kelimelerle yarışın! Kim önce bulursa kazanır.
            </p>
          </div>
        </div>

        {/* Dual Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl">{gameState.playerData.avatar}</span>
                <span className="text-white font-bold">{gameState.playerData.name}</span>
                <span className="text-green-400">👤</span>
              </div>
              
              <div className="space-y-2">
                {myGrid.map((row, index) => (
                  <LetterGrid
                    key={index}
                    letters={row.letters}
                    statuses={row.statuses}
                    animate={row.animate}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Opponent Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl">{player2?.avatar || '👤'}</span>
                <span className="text-white font-bold">{player2?.name || 'Oyuncu 2'}</span>
                <span className="text-red-400">🔥</span>
              </div>
              
              <div className="space-y-2">
                {opponentGrid.map((row, index) => (
                  <LetterGrid
                    key={index}
                    letters={row.letters}
                    statuses={row.statuses}
                    animate={row.animate}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Indicators */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-sm text-gray-300">İlerlemeniz</div>
            <div className="text-2xl font-bold text-white">
              {myGuesses.length} / 6
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-sm text-gray-300">Rakip İlerlemesi</div>
            <div className="text-2xl font-bold text-white">
              {opponentGuesses.length} / 6
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          <p>Rakibinizin tahminlerini sadece renk kodları ile görebilirsiniz</p>
        </div>
      </div>
    </div>
  );
}
