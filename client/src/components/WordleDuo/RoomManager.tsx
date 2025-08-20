import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';

interface RoomManagerProps {
  onBack: () => void;
}

export function RoomManager({ onBack }: RoomManagerProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinRoom, gameState } = useWordleDuo();

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !playerName.trim()) return;

    setIsJoining(true);
    try {
      await joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleRoomCodeChange = (value: string) => {
    // Only allow alphanumeric characters and limit to 6 characters
    const cleaned = value.replace(/[^A-Z0-9]/g, '').substring(0, 6);
    setRoomCode(cleaned);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
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
            <h2 className="text-3xl font-bold text-white">Odaya Katıl</h2>
          </div>

          {/* Player Name Input */}
          <div className="mb-6">
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
          </div>

          {/* Room Code Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Oda Kodu
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => handleRoomCodeChange(e.target.value.toUpperCase())}
              placeholder="6 haneli oda kodu..."
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-center text-2xl font-mono tracking-widest"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Oda kodunu arkadaşınızdan alın
            </p>
          </div>

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

          {/* Join Button */}
          <button
            onClick={handleJoinRoom}
            disabled={!roomCode.trim() || !playerName.trim() || roomCode.length !== 6 || isJoining}
            className="w-full turkish-red rounded-xl py-4 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            {isJoining ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Odaya Katılınıyor...
              </div>
            ) : (
              'Odaya Katıl'
            )}
          </button>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>
              Oda kodu arkadaşınızın size verdiği 6 haneli koddur.
              <br />
              Örnek: ABC123
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
