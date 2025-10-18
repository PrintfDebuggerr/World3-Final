import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { LetterGrid } from './LetterGrid';
import { useOrientation } from '../../hooks/useOrientation';
import { mobileUtilities } from '../../lib/mobile-utils';

export function SequentialMode() {
  const { gameState, handleLetterClick, updateCurrentInput } = useWordleDuo();
  const { isMobile, isTablet, deviceCategory, orientation } = useOrientation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentRowRef = useRef<HTMLDivElement>(null);
  const [focusedLetterIndex, setFocusedLetterIndex] = useState<number | null>(null);



  // Auto-scroll to bottom when new words are added
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Auto-scroll only when new words are added (not on every change)
  const [lastHistoryLength, setLastHistoryLength] = useState(0);
  
  useEffect(() => {
    const currentLength = gameState.roomData?.gameHistory?.length || 0;
    
    // Only scroll if a new word was added (length increased)
    if (currentLength > lastHistoryLength) {
      setTimeout(scrollToBottom, 100);
      setLastHistoryLength(currentLength);
    } else if (currentLength !== lastHistoryLength) {
      // Update length without scrolling (for other changes)
      setLastHistoryLength(currentLength);
    }
  }, [gameState.roomData?.gameHistory, scrollToBottom, lastHistoryLength]);

  // Touch-to-type functionality
  const handleLetterInput = useCallback((index: number, letter: string) => {
    if (!gameState.isMyTurn) return;
    
    const currentInput = gameState.currentInput || '';
    let newInput = currentInput;
    
    if (letter === '') {
      // Backspace - remove letter at index
      if (index < currentInput.length) {
        newInput = currentInput.slice(0, index) + currentInput.slice(index + 1);
      }
    } else {
      // Add or replace letter at index
      const inputArray = [...(currentInput.padEnd(5, ' '))];
      inputArray[index] = letter;
      newInput = inputArray.join('').trimEnd();
    }
    
    // Update game state
    if (updateCurrentInput) {
      updateCurrentInput(newInput);
    }
    
    // Haptic feedback for mobile
    if (isMobile) {
      mobileUtilities.touch.vibrate(10);
    }
  }, [gameState.isMyTurn, gameState.currentInput, updateCurrentInput, isMobile]);

  // Enhanced letter click handler with mobile optimizations
  const handleEnhancedLetterClick = useCallback((index: number) => {
    setFocusedLetterIndex(index);
    
    // Haptic feedback
    if (isMobile) {
      mobileUtilities.touch.vibrate(15);
    }
    
    // Call original handler
    if (handleLetterClick) {
      handleLetterClick(index);
    }
  }, [isMobile, handleLetterClick]);



  if (!gameState.roomData) return null;

  // Create grid rows from game history - Show only last 5 entries
  const allGridRows = gameState.roomData.gameHistory.map((entry: any) => ({
    playerId: entry.playerId,
    playerName: gameState.roomData!.players.find((p: any) => p.id === entry.playerId)?.name || 'Unknown',
    playerAvatar: gameState.roomData!.players.find((p: any) => p.id === entry.playerId)?.avatar || '👤',
    guess: entry.guess,
    result: entry.result,
    rowIndex: entry.rowIndex
  }));
  
  // Show last 5 words by default, but allow scrolling to see more
  const maxVisibleRows = 5;
  const gridRows = allGridRows;

  // Get mobile-optimized spacing
  const spacing = mobileUtilities.utils.getSpacing('md');
  const compactSpacing = mobileUtilities.utils.getSpacing('sm');

  // Determine layout configuration based on device
  const layoutConfig = {
    headerHeight: isMobile ? '60px' : isTablet ? '72px' : '80px',
    playerNameMaxLength: isMobile ? 6 : isTablet ? 10 : 12,
    showFullPlayerInfo: !isMobile || orientation === 'landscape',
    compactMode: isMobile && orientation === 'portrait',
    stickyCurrentRow: isMobile,
  };

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col overflow-hidden"
        style={{ 
          padding: isMobile ? `${compactSpacing}px` : `${spacing}px`,
          gap: isMobile ? `${compactSpacing}px` : `${spacing}px`
        }}
      >
        {/* Compact Turn Indicator for Mobile */}
        <div className="flex-shrink-0">
          {layoutConfig.compactMode ? (
            // Mobile Portrait: Horizontal scrollable turn indicator
            <div className="mb-3">
              <h2 className="text-lg font-bold text-white mb-2 text-center">Sıra Kimde?</h2>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-2 pb-2 min-w-max px-1">
                  {gameState.roomData.players.map((player: any, index: number) => (
                    <motion.div
                      key={player.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ 
                        scale: gameState.roomData!.currentTurn === index ? 1.05 : 1,
                        opacity: 1 
                      }}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                        gameState.roomData!.currentTurn === index
                          ? 'bg-red-500/30 ring-2 ring-red-500 shadow-lg'
                          : 'bg-white/10'
                      }`}
                      style={{ minWidth: '80px' }}
                    >
                      <span className="text-lg">{player.avatar}</span>
                      <span className="text-white font-medium text-sm">
                        {player.name.length > layoutConfig.playerNameMaxLength 
                          ? player.name.slice(0, layoutConfig.playerNameMaxLength) + '...' 
                          : player.name}
                      </span>
                      {gameState.roomData!.currentTurn === index && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Tablet/Desktop: Standard layout
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Sıra Kimde?</h2>
              <div className="flex justify-center flex-wrap gap-2 sm:gap-4">
                {gameState.roomData.players.map((player: any, index: number) => (
                  <motion.div
                    key={player.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ 
                      scale: gameState.roomData!.currentTurn === index ? 1.05 : 1,
                      opacity: 1 
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      gameState.roomData!.currentTurn === index
                        ? 'bg-red-500/30 ring-2 ring-red-500 shadow-lg'
                        : 'bg-white/10'
                    }`}
                  >
                    <span className="text-lg sm:text-2xl">{player.avatar}</span>
                    <span className="text-white font-medium text-sm sm:text-base">
                      {player.name.length > layoutConfig.playerNameMaxLength 
                        ? player.name.slice(0, layoutConfig.playerNameMaxLength) + '...' 
                        : player.name}
                    </span>
                    {gameState.roomData!.currentTurn === index && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Current player status */}
          <AnimatePresence>
            {!gameState.isMyTurn && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-center text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}
              >
                <span className="inline-flex items-center space-x-1">
                  <span>{gameState.roomData.players[gameState.roomData.currentTurn]?.avatar}</span>
                  <span>{gameState.roomData.players[gameState.roomData.currentTurn]?.name} oynuyor...</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></div>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Height Game History - Max 5 Visible, Scrollable */}
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto scroll-smooth"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: isMobile ? 'thin' : 'auto',
            height: `${maxVisibleRows * (isMobile ? 48 : 64) + (maxVisibleRows - 1) * (isMobile ? 4 : 8)}px`, // Fixed height for exactly 5 rows
            minHeight: `${maxVisibleRows * (isMobile ? 48 : 64) + (maxVisibleRows - 1) * (isMobile ? 4 : 8)}px`,
            maxHeight: `${maxVisibleRows * (isMobile ? 48 : 64) + (maxVisibleRows - 1) * (isMobile ? 4 : 8)}px`,
          }}
        >
          <div className={`space-y-${isMobile ? '1' : '2'} pb-2`}>
            {allGridRows.map((row, index) => (
              <motion.div
                key={`${row.playerId}-${row.rowIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center py-1 ${
                  isMobile ? 'space-x-2 min-h-12' : 'space-x-4 min-h-16'
                }`}
              >
                {/* Mobile-Friendly Player Indicator */}
                <div className={`flex items-center flex-shrink-0 ${
                  isMobile ? 'space-x-1 w-16' : 'space-x-2 w-32'
                }`}>
                  <span className={`flex-shrink-0 ${
                    isMobile ? 'text-base' : 'text-lg sm:text-xl'
                  }`}>
                    {row.playerAvatar}
                  </span>
                  {layoutConfig.showFullPlayerInfo && (
                    <span className={`text-gray-300 truncate min-w-0 ${
                      isMobile ? 'text-xs' : 'text-sm sm:text-base'
                    }`}>
                      {row.playerName.length > layoutConfig.playerNameMaxLength 
                        ? row.playerName.slice(0, layoutConfig.playerNameMaxLength) + '...' 
                        : row.playerName}
                    </span>
                  )}
                </div>

                {/* Letter Grid */}
                <div className="flex-1">
                  <LetterGrid
                    letters={row.guess.split('')}
                    statuses={row.result}
                    animate={row.result.some((r: any) => r !== 'empty')}
                    compact={layoutConfig.compactMode}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current Input Row - No longer sticky */}
        {gameState.isMyTurn && (
          <motion.div
            ref={currentRowRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 border-t border-white/10 pt-4"
          >
            <div className={`flex items-center py-2 ${
              isMobile ? 'space-x-2 min-h-12' : 'space-x-4 min-h-16'
            }`}>
              {/* Current Player Indicator */}
              <div className={`flex items-center flex-shrink-0 ${
                isMobile ? 'space-x-1 w-16' : 'space-x-2 w-32'
              }`}>
                <span className={`flex-shrink-0 ${
                  isMobile ? 'text-base' : 'text-lg sm:text-xl'
                }`}>
                  {gameState.playerData?.avatar}
                </span>
                {layoutConfig.showFullPlayerInfo && (
                  <span className={`text-gray-300 truncate min-w-0 font-medium ${
                    isMobile ? 'text-xs' : 'text-sm sm:text-base'
                  }`}>
                    {(gameState.playerData?.name || '').length > layoutConfig.playerNameMaxLength 
                      ? (gameState.playerData?.name || '').slice(0, layoutConfig.playerNameMaxLength) + '...' 
                      : gameState.playerData?.name}
                  </span>
                )}
              </div>
              
              {/* Interactive Letter Grid with Touch-to-Type */}
              <div className="flex-1">
                <LetterGrid
                  letters={gameState.currentInput ? 
                    [...gameState.currentInput.split(''), ...Array(5 - gameState.currentInput.length).fill('')] : 
                    ['', '', '', '', '']
                  }
                  statuses={Array(5).fill('empty')}
                  animate={false}
                  interactive={true}
                  onLetterClick={handleEnhancedLetterClick}
                  onLetterInput={handleLetterInput}
                  compact={layoutConfig.compactMode}
                  autoFocus={isMobile}
                  enableVirtualKeyboard={isMobile}
                />
              </div>
            </div>
            
            {/* Mobile-Friendly Player Indicators and Hints */}
            {isMobile && (
              <div className="space-y-2">
                {/* Touch interaction hints */}
                <div className="text-center text-gray-400 text-xs">
                  💡 Harf kutucuklarına dokunarak yazabilirsiniz
                </div>
                
                {/* Quick player status for mobile */}
                <div className="flex justify-center space-x-3 text-xs">
                  {gameState.roomData.players.map((player: any, index: number) => (
                    <div
                      key={player.id}
                      className={`flex items-center space-x-1 px-2 py-1 rounded ${
                        gameState.roomData!.currentTurn === index
                          ? 'bg-red-500/20 text-red-300'
                          : 'text-gray-500'
                      }`}
                    >
                      <span className="text-xs">{player.avatar}</span>
                      <span className="truncate max-w-12">
                        {player.name.slice(0, 4)}
                        {player.name.length > 4 ? '...' : ''}
                      </span>
                      {gameState.roomData!.currentTurn === index && (
                        <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Gesture hints */}
                <div className="text-center text-gray-500 text-xs">
                  ↕ Scroll to see history • Long press to clear letter
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions - Responsive */}
        {!gameState.isMyTurn && (
          <div className={`flex-shrink-0 text-center text-gray-400 ${
            isMobile ? 'text-xs mt-2' : 'text-sm mt-4'
          }`}>
            <p>Her oyuncu sırayla 5 harfli Türkçe kelime tahmin eder</p>
            {isMobile && (
              <p className="mt-1 text-blue-400 text-xs">
                📱 Mobil için optimize edildi
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
