import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';

export function WinScreen() {
  const { gameState, resetGame } = useWordleDuo();

  // Trigger confetti effect
  useEffect(() => {
    const createConfetti = () => {
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(confettiContainer);

      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'absolute w-2 h-2 confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'][Math.floor(Math.random() * 4)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confettiContainer.appendChild(confetti);
      }

      setTimeout(() => {
        document.body.removeChild(confettiContainer);
      }, 3000);
    };

    createConfetti();
  }, []);

  if (!gameState.roomData) return null;

  // Determine winner
  const lastGuess = gameState.roomData.gameHistory[gameState.roomData.gameHistory.length - 1];
  const isWinner = lastGuess?.result.every((status: any) => status === 'correct');
  const winner = isWinner ? lastGuess : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex items-center justify-center p-4"
    >
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-8xl mb-4">
            {winner ? '🎉' : '😔'}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            {winner ? 'Tebrikler!' : 'Oyun Bitti'}
          </h2>
          {winner && (
            <p className="text-xl text-gray-300 mb-4">
              <span className="text-2xl">{winner.playerAvatar}</span> {winner.playerName} kazandı!
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
          className="space-y-4"
        >
          <button
            onClick={resetGame}
            className="w-full turkish-red rounded-xl py-4 text-white font-bold text-lg hover:scale-105 transition-transform"
          >
            Yeni Oyun
          </button>
          
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Wordle Duo',
                  text: `${winner ? winner.playerName + ' kazandı!' : 'Oyun bitti!'} Wordle Duo'da benimle oyna!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link kopyalandı!');
              }
            }}
            className="w-full glass-button rounded-xl py-3 text-white font-medium hover:scale-105 transition-transform"
          >
            Sonucu Paylaş
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
