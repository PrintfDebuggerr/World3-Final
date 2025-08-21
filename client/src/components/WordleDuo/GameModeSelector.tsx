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
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-card rounded-3xl p-4 sm:p-6 md:p-8">
          <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
            <button
              onClick={onBack}
              className="mr-4 p-3 rounded-xl hover:bg-white/10 hover:scale-110 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Oda Oluştur</h2>
          </div>

          {/* Player Name Input */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6 md:mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
              <span className="text-2xl mr-2">👤</span>
              Oyuncu Adınız
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Adınızı girin..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:bg-white/15"
            />
          </motion.div>

          {/* Game Mode Selection */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6 md:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center justify-center">
              <span className="text-3xl mr-3">🎮</span>
              Oyun Modunu Seçin
              <span className="text-3xl ml-3">🎮</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Sequential Mode */}
              <button
                onClick={() => setSelectedMode('sequential')}
                className={`glass-card rounded-2xl p-3 sm:p-4 md:p-6 text-left transition-all duration-300 group ${
                  selectedMode === 'sequential' 
                    ? 'ring-2 ring-blue-500 bg-blue-500/20 shadow-2xl shadow-blue-500/25' 
                    : 'hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25'
                }`}
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">🔄</div>
                <h4 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Sırayla Modu</h4>
                <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 group-hover:text-gray-200 transition-colors">
                  Ortak bir panelde sırayla tahmin yapın. Her oyuncu bir satır tamamladıktan 
                  sonra sıra diğer oyuncuya geçer.
                </p>
                <div className="flex items-center text-xs text-gray-400">
                  <span className="bg-blue-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">🤝 Kooperatif</span>
                  <span className="ml-1 sm:ml-2">• Sınırsız satır</span>
                </div>
              </button>

              {/* Duel Mode */}
              <button
                onClick={() => setSelectedMode('duel')}
                className={`glass-card rounded-2xl p-3 sm:p-4 md:p-6 text-left transition-all duration-300 group ${
                  selectedMode === 'duel' 
                    ? 'ring-2 ring-red-500 bg-red-500/20 shadow-2xl shadow-red-500/25' 
                    : 'hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25'
                }`}
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">⚔️</div>
                <h4 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-red-300 transition-colors">Düello Modu</h4>
                <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 group-hover:text-gray-200 transition-colors">
                  Ayrı panellerde farklı kelimelerle yarışın. Kim önce doğru 
                  kelimeyi bulursa kazanır!
                </p>
                <div className="flex items-center text-xs text-gray-400">
                  <span className="bg-red-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">🔥 Yarışma</span>
                  <span className="ml-1 sm:ml-2">• 6 deneme hakkı</span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Error Display */}
          {gameState.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300"
            >
              {gameState.error}
            </motion.div>
          )}

          {/* Create Button */}
          <motion.div variants={itemVariants}>
            <button
              onClick={handleCreateRoom}
              disabled={!selectedMode || !playerName.trim() || isCreating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl py-4 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span className="animate-pulse">Oda Oluşturuluyor...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-2">🚀</span>
                  Oda Oluştur
                </div>
              )}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
