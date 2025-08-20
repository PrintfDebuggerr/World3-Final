import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/WordleDuo/ErrorBoundary';
import { MainMenu } from './components/WordleDuo/MainMenu';
import { GameBoard } from './components/WordleDuo/GameBoard';
import { useGameState } from './hooks/useGameState';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/animations.css';

const queryClient = new QueryClient();

function GameContainer() {
  const gameState = useGameState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ef4444 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #dc2626 0%, transparent 50%)`
        }}></div>
      </div>

      <AnimatePresence mode="wait">
        {gameState.phase === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MainMenu />
          </motion.div>
        )}

        {(gameState.phase === 'waiting' || gameState.phase === 'playing' || gameState.phase === 'finished') && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <GameBoard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-white text-xl">Yükleniyor...</div>
          </div>
        }>
          <GameContainer />
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
