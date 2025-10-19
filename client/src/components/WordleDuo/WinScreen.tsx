import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';

export function WinScreen() {
  const { gameState, requestNewGame } = useWordleDuo();

  // Trigger confetti effect
  useEffect(() => {
    const createConfetti = () => {
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-0';
      document.body.appendChild(confettiContainer);

      // Special heart effect for DENİZ word 💕
      if (gameState.roomData?.word === 'DENİZ') {
        // Create floating hearts
        for (let i = 0; i < 30; i++) {
          const heart = document.createElement('div');
          heart.innerHTML = ['💕', '💖', '💝', '💗', '💓'][Math.floor(Math.random() * 5)];
          heart.className = 'absolute text-2xl floating-heart';
          heart.style.left = Math.random() * 100 + '%';
          heart.style.animationDelay = Math.random() * 4 + 's';
          heart.style.animationDuration = (3 + Math.random() * 2) + 's';
          confettiContainer.appendChild(heart);
        }
      } else {
        // Regular confetti
        for (let i = 0; i < 50; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'absolute w-2 h-2 confetti';
          confetti.style.left = Math.random() * 100 + '%';
          confetti.style.backgroundColor = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'][Math.floor(Math.random() * 4)];
          confetti.style.animationDelay = Math.random() * 3 + 's';
          confettiContainer.appendChild(confetti);
        }
      }

      setTimeout(() => {
        document.body.removeChild(confettiContainer);
      }, 5000);
    };

    createConfetti();
  }, [gameState.roomData?.word]);

  if (!gameState.roomData) return null;

  // Determine winner and current player
  const lastGuess = gameState.roomData.gameHistory[gameState.roomData.gameHistory.length - 1];
  const isWinner = lastGuess?.result.every((status: any) => status === 'correct');
  const winner = isWinner ? lastGuess : null;
  
  // Check if both players lost in duel mode (6 attempts reached)
  const isDuelModeLoss = gameState.roomData.mode === 'duel' && !isWinner && 
    gameState.roomData.gameHistory.filter((h: any) => h.playerId === gameState.roomData.players[0].id).length >= 6 &&
    gameState.roomData.gameHistory.filter((h: any) => h.playerId === gameState.roomData.players[1].id).length >= 6;
  
  // Get current player from localStorage or use playerData
  const storedPlayerId = localStorage.getItem('wordle-duo-player-id') || gameState.playerData?.id;
  const currentPlayer = gameState.roomData.players.find(p => p.id === storedPlayerId);
  const isCurrentPlayerWinner = winner && winner.playerId === storedPlayerId;
  
  console.log('Win Screen Debug:', {
    lastGuess,
    isWinner,
    winner,
    storedPlayerId,
    currentPlayer,
    isCurrentPlayerWinner
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        minHeight: '100%',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)'
      }}
    >
      <div className="text-center max-w-md w-full my-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-8xl mb-4">
            {isCurrentPlayerWinner ? '🎉' : winner ? '😔' : isDuelModeLoss ? '😢' : '🤝'}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            {isCurrentPlayerWinner ? 'Tebrikler!' : winner ? 'Kaybettiniz!' : isDuelModeLoss ? 'İkiniz de Kaybettiniz!' : 'Oyun Bitti'}
          </h2>
          {winner && (
            <p className="text-xl text-gray-300 mb-4">
              <span className="text-2xl">{winner.playerAvatar}</span> {winner.playerName} 
              {isCurrentPlayerWinner ? ' (Sen) kazandın!' : ' kazandı!'}
            </p>
          )}
          {isDuelModeLoss && (
            <p className="text-xl text-gray-300 mb-4">
              Her iki oyuncu da 6 deneme hakkını kullandı ve kelimeyi bulamadı! 😢
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">Oyun Özeti</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Mod:</span>
              <span className="capitalize">{gameState.roomData.mode === 'sequential' ? 'Sırayla' : 'Düello'}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Toplam Tahmin:</span>
              <span>{gameState.roomData.gameHistory.length}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Kelime:</span>
              <span className="font-mono uppercase">{gameState.roomData.word}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 relative z-20"
          style={{ paddingBottom: '20px' }}
        >
          {/* Yeni Oyun İsteği Durumu */}
          <div className="glass-card rounded-2xl p-4 mb-4">
            <h4 className="text-lg font-bold text-white mb-3">Yeni Oyun İsteği</h4>
            <div className="space-y-2">
              {gameState.roomData.players.map(player => {
                const hasRequested = gameState.roomData.newGameRequests?.includes(player.id) || false;
                const isCurrentPlayer = player.id === gameState.playerData?.id;
                return (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{player.avatar}</span>
                      <span className="text-gray-300">
                        {player.name} {isCurrentPlayer ? '(Sen)' : ''}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm ${
                      hasRequested 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {hasRequested ? '✅ İstek Gönderdi' : '⏳ Bekleniyor'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Yeni Oyun Butonu */}
          <button
            onClick={requestNewGame}
            className={`w-full rounded-xl py-4 text-white font-bold text-lg hover:scale-105 transition-transform relative z-20 ${
              gameState.roomData.newGameRequests?.includes(gameState.playerData?.id || '')
                ? 'bg-gray-600 hover:bg-gray-700' // İstek gönderilmişse
                : 'turkish-red' // İstek gönderilmemişse
            }`}
          >
            {gameState.roomData.newGameRequests?.includes(gameState.playerData?.id || '')
              ? 'İsteği İptal Et'
              : 'Yeni Oyun İsteği Gönder'
            }
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
