import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/WordleDuo/ErrorBoundary';
import { MainMenu } from './components/WordleDuo/MainMenu';
import { GameBoard } from './components/WordleDuo/GameBoard';
import { motion } from 'framer-motion';
import './styles/animations.css';

const queryClient = new QueryClient();

function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ef4444 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #dc2626 0%, transparent 50%)`
        }}></div>
      </div>

      <Routes>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MainMenu />
          </motion.div>
        } />
        <Route path="/room/:roomCode" element={
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GameBoard />
          </motion.div>
        } />
      </Routes>
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
          <AppLayout />
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
