import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameModeSelector } from './GameModeSelector';
import { RoomManager } from './RoomManager';

type MenuState = 'main' | 'create' | 'join';

export function MainMenu() {
  const [menuState, setMenuState] = useState<MenuState>('main');

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (menuState === 'create') {
    return <GameModeSelector onBack={() => setMenuState('main')} />;
  }

  if (menuState === 'join') {
    return <RoomManager onBack={() => setMenuState('main')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        {/* Logo and Title */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="text-8xl mb-6 animate-bounce">🎯</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-wider">
            WORDL3
          </h1>
          <p className="text-xl text-gray-300 text-center max-w-lg mx-auto leading-relaxed">
            Arkadaşlarınızla birlikte 5 harfli kelimeleri tahmin edin ve eğlenceli bir oyun deneyimi yaşayın! 🚀
          </p>
        </motion.div>

        {/* Menu Buttons */}
        <motion.div variants={itemVariants} className="space-y-4 max-w-md mx-auto">
          <button
            onClick={() => setMenuState('create')}
            className="w-full glass-card rounded-2xl p-6 text-left hover:scale-105 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/25"
          >
            <div className="flex items-center">
              <div className="text-4xl mr-4 group-hover:rotate-12 transition-transform duration-300">✨</div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Oda Oluştur</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">Yeni bir oyun odası aç ve arkadaşlarını davet et</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMenuState('join')}
            className="w-full glass-card rounded-2xl p-6 text-left hover:scale-105 transition-all duration-300 group hover:shadow-2xl hover:shadow-green-500/25"
          >
            <div className="flex items-center">
              <div className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">🚀</div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-green-300 transition-colors">Odaya Katıl</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">Arkadaşının odasına katıl ve hemen oynamaya başla</p>
              </div>
            </div>
          </button>

          <div className="glass-card rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
            <div className="flex items-center justify-center">
              <div className="text-4xl mr-4 animate-pulse">📚</div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-3">Nasıl Oynanır?</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>🎯 5 harfli Türkçe kelimeleri tahmin edin</p>
                  <p>🟢 <span className="text-green-400">Yeşil</span> = Doğru harf, doğru konum</p>
                  <p>🟡 <span className="text-yellow-400">Sarı</span> = Doğru harf, yanlış konum</p>
                  <p>⚫ <span className="text-gray-400">Gri</span> = Yanlış harf</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-12 text-gray-400 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span className="animate-pulse">🌟</span>
            <span className="animate-pulse">🌟</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
