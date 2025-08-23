import React from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { useOrientation } from '../../hooks/useOrientation';
import { LetterGrid } from './LetterGrid';

export function DuelMode() {
  const { gameState } = useWordleDuo();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Wordle Duo</h1>
        <p className="text-blue-200">Düello Mod - {gameState.roomData.players.length} Oyuncu</p>
      </div>

      {/* Game Container - Scrollable */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Players Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gameState.roomData.players.map((player: any, index: number) => (
            <div
              key={player.id}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center transition-all ${
                gameState.roomData!.currentTurn === index
                  ? 'ring-2 ring-red-500 bg-red-500/20'
                  : ''
              }`}
            >
              <div className="text-2xl mb-2">{player.avatar}</div>
              <div className="font-semibold text-lg mb-1">{player.name}</div>
              <div className="text-sm text-blue-200">
                {gameState.roomData!.currentTurn === index ? 'Oynuyor...' : 'Bekliyor...'}
              </div>
            </div>
          ))}
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
                  letters={Array.isArray(row.guess) ? row.guess : row.guess.split('')}
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
