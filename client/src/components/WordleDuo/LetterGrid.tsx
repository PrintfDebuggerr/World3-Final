import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LetterStatus } from '../../types/game';
import { useOrientation } from '../../hooks/useOrientation';
import { useVirtualKeyboard } from '../../hooks/useVirtualKeyboard';
import { mobileUtilities, TouchHandler } from '../../lib/mobile-utils';

interface LetterGridProps {
  letters: string[];
  statuses: LetterStatus[];
  animate?: boolean;
  compact?: boolean;
  enlarged?: boolean;
  interactive?: boolean;
  onLetterClick?: (index: number) => void;
  onLetterInput?: (index: number, letter: string) => void; // New: direct letter input
  onNavigate?: (direction: 'next' | 'previous') => void; // New: navigation callback
  enableVirtualKeyboard?: boolean; // New: enable virtual keyboard integration
  autoFocus?: boolean; // New: auto-focus first empty cell
}

export function LetterGrid({ 
  letters, 
  statuses, 
  animate = false, 
  compact = false, 
  enlarged = false,
  interactive = false,
  onLetterClick,
  onLetterInput,
  onNavigate,
  enableVirtualKeyboard = true,
  autoFocus = false
}: LetterGridProps) {
  const { isMobile } = useOrientation();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchHandlerRef = useRef<TouchHandler | null>(null);
  
  // Virtual keyboard integration
  const virtualKeyboard = useVirtualKeyboard({
    autoFocus,
    enableHapticFeedback: true,
    maxLength: 1,
    allowedChars: /^[A-ZÇĞIİÖŞÜ]$/,
  });

  // Check if this is the special "DENİZ" word
  const isDenizWord = letters.join('') === 'DENİZ' && animate;
  
  // Initialize touch handler for enhanced touch interactions
  useEffect(() => {
    if (!interactive || !isMobile) return;
    
    touchHandlerRef.current = mobileUtilities.enhancedTouch.createHandler({
      enableHapticFeedback: true,
      minTouchTargetSize: mobileUtilities.config.touchTarget.minimum,
    });
    
    return () => {
      if (touchHandlerRef.current) {
        touchHandlerRef.current.destroy();
      }
    };
  }, [interactive, isMobile]);
  
  // Auto-focus first empty cell
  useEffect(() => {
    if (autoFocus && interactive && isMobile) {
      const firstEmptyIndex = letters.findIndex(letter => letter === ' ' || letter === '');
      if (firstEmptyIndex !== -1) {
        handleLetterFocus(firstEmptyIndex);
      }
    }
  }, [autoFocus, interactive, isMobile, letters]);
  
  // Handle virtual keyboard input
  useEffect(() => {
    if (virtualKeyboard.state.currentValue && focusedIndex !== null) {
      const letter = virtualKeyboard.state.currentValue;
      
      // Call input callback
      if (onLetterInput) {
        onLetterInput(focusedIndex, letter);
      }
      
      // Auto-navigate to next cell
      const nextIndex = focusedIndex + 1;
      if (nextIndex < letters.length) {
        handleLetterFocus(nextIndex);
      } else {
        // Last cell filled, blur
        virtualKeyboard.blurElement();
        setFocusedIndex(null);
      }
    }
  }, [virtualKeyboard.state.currentValue, focusedIndex, onLetterInput, letters.length]);
  
  // Memoize size classes to avoid recalculation on every render
  const spacingClass = React.useMemo(() => {
    const deviceCategory = mobileUtilities.utils.getDeviceCategory();
    
    // For compact mode (used in duel mode), use minimal spacing - CSS will handle responsive scaling
    if (compact) return "flex justify-center space-x-0.5";
    if (enlarged) return "flex justify-center space-x-1";
    
    switch (deviceCategory) {
      case 'mobile':
        return "flex justify-center space-x-0.5 letter-grid-mobile";
      case 'tablet':
        return "flex justify-center space-x-1.5";
      default:
        return "flex justify-center space-x-1 sm:space-x-1.5 md:space-x-2";
    }
  }, [compact, enlarged]);

  const sizeClass = React.useMemo(() => {
    const deviceCategory = mobileUtilities.utils.getDeviceCategory();
    const touchTargetSize = mobileUtilities.utils.getTouchTargetSize();
    
    // For compact mode (used in duel mode), use minimal sizing - CSS will handle responsive scaling
    if (compact) return 'w-8 h-8 text-xs';
    if (enlarged) return 'w-10 h-10 text-base';
    
    switch (deviceCategory) {
      case 'mobile':
        return `w-12 h-12 text-lg min-w-[${touchTargetSize}px] min-h-[${touchTargetSize}px]`;
      case 'tablet':
        return 'w-14 h-14 text-xl';
      default:
        return 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-base sm:text-lg md:text-xl lg:text-2xl';
    }
  }, [compact, enlarged]);
  
  // Handle letter cell focus
  const handleLetterFocus = useCallback((index: number) => {
    if (!interactive) return;
    
    setFocusedIndex(index);
    
    // Use virtual keyboard on mobile
    if (isMobile && enableVirtualKeyboard && letterRefs.current[index]) {
      virtualKeyboard.focusElement(letterRefs.current[index]!, index);
    }
    
    // Trigger click callback for backward compatibility
    if (onLetterClick) {
      onLetterClick(index);
    }
  }, [interactive, isMobile, enableVirtualKeyboard, onLetterClick, virtualKeyboard]);
  
  // Handle touch interactions
  const handleTouchInteraction = useCallback((index: number, element: HTMLDivElement) => {
    if (!interactive || !touchHandlerRef.current) return;
    
    // Attach touch handler to element
    const cleanup = touchHandlerRef.current.attachToElement(element);
    
    // Add gesture listeners
    touchHandlerRef.current.on('tap', () => {
      handleLetterFocus(index);
    });
    
    touchHandlerRef.current.on('longpress', () => {
      // Long press to clear letter
      if (onLetterInput) {
        onLetterInput(index, '');
      }
    });
    
    touchHandlerRef.current.on('swipe', (event) => {
      // Swipe navigation
      if (event.direction === 'right' && index < letters.length - 1) {
        handleLetterFocus(index + 1);
      } else if (event.direction === 'left' && index > 0) {
        handleLetterFocus(index - 1);
      }
    });
    
    return cleanup;
  }, [interactive, handleLetterFocus, onLetterInput, letters.length]);
  
  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((direction: 'next' | 'previous') => {
    if (focusedIndex === null) return;
    
    if (direction === 'next' && focusedIndex < letters.length - 1) {
      handleLetterFocus(focusedIndex + 1);
    } else if (direction === 'previous' && focusedIndex > 0) {
      handleLetterFocus(focusedIndex - 1);
    }
    
    if (onNavigate) {
      onNavigate(direction);
    }
  }, [focusedIndex, letters.length, handleLetterFocus, onNavigate]);

  return (
    <div 
      className={spacingClass}
      style={compact && !isMobile ? { gap: '0.25rem', columnGap: '0.25rem' } : {}}
    >
      {letters.map((letter, index) => (
        <motion.div
          key={index}
          ref={(el) => {
            letterRefs.current[index] = el;
            // Attach touch handler when ref is set
            if (el && interactive && isMobile) {
              handleTouchInteraction(index, el);
            }
          }}
          initial={animate ? { rotateX: 0, scale: 1 } : false}
          animate={animate ? { 
            rotateX: isDenizWord ? [0, 360, 0] : [0, 90, 0],
            scale: isDenizWord ? [1, 1.2, 1] : 1,
            y: isDenizWord ? [0, -10, 0] : 0
          } : false}
          transition={animate ? { 
            duration: isDenizWord ? 1.2 : 0.6, 
            delay: index * (isDenizWord ? 0.2 : 0.1),
            ease: "easeInOut"
          } : undefined}
          onClick={() => handleLetterFocus(index)}
          onKeyDown={(e) => {
            if (!interactive) return;
            
            switch (e.key) {
              case 'ArrowRight':
                e.preventDefault();
                handleKeyboardNavigation('next');
                break;
              case 'ArrowLeft':
                e.preventDefault();
                handleKeyboardNavigation('previous');
                break;
              case 'Backspace':
                e.preventDefault();
                if (onLetterInput) {
                  onLetterInput(index, '');
                }
                break;
              case 'Enter':
                e.preventDefault();
                virtualKeyboard.handleEnter();
                break;
              default:
                // Handle letter input
                const char = e.key.toUpperCase();
                if (/^[A-ZÇĞIİÖŞÜ]$/.test(char) && onLetterInput) {
                  e.preventDefault();
                  onLetterInput(index, char);
                  handleKeyboardNavigation('next');
                }
            }
          }}
          tabIndex={interactive ? 0 : -1}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? `Letter cell ${index + 1}` : undefined}
          data-touchable={interactive ? "true" : undefined}
          className={`
            letter-cell ${sizeClass} ${isMobile ? 'letter-cell-mobile' : ''} border-2 rounded-md sm:rounded-lg flex items-center justify-center font-bold transition-colors duration-200
            ${statuses[index] === 'correct' ? 'correct' : ''}
            ${statuses[index] === 'present' ? 'present' : ''}
            ${statuses[index] === 'absent' ? 'absent' : ''}
            ${statuses[index] === 'empty' ? 'empty' : ''}
            ${isDenizWord ? 'shadow-lg shadow-pink-300' : ''}
            ${interactive ? 'cursor-pointer touch-target touch-feedback' : ''}
            ${interactive && !isMobile ? 'hover:bg-white/10' : ''}
            ${focusedIndex === index && !isMobile ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''}
            ${interactive ? 'touch-optimized' : ''}
          `}
          style={{
            transformStyle: 'preserve-3d',
            ...(compact && !isMobile ? {
              width: '2.25rem',
              height: '2.25rem',
              minWidth: '2.25rem',
              minHeight: '2.25rem',
              maxWidth: '2.25rem',
              maxHeight: '2.25rem',
              fontSize: '0.875rem'
            } : {})
          }}
        >
          <motion.span
            initial={animate ? { opacity: 1, scale: 1 } : false}
            animate={animate ? {
              opacity: [1, 0, 1],
              scale: isDenizWord ? [1, 1.3, 1] : 1,
              rotate: isDenizWord ? [0, 10, -10, 0] : 0
            } : false}
            transition={animate ? {
              duration: isDenizWord ? 1.2 : 0.6,
              delay: index * (isDenizWord ? 0.2 : 0.1),
              times: [0, 0.5, 1]
            } : undefined}
          >
            {letter === ' ' ? '' : letter}
          </motion.span>
          
          {/* Active cursor indicator - shows where next letter will appear */}
          {interactive && !letter && index === letters.findIndex(l => !l || l === ' ' || l === '') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 border-2 border-blue-400 rounded-md pointer-events-none"
            />
          )}
          
          {/* Focus indicator for mobile */}
          {interactive && focusedIndex === index && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 border-2 border-blue-400 rounded-md pointer-events-none bg-blue-400/10"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
