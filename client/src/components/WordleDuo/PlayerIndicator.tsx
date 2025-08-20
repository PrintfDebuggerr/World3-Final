import React from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';

export function PlayerIndicator() {
  const { gameState } = useWordleDuo();

  if (!gameState.roomData?.players) return null;

  return (
    <div className="flex items-center space-x-2">
      {gameState.roomData.players.map((player: any, index: number) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg glass-card
            ${gameState.roomData!.mode === 'sequential' && 
              gameState.roomData!.currentTurn === index ? 'ring-2 ring-red-500 glow-animation' : ''}
          `}
        >
          <span className="text-xl">{player.avatar}</span>
          <div>
            <div className="text-sm font-medium text-white">{player.name}</div>
            <div className="text-xs text-gray-400">
              {player.status === 'online' ? (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Çevrimiçi
                </span>
              ) : (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                  Çevrimdışı
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
