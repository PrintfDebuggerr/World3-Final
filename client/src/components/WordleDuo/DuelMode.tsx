import React from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { useOrientation } from '../../hooks/useOrientation';
import { LetterGrid } from './LetterGrid';

export function DuelMode() {
  const { gameState, handleLetterClick } = useWordleDuo();
  const { orientation, isMobile } = useOrientation();

  if (!gameState.roomData || !gameState.playerData) return null;

  // Show orientation warning for mobile users in portrait mode
  if (isMobile && orientation === 'portrait') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm mx-auto"
        >
          <div className="glass-card rounded-2xl p-6">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-white mb-4">Telefonu Çevirin</h3>
            <p className="text-gray-300 mb-6">
              Düello modunda daha iyi deneyim için telefonunuzu yatay moda çevirin.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Yatay modda fiziksel klavyenizi kullanabilirsiniz.
            </p>
            <div className="flex items-center justify-center space-x-2 text-orange-400">
              <span className="text-2xl">📱</span>
              <span className="text-xl">→</span>
              <span className="text-2xl transform rotate-90">📱</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
      } else if (i === guesses.length && showLetters && gameState.currentInput && isCurrentPlayer) {
        // Current input row - make it interactive
        const letters = gameState.currentInput.padEnd(5, ' ').split('');
        rows.push({
          letters,
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
    <div className={`flex-1 ${isMobile && orientation === 'landscape' ? 'p-0.5' : 'p-2 sm:p-4'}`}>
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Mode Header - Compact for mobile landscape */}
        {!(isMobile && orientation === 'landscape') && (
          <div className="text-center mb-2 sm:mb-4 lg:mb-6">
            <div className="glass-card rounded-xl sm:rounded-2xl p-2 sm:p-4">
              <h3 className="text-sm sm:text-lg font-bold text-white mb-1 sm:mb-2">🏆 Düello Modu</h3>
              {!isMobile && (
                <p className="text-gray-300 text-xs sm:text-sm">
                  Farklı kelimelerle yarışın! Kim önce bulursa kazanır.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Dual Grid Layout - Responsive for mobile landscape */}
        <div className={`grid flex-1 ${
          isMobile && orientation === 'landscape' 
            ? 'grid-cols-2 gap-0.5' 
            : 'grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 lg:gap-8'
        }`}>
          {/* My Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={isMobile ? "space-y-1" : "space-y-4"}
          >
            <div className={`glass-card rounded-xl sm:rounded-2xl ${
              isMobile && orientation === 'landscape' ? 'p-0.5' : isMobile ? 'p-2' : 'p-4'
            }`}>
              <div className={`flex items-center justify-center space-x-1 sm:space-x-2 ${
                isMobile && orientation === 'landscape' ? 'mb-0.5' : isMobile ? 'mb-2' : 'mb-4'
              }`}>
                <span className={isMobile ? "text-lg" : "text-2xl"}>{gameState.playerData.avatar}</span>
                <span className={`text-white font-bold ${isMobile ? 'text-sm truncate max-w-20' : ''}`}>
                  {isMobile && gameState.playerData.name.length > 8 
                    ? gameState.playerData.name.slice(0, 8) + '...' 
                    : gameState.playerData.name}
                </span>
                <span className={`text-green-400 ${isMobile ? 'text-sm' : ''}`}>👤</span>
              </div>
              
              <div className={isMobile && orientation === 'landscape' ? "space-y-0.5" : isMobile ? "space-y-1" : "space-y-2"}>
                {myGrid.map((row, index) => (
                  <LetterGrid
                    key={index}
                    letters={row.letters}
                    statuses={row.statuses}
                    animate={row.animate}
                    enlarged={isMobile && orientation === 'landscape'}
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
            className={isMobile ? "space-y-1" : "space-y-4"}
          >
            <div className={`glass-card rounded-xl sm:rounded-2xl ${
              isMobile && orientation === 'landscape' ? 'p-0.5' : isMobile ? 'p-2' : 'p-4'
            }`}>
              <div className={`flex items-center justify-center space-x-1 sm:space-x-2 ${
                isMobile && orientation === 'landscape' ? 'mb-0.5' : isMobile ? 'mb-2' : 'mb-4'
              }`}>
                <span className={isMobile ? "text-lg" : "text-2xl"}>{player2?.avatar || '👤'}</span>
                <span className={`text-white font-bold ${isMobile ? 'text-sm truncate max-w-20' : ''}`}>
                  {isMobile && (player2?.name || 'Oyuncu 2').length > 8 
                    ? (player2?.name || 'Oyuncu 2').slice(0, 8) + '...' 
                    : player2?.name || 'Oyuncu 2'}
                </span>
                <span className={`text-red-400 ${isMobile ? 'text-sm' : ''}`}>🔥</span>
              </div>
              
              <div className={isMobile && orientation === 'landscape' ? "space-y-0.5" : isMobile ? "space-y-1" : "space-y-2"}>
                {opponentGrid.map((row, index) => (
                  <LetterGrid
                    key={index}
                    letters={row.letters}
                    statuses={row.statuses}
                    animate={row.animate}
                    enlarged={isMobile && orientation === 'landscape'}
                    interactive={row.interactive}
                    onLetterClick={row.interactive ? () => {
                      // This function will be implemented in LetterGrid
                    } : undefined}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Indicators - Hide on mobile landscape */}
        {!(isMobile && orientation === 'landscape') && (
          <div className={`${isMobile ? 'mt-2' : 'mt-6'} grid grid-cols-2 gap-2 sm:gap-4`}>
          <div className={`glass-card rounded-lg sm:rounded-xl ${isMobile ? 'p-2' : 'p-3'} text-center`}>
            <div className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>İlerlemeniz</div>
            <div className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              {myGuesses.length} / 6
            </div>
          </div>
          
          <div className={`glass-card rounded-lg sm:rounded-xl ${isMobile ? 'p-2' : 'p-3'} text-center`}>
            <div className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>Rakip İlerlemesi</div>
            <div className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              {opponentGuesses.length} / 6
            </div>
          </div>
          </div>
        )}

        {/* Instructions - Hide on mobile landscape */}
        {!isMobile && (
          <div className="mt-4 text-center text-gray-400 text-sm">
            <p>Rakibinizin tahminlerini sadece renk kodları ile görebilirsiniz</p>
          </div>
        )}

        {/* Mobile tip for interactive input */}
        {isMobile && (
          <div className="mt-2 text-center text-blue-300 text-xs">
            💡 Harf kutucuklarına tıklayarak yazabilirsiniz!
          </div>
        )}
      </div>
    </div>
  );
}
