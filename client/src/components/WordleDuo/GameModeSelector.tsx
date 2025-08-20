import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { GameMode } from '../../types/game';

interface GameModeSelectorProps {
  onBack: () => void;
}

export function GameModeSelector({ onBack }: GameModeSelectorProps) {
  const [playerName, setPlayerName] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { createRoom, gameState } = useWordleDuo();

  const handleCreateRoom = async () => {
    if (!selectedMode || !playerName.trim()) return;

    setIsCreating(true);
    try {
      await createRoom(selectedMode, playerName.trim());
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-3xl font-bold text-white">Oda Oluştur</h2>
          </div>

          {/* Player Name Input */}
          <motion.div variants={itemVariants} className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Oyuncu Adınız
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Adınızı girin..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </motion.div>

          {/* Game Mode Selection */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Oyun Modunu Seçin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Sequential Mode */}
              <button
                onClick={() => setSelectedMode('sequential')}
                className={`glass-card rounded-2xl p-6 text-left transition-all ${
                  selectedMode === 'sequential' 
                    ? 'ring-2 ring-red-500 bg-red-500/20' 
                    : 'hover:scale-105'
                }`}
              >
                <div className="text-4xl mb-3">⚡</div>
                <h4 className="text-xl font-bold text-white mb-2">Sırayla Modu</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Ortak bir panelde sırayla tahmin yapın. Her oyuncu bir satır tamamladıktan 
                  sonra sıra diğer oyuncuya geçer.
                </p>
                <div className="flex items-center text-xs text-gray-400">
                  <span className="bg-blue-500/20 px-2 py-1 rounded">Kooperatif</span>
                  <span className="ml-2">• Sınırsız satır</span>
                </div>
              </button>

              {/* Duel Mode */}
              <button
                onClick={() => setSelectedMode('duel')}
                className={`glass-card rounded-2xl p-6 text-left transition-all ${
                  selectedMode === 'duel' 
                    ? 'ring-2 ring-red-500 bg-red-500/20' 
                    : 'hover:scale-105'
                }`}
              >
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="text-xl font-bold text-white mb-2">Düello Modu</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Ayrı panellerde farklı kelimelerle yarışın. Kim önce doğru 
                  kelimeyi bulursa kazanır!
                </p>
                <div className="flex items-center text-xs text-gray-400">
                  <span className="bg-red-500/20 px-2 py-1 rounded">Yarışma</span>
                  <span className="ml-2">• 6 deneme hakkı</span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Error Display */}
          {gameState.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300"
            >
              {gameState.error}
            </motion.div>
          )}

          {/* Create Button */}
          <motion.div variants={itemVariants}>
            <button
              onClick={handleCreateRoom}
              disabled={!selectedMode || !playerName.trim() || isCreating}
              className="w-full turkish-red rounded-xl py-4 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Oda Oluşturuluyor...
                </div>
              ) : (
                'Oda Oluştur'
              )}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
