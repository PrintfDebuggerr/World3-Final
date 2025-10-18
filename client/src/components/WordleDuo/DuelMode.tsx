import React from 'react';
import { motion } from 'framer-motion';
import { useWordleDuo } from '../../hooks/useWordleDuo';
import { useOrientation } from '../../hooks/useOrientation';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useOptimizedAnimations } from '../../hooks/useOptimizedAnimations';
import { LetterGrid } from './LetterGrid';
import { TurkishKeyboard } from './TurkishKeyboard';

export function DuelMode() {
  const { gameState, handleLetterClick, handleKeyPress } = useWordleDuo();
  const { orientation, isMobile } = useOrientation();
  const { metrics, startRenderMeasurement, endRenderMeasurement, isPerformanceGood } = usePerformanceMonitor({
    enableFPSMonitoring: isMobile, // Only monitor FPS on mobile
    enableMemoryMonitoring: true,
    enableRenderTimeMonitoring: isMobile,
  });
  
  const { getOptimizedVariants, getOptimizedTransition, getHardwareAcceleratedStyle, shouldAnimate } = useOptimizedAnimations();

  if (!gameState.roomData || !gameState.playerData) return null;

  // Remove the portrait mode restriction - allow both orientations
  // Users can play in both portrait and landscape mode

  // Separate grids for each player
  const player1 = gameState.roomData.players[0];
  const player2 = gameState.roomData.players[1];
  const isPlayer1 = gameState.playerData.id === player1?.id;

  // Get player's own guesses
  const myGuesses = gameState.roomData.gameHistory.filter(
    (h: any) => h.playerId === gameState.playerData?.id
  );

  // Get opponent's guesses (only colors, not letters)
  const opponentGuesses = gameState.roomData.gameHistory.filter(
    (h: any) => h.playerId !== gameState.playerData?.id
  );

  // Track opponent progress for real-time animations
  const [previousOpponentCount, setPreviousOpponentCount] = React.useState(opponentGuesses.length);
  const [showOpponentUpdate, setShowOpponentUpdate] = React.useState(false);
  
  React.useEffect(() => {
    if (opponentGuesses.length > previousOpponentCount) {
      setPreviousOpponentCount(opponentGuesses.length);
      // Show real-time update notification on mobile
      if (isMobile) {
        setShowOpponentUpdate(true);
        setTimeout(() => setShowOpponentUpdate(false), 2000);
      }
    }
  }, [opponentGuesses.length, previousOpponentCount, isMobile]);

  // Create 6 rows for each player with enhanced mobile features
  const createPlayerGrid = (guesses: any[], showLetters: boolean, isCurrentPlayer: boolean = false, isOpponent: boolean = false) => {
    const rows = [];
    
    for (let i = 0; i < 6; i++) {
      const guess = guesses[i];
      if (guess) {
        // For opponent grid, use compact color-only display on mobile
        const letters = showLetters 
          ? guess.guess.split('') 
          : isOpponent && isMobile 
            ? ['●', '●', '●', '●', '●'] // Use dots for more compact mobile display
            : ['■', '■', '■', '■', '■']; // Use squares for desktop
        
        rows.push({
          letters,
          statuses: guess.result,
          animate: true,
          interactive: false,
          isNewGuess: i === guesses.length - 1 && isOpponent // Mark latest opponent guess for animation
        });
      } else if (i === guesses.length && showLetters && isCurrentPlayer) {
        // Current input row - make it interactive (even if currentInput is empty)
        const letters = gameState.currentInput ? gameState.currentInput.padEnd(5, ' ').split('') : ['', '', '', '', ''];
        rows.push({
          letters,
          statuses: Array(5).fill('empty'),
          animate: false,
          interactive: true,
          isNewGuess: false
        });
      } else if (i === guesses.length && showLetters && isCurrentPlayer && !gameState.currentInput) {
        // Empty input row for current player - make it interactive
        rows.push({
          letters: ['', '', '', '', ''],
          statuses: Array(5).fill('empty'),
          animate: false,
          interactive: true,
          isNewGuess: false
        });
      } else {
        // Empty row
        rows.push({
          letters: ['', '', '', '', ''],
          statuses: Array(5).fill('empty'),
          animate: false,
          interactive: false,
          isNewGuess: false
        });
      }
    }
    
    return rows;
  };

  const myGrid = createPlayerGrid(myGuesses, true, true, false); // showLetters=true, isCurrentPlayer=true, isOpponent=false
  const opponentGrid = createPlayerGrid(opponentGuesses, false, false, true); // showLetters=false, isCurrentPlayer=false, isOpponent=true

  // Performance monitoring
  React.useEffect(() => {
    startRenderMeasurement();
    return () => endRenderMeasurement();
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className={`mx-auto h-full flex flex-col w-full ${
        isMobile 
          ? 'max-w-none' // No max width restriction on mobile
          : 'max-w-6xl' // Standard max width on desktop
      }`}>
        {/* Mode Header */}
        <div className={`text-center ${
          isMobile 
            ? 'mb-2 p-2' // Compact header for mobile
            : 'mb-4 p-4' // Standard header for desktop
        }`}>
          <div className={`glass-card rounded-2xl ${
            isMobile 
              ? 'p-2' // Compact padding for mobile
              : 'p-4' // Standard padding for desktop
          }`}>
            <h3 className={`font-bold text-white ${
              isMobile 
                ? 'text-sm mb-1' // Smaller title for mobile
                : 'text-lg mb-2' // Standard title for desktop
            }`}>
              🏆 Düello Modu
            </h3>
            <p className={`text-gray-300 ${
              isMobile 
                ? 'text-xs' // Smaller description for mobile
                : 'text-sm' // Standard description for desktop
            }`}>
              Farklı kelimelerle yarışın! Kim önce bulursa kazanır.
            </p>
          </div>
        </div>

        {/* Grid Container - Mobile-optimized responsive layout */}
        <div className={`flex-1 overflow-hidden ${
          isMobile 
            ? 'px-1 pb-1' // Very tight padding for mobile to prevent overflow
            : 'px-4 pb-4' // Desktop: standard padding
        }`}>
          {/* Responsive Dual Grid Layout - Equal width columns */}
          <div className={`flex h-full overflow-hidden ${
            // Mobile: Minimal spacing to prevent overflow
            isMobile 
              ? 'gap-0.5' // Minimal gap for mobile
              : 'gap-8' // Standard gap for desktop
          }`}>
            {/* My Grid - Responsive Player Grid */}
            <motion.div
              initial={shouldAnimate ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={getOptimizedTransition({ duration: 0.5 })}
              style={getHardwareAcceleratedStyle()}
              className="flex-1 h-full min-w-0"
            >
              <div className={`glass-card rounded-lg h-full flex flex-col overflow-hidden ${
                // Minimal padding for mobile to prevent overflow
                isMobile 
                  ? 'p-1' // Minimal padding for all mobile orientations
                  : 'p-4' // Standard padding for desktop
              }`}>
                {/* Player Header - Responsive sizing */}
                <div className={`flex items-center justify-center space-x-1 ${
                  isMobile 
                    ? 'mb-1' // Minimal margin for mobile to save space
                    : 'mb-4' // Standard margin for desktop
                }`}>
                  <span className={`${
                    isMobile 
                      ? 'text-sm' // Smaller avatar for mobile
                      : 'text-2xl' // Standard size for desktop
                  }`}>
                    {gameState.playerData.avatar}
                  </span>
                  <span className={`text-white font-bold ${
                    isMobile 
                      ? 'text-xs' // Smaller text for mobile
                      : 'text-lg' // Standard size for desktop
                  }`}>
                    {gameState.playerData.name}
                  </span>
                  <span className={`text-green-400 ${
                    isMobile 
                      ? 'text-xs' // Smaller icon for mobile
                      : 'text-lg' // Standard size for desktop
                  }`}>
                    👤
                  </span>
                </div>
                
                {/* Letter Grid with responsive spacing */}
                <div className={`flex-1 flex flex-col justify-center ${
                  isMobile 
                    ? 'space-y-1' // Tight spacing for mobile to fit both players
                    : 'space-y-2' // Standard spacing for desktop
                }`}>
                  {myGrid.map((row, index) => (
                    <LetterGrid
                      key={index}
                      letters={row.letters}
                      statuses={row.statuses}
                      animate={row.animate}
                      enlarged={false}
                      compact={isMobile} // Use compact mode on mobile
                      interactive={row.interactive}
                      onLetterClick={row.interactive ? handleLetterClick : undefined}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Opponent Grid - Responsive Opponent Display */}
            <motion.div
              initial={shouldAnimate ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={getOptimizedTransition({ duration: 0.5 })}
              style={getHardwareAcceleratedStyle()}
              className="flex-1 h-full min-w-0"
            >
              <div className={`glass-card rounded-lg h-full flex flex-col overflow-hidden ${
                // Minimal padding for mobile to prevent overflow
                isMobile 
                  ? 'p-1' // Minimal padding for all mobile orientations
                  : 'p-4' // Standard padding for desktop
              }`}>
                {/* Opponent Header - Responsive sizing */}
                <div className={`flex items-center justify-center space-x-1 ${
                  isMobile 
                    ? 'mb-1' // Minimal margin for mobile to save space
                    : 'mb-4' // Standard margin for desktop
                }`}>
                  <span className={`${
                    isMobile 
                      ? 'text-sm' // Smaller avatar for mobile
                      : 'text-2xl' // Standard size for desktop
                  }`}>
                    {player2?.avatar || '👤'}
                  </span>
                  <span className={`text-white font-bold ${
                    isMobile 
                      ? 'text-xs' // Smaller text for mobile
                      : 'text-lg' // Standard size for desktop
                  }`}>
                    {player2?.name || 'Oyuncu 2'}
                  </span>
                  <span className={`text-red-400 ${
                    isMobile 
                      ? 'text-xs' // Smaller icon for mobile
                      : 'text-lg' // Standard size for desktop
                  }`}>
                    🔥
                  </span>
                </div>
                
                {/* Compact Opponent Grid with Color-Only Feedback */}
                <div className={`flex-1 flex flex-col justify-center ${
                  isMobile 
                    ? 'space-y-1' // Tight spacing for mobile to fit both players
                    : 'space-y-2' // Standard spacing for desktop
                }`}>
                  {opponentGrid.map((row, index) => (
                    <motion.div
                      key={index}
                      initial={row.isNewGuess ? { scale: 0.8, opacity: 0 } : false}
                      animate={row.isNewGuess ? { scale: 1, opacity: 1 } : {}}
                      transition={{ 
                        duration: 0.6, 
                        ease: "easeOut",
                        delay: row.isNewGuess ? 0.1 : 0 
                      }}
                    >
                      <LetterGrid
                        letters={row.letters}
                        statuses={row.statuses}
                        animate={row.animate}
                        enlarged={false}
                        compact={isMobile} // Use compact mode on mobile
                        interactive={false}
                        onLetterClick={undefined}
                      />
                    </motion.div>
                  ))}
                </div>
                
                {/* Mobile-specific opponent status indicator */}
                {isMobile && (
                  <div className="mt-1 text-center">
                    <div className={`inline-flex items-center space-x-1 px-1 py-0.5 rounded-full ${
                      opponentGuesses.length > myGuesses.length 
                        ? 'bg-red-500/20 text-red-300' 
                        : opponentGuesses.length === myGuesses.length
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-green-500/20 text-green-300'
                    }`}>
                      <span className="text-xs">
                        {opponentGuesses.length > myGuesses.length 
                          ? '🏃‍♂️' 
                          : opponentGuesses.length === myGuesses.length
                            ? '🤝'
                            : '🐌'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile-Friendly Progress Indicators */}
        <div className={`${
          isMobile 
            ? 'mt-1 px-1 pb-1' // Minimal spacing for mobile
            : 'mt-4 px-4 pb-4' // Standard spacing for desktop
        }`}>
          <div className={`grid grid-cols-2 ${
            isMobile 
              ? 'gap-1' // Tighter gap for mobile
              : 'gap-4' // Standard gap for desktop
          }`}>
            {/* My Progress - Enhanced with visual progress bar */}
            <motion.div 
              className={`glass-card rounded-lg text-center ${
                isMobile 
                  ? 'p-1' // Very compact padding for mobile
                  : 'p-3' // Standard padding for desktop
              }`}
              whileHover={shouldAnimate ? { scale: 1.02 } : {}}
              transition={getOptimizedTransition({ duration: 0.2 })}
              style={getHardwareAcceleratedStyle()}
            >
              <div className={`text-green-400 ${
                isMobile 
                  ? 'text-xs' // Smaller text for mobile
                  : 'text-sm' // Standard size for desktop
              }`}>
                İlerleme
              </div>
              <div className={`font-bold text-white ${
                isMobile 
                  ? 'text-sm' // Smaller for mobile
                  : 'text-xl' // Standard size for desktop
              }`}>
                {myGuesses.length}/6
              </div>
              {/* Visual Progress Bar */}
              <div className={`bg-gray-700 rounded-full ${
                isMobile 
                  ? 'h-1 mt-0.5' // Thinner bar for mobile
                  : 'h-2 mt-2' // Standard thickness for desktop
              }`}>
                <motion.div
                  className="bg-green-400 h-full rounded-full"
                  initial={shouldAnimate ? { width: 0 } : { width: `${(myGuesses.length / 6) * 100}%` }}
                  animate={{ width: `${(myGuesses.length / 6) * 100}%` }}
                  transition={getOptimizedTransition({ duration: 0.5, ease: "easeOut" })}
                  style={getHardwareAcceleratedStyle()}
                />
              </div>
            </motion.div>
            
            {/* Opponent Progress - Enhanced with visual progress bar */}
            <motion.div 
              className={`glass-card rounded-lg text-center ${
                isMobile 
                  ? 'p-1' // Very compact padding for mobile
                  : 'p-3' // Standard padding for desktop
              }`}
              whileHover={shouldAnimate ? { scale: 1.02 } : {}}
              transition={getOptimizedTransition({ duration: 0.2 })}
              style={getHardwareAcceleratedStyle()}
            >
              <div className={`text-red-400 ${
                isMobile 
                  ? 'text-xs' // Smaller text for mobile
                  : 'text-sm' // Standard size for desktop
              }`}>
                Rakip
              </div>
              <div className={`font-bold text-white ${
                isMobile 
                  ? 'text-sm' // Smaller for mobile
                  : 'text-xl' // Standard size for desktop
              }`}>
                {opponentGuesses.length}/6
              </div>
              {/* Visual Progress Bar */}
              <div className={`bg-gray-700 rounded-full ${
                isMobile 
                  ? 'h-1 mt-0.5' // Thinner bar for mobile
                  : 'h-2 mt-2' // Standard thickness for desktop
              }`}>
                <motion.div
                  className="bg-red-400 h-full rounded-full"
                  initial={shouldAnimate ? { width: 0 } : { width: `${(opponentGuesses.length / 6) * 100}%` }}
                  animate={{ width: `${(opponentGuesses.length / 6) * 100}%` }}
                  transition={getOptimizedTransition({ duration: 0.5, ease: "easeOut" })}
                  style={getHardwareAcceleratedStyle()}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Mobile Instructions */}
        <div className={`text-center text-gray-400 ${
          isMobile 
            ? 'px-1 pb-1 text-xs' // Minimal padding for mobile
            : 'px-4 pb-4 text-sm' // Standard for desktop
        }`}>
          <p>
            {isMobile 
              ? 'Rakip tahminleri ● ile gösterilir'
              : 'Rakibinizin tahminlerini sadece renk kodları ile görebilirsiniz'
            }
          </p>
        </div>

        {/* Real-time Update Notification */}
        {isMobile && showOpponentUpdate && shouldAnimate && (
          <motion.div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={getOptimizedTransition({ duration: 0.3 })}
            style={getHardwareAcceleratedStyle()}
          >
            <div className="bg-orange-500/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <span>🔥</span>
                <span className="text-sm font-medium">Rakip hamle yaptı!</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Mobile Tips */}
        {isMobile && (
          <motion.div 
            className="text-center px-1 pb-1"
            initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getOptimizedTransition({ delay: shouldAnimate ? 1 : 0, duration: 0.5 })}
            style={getHardwareAcceleratedStyle()}
          >
            <div className="inline-flex items-center space-x-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
              <span>💡</span>
              <span>Kutulara dokunarak yazın!</span>
            </div>
          </motion.div>
        )}

        {/* Turkish Keyboard - Expanded for better mobile experience */}
        <div className={`${
          isMobile 
            ? 'px-1 pb-2 flex-shrink-0' // More bottom padding and prevent shrinking
            : 'px-4 pb-4' // Standard padding for desktop
        }`}>
          <TurkishKeyboard 
            onKeyPress={handleKeyPress}
            keyboardStatus={gameState.keyboardStatus}
            adaptiveSize={true} // Enable adaptive sizing
            hapticFeedback={isMobile} // Enable haptic feedback on mobile
            autoHide={false} // Always show keyboard in DuelMode
          />
        </div>


      </div>
    </div>
  );
}
