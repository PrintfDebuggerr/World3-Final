import React from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { useOrientation } from '../../hooks/useOrientation';
import { LetterGrid } from './LetterGrid';

export function DuelMode() {
  const { gameState, handleLetterClick } = useWordleDuo();
  const { orientation, isMobile } = useOrientation();

  if (!gameState.roomData || !gameState.playerData) return null;

  // Remove the portrait mode restriction - allow both orientations
  // Users can play in both portrait and landscape mode

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
  const createPlayerGrid = (guesses: any[], showLetters: boolean, isCurrentPlayer: boolean = false) => {
    const rows = [];
    
    for (let i = 0; i < 6; i++) {
      const guess = guesses[i];
      if (guess) {
        const letters = showLetters ? guess.guess.split('') : ['■', '■', '■', '■', '■'];
        rows.push({
          letters,
          statuses: guess.result,
          animate: true,
          interactive: false
        });
      } else if (i === guesses.length && showLetters && isCurrentPlayer) {
        // Current input row - make it interactive (even if currentInput is empty)
        const letters = gameState.currentInput ? gameState.currentInput.padEnd(5, ' ').split('') : ['', '', '', '', ''];
        rows.push({
          letters,
          statuses: Array(5).fill('empty'),
          animate: false,
          interactive: true
        });
      } else if (i === guesses.length && showLetters && isCurrentPlayer && !gameState.currentInput) {
        // Empty input row for current player - make it interactive
        rows.push({
          letters: ['', '', '', '', ''],
          statuses: Array(5).fill('empty'),
          animate: false,
          interactive: true
        });
      } else {
        // Empty row
        rows.push({
          letters: ['', '', '', '', ''],
          statuses: Array(5).fill('empty'),
          animate: false,
          interactive: false
        });
      }
    }
    
    return rows;
  };

  const myGrid = createPlayerGrid(myGuesses, true, true); // true for isCurrentPlayer
  const opponentGrid = createPlayerGrid(opponentGuesses, false, false);

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Mode Header */}
        <div className="text-center mb-4 p-4">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-2">🏆 Düello Modu</h3>
            <p className="text-gray-300 text-sm">
              Farklı kelimelerle yarışın! Kim önce bulursa kazanır.
            </p>
          </div>
        </div>

        {/* Scrollable Grid Container */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Dual Grid Layout - Responsive for both orientations */}
          <div className={`grid ${
            isMobile && orientation === 'landscape' 
              ? 'grid-cols-2 gap-4' 
              : 'grid-cols-1 gap-6'
          }`}>
            {/* My Grid */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="text-2xl">{gameState.playerData.avatar}</span>
                  <span className="text-white font-bold text-lg">
                    {gameState.playerData.name}
                  </span>
                  <span className="text-green-400 text-lg">👤</span>
                </div>
                
                <div className="space-y-2">
                  {myGrid.map((row, index) => (
                    <LetterGrid
                      key={index}
                      letters={row.letters}
                      statuses={row.statuses}
                      animate={row.animate}
                      enlarged={false}
                      interactive={row.interactive}
                      onLetterClick={row.interactive ? handleLetterClick : undefined}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Opponent Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="text-2xl">{player2?.avatar || '👤'}</span>
                  <span className="text-white font-bold text-lg">
                    {player2?.name || 'Oyuncu 2'}
                  </span>
                  <span className="text-red-400 text-lg">🔥</span>
                </div>
                
                <div className="space-y-2">
                  {opponentGrid.map((row, index) => (
                    <LetterGrid
                      key={index}
                      letters={row.letters}
                      statuses={row.statuses}
                      animate={row.animate}
                      enlarged={false}
                      interactive={false}
                      onLetterClick={undefined}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="mt-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-gray-300 text-sm">İlerlemeniz</div>
              <div className="font-bold text-white text-xl">
                {myGuesses.length} / 6
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-gray-300 text-sm">Rakip İlerlemesi</div>
              <div className="font-bold text-white text-xl">
                {opponentGuesses.length} / 6
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-4 pb-4 text-center text-gray-400 text-sm">
          <p>Rakibinizin tahminlerini sadece renk kodları ile görebilirsiniz</p>
        </div>

        {/* Mobile tip for interactive input */}
        {isMobile && (
          <div className="px-4 pb-4 text-center text-blue-300 text-xs">
            💡 Harf kutucuklarına tıklayarak yazabilirsiniz!
          </div>
        )}
      </div>
    </div>
  );
}
