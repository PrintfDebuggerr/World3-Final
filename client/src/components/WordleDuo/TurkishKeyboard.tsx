import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LetterStatus } from '../../types/game';
import { useIsMobile } from '../../hooks/use-is-mobile';
import { mobileUtils, MOBILE_CONFIG } from '../../lib/mobile-config';
import { touch, viewport } from '../../lib/mobile-utils';

interface TurkishKeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardStatus: Record<string, LetterStatus>;
  disabled?: boolean;
  hapticFeedback?: boolean;
  adaptiveSize?: boolean;
  autoHide?: boolean;
  showVisualFeedback?: boolean;
}

interface KeyboardDimensions {
  keyWidth: number;
  keyHeight: number;
  keySpacing: number;
  fontSize: number;
  containerPadding: number;
}

interface KeyPressAnimation {
  key: string;
  timestamp: number;
}

export function TurkishKeyboard({ 
  onKeyPress, 
  keyboardStatus, 
  disabled = false,
  hapticFeedback = true,
  adaptiveSize = true,
  autoHide = true,
  showVisualFeedback = true
}: TurkishKeyboardProps) {
  const isMobile = useIsMobile();
  const keyboardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<KeyboardDimensions>({
    keyWidth: 40,
    keyHeight: 48,
    keySpacing: 4,
    fontSize: 14,
    containerPadding: 16
  });
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [keyPressAnimations, setKeyPressAnimations] = useState<KeyPressAnimation[]>([]);
  const [virtualKeyboardOpen, setVirtualKeyboardOpen] = useState<boolean>(false);

  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç']
  ];

  const getKeyStatus = (key: string): LetterStatus => {
    return keyboardStatus[key] || 'empty';
  };

  // Calculate adaptive keyboard dimensions based on screen size
  const calculateDimensions = useCallback((): KeyboardDimensions => {
    if (typeof window === 'undefined') {
      return dimensions;
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const deviceCategory = mobileUtils.getDeviceCategory();
    const isPortrait = mobileUtils.isPortrait();
    
    // Get the longest row (first row has 12 keys, that's the maximum)
    const maxKeysInRow = Math.max(...keyboard.map(row => row.length)); // First row: 12 keys
    
    // Calculate available width with responsive margins
    let safeMargin: number;
    if (deviceCategory === 'mobile') {
      // More aggressive margins for smaller screens
      if (screenWidth <= 375) { // iPhone SE, iPhone 12 mini
        safeMargin = 8;
      } else if (screenWidth <= 414) { // iPhone XR, iPhone 11
        safeMargin = 12;
      } else { // iPhone 14 Pro Max, etc.
        safeMargin = 16;
      }
    } else {
      safeMargin = 48;
    }
    const availableWidth = screenWidth - safeMargin;
    
    // Calculate key spacing based on screen size
    let keySpacing: number;
    if (deviceCategory === 'mobile') {
      if (screenWidth <= 375) { // Small screens
        keySpacing = 1.5;
      } else if (screenWidth <= 414) { // Medium screens
        keySpacing = 2;
      } else { // Large screens
        keySpacing = 2.5;
      }
    } else {
      keySpacing = 6;
    }
    
    // Calculate key width to fit all keys with proper constraints
    const totalSpacing = (maxKeysInRow - 1) * keySpacing;
    let keyWidth = (availableWidth - totalSpacing) / maxKeysInRow;
    
    // Apply constraints based on device
    const minKeyWidth = deviceCategory === 'mobile' ? 20 : MOBILE_CONFIG.touchTarget.minimum;
    const maxKeyWidth = deviceCategory === 'mobile' ? 36 : 60;
    
    keyWidth = Math.max(minKeyWidth, Math.min(keyWidth, maxKeyWidth));
    
    // Calculate key height with responsive sizing (optimized for better touch)
    let keyHeight: number;
    if (deviceCategory === 'mobile') {
      // Base height on screen size and orientation
      const baseHeight = isPortrait ? keyWidth * 1.3 : keyWidth * 1.0;
      
      // Apply screen size specific adjustments
      if (screenWidth <= 375) { // Small screens
        keyHeight = Math.max(baseHeight * 0.95, 36);
      } else if (screenWidth <= 414) { // Medium screens
        keyHeight = Math.max(baseHeight * 1.0, 40);
      } else { // Large screens
        keyHeight = Math.max(baseHeight * 1.05, 44);
      }
    } else {
      keyHeight = Math.max(keyWidth * 1.1, MOBILE_CONFIG.touchTarget.comfortable);
    }
    
    // Calculate font size with responsive scaling
    let fontSize: number;
    if (deviceCategory === 'mobile') {
      if (screenWidth <= 375) { // Small screens
        fontSize = Math.max(keyWidth * 0.35, 9);
      } else if (screenWidth <= 414) { // Medium screens
        fontSize = Math.max(keyWidth * 0.38, 10);
      } else { // Large screens
        fontSize = Math.max(keyWidth * 0.4, 11);
      }
    } else {
      fontSize = Math.max(keyWidth * 0.35, 14);
    }
    
    // Calculate container padding (reduced for mobile)
    const containerPadding = deviceCategory === 'mobile' 
      ? (screenWidth <= 375 ? 4 : 6)
      : mobileUtils.getSpacing('lg');
    
    return {
      keyWidth: Math.floor(keyWidth),
      keyHeight: Math.floor(keyHeight),
      keySpacing,
      fontSize: Math.floor(fontSize),
      containerPadding
    };
  }, [keyboard, dimensions]);

  // Update dimensions on screen size change
  useEffect(() => {
    if (!adaptiveSize) return;

    const updateDimensions = () => {
      const newDimensions = calculateDimensions();
      setDimensions(newDimensions);
      
      // Calculate total keyboard height for parent components
      const totalHeight = (newDimensions.keyHeight * 3) + (newDimensions.keySpacing * 2) + (newDimensions.containerPadding * 2);
      setKeyboardHeight(totalHeight);
    };

    updateDimensions();

    const handleResize = () => {
      // Debounce resize events
      clearTimeout((window as any).keyboardResizeTimeout);
      (window as any).keyboardResizeTimeout = setTimeout(updateDimensions, 150);
    };

    const handleOrientationChange = () => {
      // Delay to allow for orientation change to complete
      setTimeout(updateDimensions, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout((window as any).keyboardResizeTimeout);
    };
  }, [adaptiveSize, calculateDimensions]);

  // Detect virtual keyboard state
  useEffect(() => {
    if (!isMobile || !autoHide) return;

    const detectVirtualKeyboard = () => {
      const isOpen = viewport.isVirtualKeyboardOpen();
      setVirtualKeyboardOpen(isOpen);
      
      // Hide custom keyboard when virtual keyboard is open
      if (isOpen && isVisible) {
        setIsVisible(false);
      } else if (!isOpen && !isVisible) {
        // Show custom keyboard when virtual keyboard is closed
        setTimeout(() => setIsVisible(true), 300);
      }
    };

    const handleResize = () => {
      // Debounce to avoid excessive calls
      clearTimeout((window as any).virtualKeyboardTimeout);
      (window as any).virtualKeyboardTimeout = setTimeout(detectVirtualKeyboard, 150);
    };

    const handleVisibilityChange = () => {
      if (!autoHide) return; // Don't hide keyboard if autoHide is disabled
      
      if (document.hidden) {
        setIsVisible(false);
      } else {
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial check
    detectVirtualKeyboard();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout((window as any).virtualKeyboardTimeout);
    };
  }, [isMobile, autoHide, isVisible]);

  // Enhanced key press handler with haptic feedback and visual feedback
  const handleKeyPress = useCallback((key: string) => {
    if (disabled) return;
    
    // Add visual feedback animation
    if (showVisualFeedback) {
      setPressedKeys(prev => new Set(prev).add(key));
      setKeyPressAnimations(prev => [...prev, { key, timestamp: Date.now() }]);
      
      // Remove pressed state after animation
      setTimeout(() => {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 150);
      
      // Clean up old animations
      setTimeout(() => {
        setKeyPressAnimations(prev => 
          prev.filter(anim => Date.now() - anim.timestamp < 1000)
        );
      }, 1000);
    }
    
    // Provide haptic feedback on mobile devices
    if (hapticFeedback && isMobile) {
      // Different vibration patterns for different key types
      if (key === 'ENTER') {
        touch.vibrate([10, 50, 10]); // Double tap pattern
      } else if (key === 'BACKSPACE') {
        touch.vibrate(15); // Slightly longer vibration
      } else {
        touch.vibrate(8); // Short vibration for letters
      }
    }
    
    onKeyPress(key);
  }, [disabled, hapticFeedback, isMobile, onKeyPress, showVisualFeedback]);

  // Handle keyboard show/hide with smooth transitions
  const handleKeyboardToggle = useCallback((show: boolean) => {
    if (show && !isVisible) {
      setIsVisible(true);
    } else if (!show && isVisible) {
      setIsVisible(false);
    }
  }, [isVisible]);

  // Expose keyboard control methods
  useEffect(() => {
    if (keyboardRef.current) {
      (keyboardRef.current as any).showKeyboard = () => handleKeyboardToggle(true);
      (keyboardRef.current as any).hideKeyboard = () => handleKeyboardToggle(false);
      (keyboardRef.current as any).toggleKeyboard = () => handleKeyboardToggle(!isVisible);
    }
  }, [handleKeyboardToggle, isVisible]);

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.02,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const keyVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    pressed: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    }
  };

  // Visual feedback animation variants
  const feedbackVariants = {
    initial: { scale: 1, opacity: 0 },
    animate: { 
      scale: [1, 1.2, 1], 
      opacity: [0, 0.6, 0],
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Dynamic styles based on calculated dimensions
  const keyStyle = {
    width: `${dimensions.keyWidth}px`,
    height: `${dimensions.keyHeight}px`,
    fontSize: `${dimensions.fontSize}px`,
    minWidth: `${dimensions.keyWidth}px`,
    minHeight: `${dimensions.keyHeight}px`,
  };

  const specialKeyStyle = {
    height: `${dimensions.keyHeight}px`,
    fontSize: `${Math.max(dimensions.fontSize - 2, 10)}px`,
    minWidth: `${Math.max(dimensions.keyWidth * 1.8, 80)}px`,
    minHeight: `${dimensions.keyHeight}px`,
    paddingLeft: `${Math.max(dimensions.keySpacing * 2, 8)}px`,
    paddingRight: `${Math.max(dimensions.keySpacing * 2, 8)}px`,
  };

  const containerStyle = {
    padding: `${dimensions.containerPadding}px`,
    gap: `${Math.max(dimensions.keySpacing * 1.2, isMobile ? 4 : 8)}px`, // Reduced vertical spacing for mobile
  };

  const rowStyle = {
    gap: `${dimensions.keySpacing}px`,
  };

  return (
    <AnimatePresence mode="wait">
      {(isVisible || !autoHide) && (
        <motion.div
          ref={keyboardRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={containerStyle}
          className={`
            keyboard-container touch-optimized flex flex-col
            ${disabled ? 'opacity-50 pointer-events-none' : ''}
            ${isMobile ? 'mobile-keyboard' : 'desktop-keyboard'}
            ${virtualKeyboardOpen ? 'virtual-keyboard-open' : ''}
          `}
          data-keyboard-height={keyboardHeight}
          data-virtual-keyboard-open={virtualKeyboardOpen}
        >
          {keyboard.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              className="flex justify-center items-center keyboard-row"
              style={rowStyle}
            >
              {rowIndex === 2 && (
                <motion.button
                  variants={keyVariants}
                  animate={pressedKeys.has('ENTER') ? 'pressed' : 'visible'}
                  onClick={() => handleKeyPress('ENTER')}
                  disabled={disabled}
                  style={specialKeyStyle}
                  className={`
                    keyboard-key keyboard-key-special keyboard-key-enter
                    rounded-lg text-white font-bold
                    transition-all duration-200 border border-white/20
                    glass-button touch-target
                    ${isMobile ? 'touch-feedback' : ''}
                    ${pressedKeys.has('ENTER') ? 'key-pressed' : ''}
                  `}
                  aria-label="Enter tuşu"
                >
                  <span className="key-content">ENTER</span>
                  {showVisualFeedback && pressedKeys.has('ENTER') && (
                    <motion.div
                      className="key-press-feedback"
                      variants={feedbackVariants}
                      initial="initial"
                      animate="animate"
                    />
                  )}
                </motion.button>
              )}
              
              {row.map((key) => (
                <motion.button
                  key={key}
                  variants={keyVariants}
                  animate={pressedKeys.has(key) ? 'pressed' : 'visible'}
                  onClick={() => handleKeyPress(key)}
                  disabled={disabled}
                  style={keyStyle}
                  className={`
                    keyboard-key keyboard-key-letter
                    rounded-lg text-white font-bold
                    transition-all duration-200 border border-white/20
                    touch-target
                    ${isMobile ? 'touch-feedback' : ''}
                    ${pressedKeys.has(key) ? 'key-pressed' : ''}
                    ${getKeyStatus(key) === 'correct' ? 'correct' : ''}
                    ${getKeyStatus(key) === 'present' ? 'present' : ''}
                    ${getKeyStatus(key) === 'absent' ? 'absent' : ''}
                    ${getKeyStatus(key) === 'empty' ? 'glass-button' : ''}
                  `}
                  aria-label={`${key} harfi`}
                >
                  <span className="key-content">{key}</span>
                  {showVisualFeedback && pressedKeys.has(key) && (
                    <motion.div
                      className="key-press-feedback"
                      variants={feedbackVariants}
                      initial="initial"
                      animate="animate"
                    />
                  )}
                </motion.button>
              ))}
              
              {rowIndex === 2 && (
                <motion.button
                  variants={keyVariants}
                  animate={pressedKeys.has('BACKSPACE') ? 'pressed' : 'visible'}
                  onClick={() => handleKeyPress('BACKSPACE')}
                  disabled={disabled}
                  style={specialKeyStyle}
                  className={`
                    keyboard-key keyboard-key-special keyboard-key-backspace
                    rounded-lg text-white font-bold
                    transition-all duration-200 border border-white/20
                    glass-button touch-target
                    ${isMobile ? 'touch-feedback' : ''}
                    ${pressedKeys.has('BACKSPACE') ? 'key-pressed' : ''}
                  `}
                  aria-label="Geri silme tuşu"
                >
                  <span className="key-content">⌫</span>
                  {showVisualFeedback && pressedKeys.has('BACKSPACE') && (
                    <motion.div
                      className="key-press-feedback"
                      variants={feedbackVariants}
                      initial="initial"
                      animate="animate"
                    />
                  )}
                </motion.button>
              )}
            </div>
          ))}
          
          {disabled && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 mt-4 keyboard-disabled-message"
              style={{ fontSize: `${Math.max(dimensions.fontSize - 2, 12)}px` }}
            >
              Sıranızı bekleyin...
            </motion.div>
          )}
          
          {/* Virtual keyboard indicator */}
          {isMobile && virtualKeyboardOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="virtual-keyboard-indicator"
            >
              <span className="text-xs text-gray-400">
                Sanal klavye açık
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
