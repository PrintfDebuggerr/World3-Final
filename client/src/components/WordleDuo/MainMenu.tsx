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
          <div className="text-8xl mb-4">🇹🇷</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent mb-4">
            WORDLE DUO
          </h1>
          <p className="text-xl text-gray-300">
            Arkadaşlarınızla Türkçe kelime tahmin oyunu
          </p>
        </motion.div>

        {/* Menu Buttons */}
        <motion.div variants={itemVariants} className="space-y-4 max-w-md mx-auto">
          <button
            onClick={() => setMenuState('create')}
            className="w-full glass-card rounded-2xl p-6 text-left hover:scale-105 transition-transform group"
          >
            <div className="flex items-center">
              <div className="text-4xl mr-4">🎮</div>
              <div>
                <h3 className="text-xl font-bold text-white">Oda Oluştur</h3>
                <p className="text-gray-300">Yeni bir oyun odası aç</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMenuState('join')}
            className="w-full glass-card rounded-2xl p-6 text-left hover:scale-105 transition-transform group"
          >
            <div className="flex items-center">
              <div className="text-4xl mr-4">🚪</div>
              <div>
                <h3 className="text-xl font-bold text-white">Odaya Katıl</h3>
                <p className="text-gray-300">Mevcut bir odaya katıl</p>
              </div>
            </div>
          </button>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-center">
              <div className="text-4xl mr-4">ℹ️</div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Nasıl Oynanır?</h3>
                <p className="text-sm text-gray-300">
                  5 harfli Türkçe kelimeleri tahmin edin. Yeşil = doğru harf ve konum, 
                  Sarı = doğru harf yanlış konum, Gri = yanlış harf.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-12 text-gray-400 text-sm">
          <p>Made with ❤️ for Turkish word game lovers</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
