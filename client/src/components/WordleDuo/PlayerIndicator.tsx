import React from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';

export function PlayerIndicator() {
  const { gameState } = useWordleDuo();

  if (!gameState.roomData?.players) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
      {gameState.roomData.players.map((player: any, index: number) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`
            flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg glass-card w-full sm:w-auto
            ${gameState.roomData!.mode === 'sequential' && 
              gameState.roomData!.currentTurn === index ? 'ring-2 ring-red-500 glow-animation' : ''}
          `}
        >
          <span className="text-lg sm:text-xl flex-shrink-0">{player.avatar}</span>
          <div className="min-w-0 flex-1 sm:flex-initial">
            <div className="text-xs sm:text-sm font-medium text-white truncate">
              {player.name.length > 10 ? player.name.slice(0, 10) + '...' : player.name}
            </div>
            <div className="text-xs text-gray-400">
              {player.status === 'online' ? (
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="hidden sm:inline">Çevrimiçi</span>
                  <span className="sm:hidden">Online</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full mr-1"></div>
                  <span className="hidden sm:inline">Çevrimdışı</span>
                  <span className="sm:hidden">Offline</span>
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
