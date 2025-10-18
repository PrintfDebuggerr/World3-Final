/**
 * Virtual keyboard hook for mobile optimization
 * Handles virtual keyboard integration and mobile input management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { mobileUtilities } from '../lib/mobile-utils';

export interface VirtualKeyboardConfig {
  autoFocus?: boolean;
  preventNativeKeyboard?: boolean;
  enableHapticFeedback?: boolean;
  maxLength?: number;
  allowedChars?: RegExp;
}

export interface VirtualKeyboardState {
  isOpen: boolean;
  currentValue: string;
  focusedIndex: number | null;
  isNativeKeyboardOpen: boolean;
}

export function useVirtualKeyboard(config: VirtualKeyboardConfig = {}) {
  const {
    autoFocus = false,
    preventNativeKeyboard = false,
    enableHapticFeedback = true,
    maxLength = 1,
    allowedChars = /^[A-ZÇĞIİÖŞÜ]$/,
  } = config;

  const [state, setState] = useState<VirtualKeyboardState>({
    isOpen: false,
    currentValue: '',
    focusedIndex: null,
    isNativeKeyboardOpen: false,
  });

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);

  // Detect virtual keyboard state
  useEffect(() => {
    const detectVirtualKeyboard = () => {
      const isOpen = mobileUtilities.viewport.isVirtualKeyboardOpen();
      setState(prev => ({ ...prev, isNativeKeyboardOpen: isOpen }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', detectVirtualKeyboard);
      window.addEventListener('orientationchange', detectVirtualKeyboard);
      
      return () => {
        window.removeEventListener('resize', detectVirtualKeyboard);
        window.removeEventListener('orientationchange', detectVirtualKeyboard);
      };
    }
  }, []);

  // Create hidden input for native keyboard capture
  const createHiddenInput = useCallback((targetElement: HTMLElement) => {
    if (hiddenInputRef.current) {
      document.body.removeChild(hiddenInputRef.current);
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    input.style.top = '-9999px';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    input.maxLength = maxLength;
    input.autocomplete = 'off';
    (input as any).autocorrect = 'off';
    (input as any).autocapitalize = 'characters';
    input.spellcheck = false;

    // Handle input events
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = target.value.toUpperCase();
      
      if (allowedChars.test(value) || value === '') {
        setState(prev => ({ ...prev, currentValue: value }));
        
        if (enableHapticFeedback && value) {
          mobileUtilities.touch.vibrate(10);
        }
      } else {
        // Invalid character - provide error feedback
        if (enableHapticFeedback) {
          mobileUtilities.touch.vibrate([100, 50, 100]);
        }
        target.value = state.currentValue;
      }
    });

    // Handle focus/blur events
    input.addEventListener('focus', () => {
      setState(prev => ({ ...prev, isOpen: true }));
    });

    input.addEventListener('blur', () => {
      setState(prev => ({ ...prev, isOpen: false }));
    });

    document.body.appendChild(input);
    hiddenInputRef.current = input;
    activeElementRef.current = targetElement;

    return input;
  }, [maxLength, allowedChars, enableHapticFeedback, state.currentValue]);

  // Focus on specific element
  const focusElement = useCallback((element: HTMLElement, index?: number) => {
    if (!mobileUtilities.utils.isMobile()) return;

    const input = createHiddenInput(element);
    
    setState(prev => ({ 
      ...prev, 
      focusedIndex: index ?? null,
      currentValue: '',
    }));

    // Focus with delay to ensure proper keyboard handling
    setTimeout(() => {
      input.focus();
    }, 100);
  }, [createHiddenInput]);

  // Blur current element
  const blurElement = useCallback(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.blur();
      document.body.removeChild(hiddenInputRef.current);
      hiddenInputRef.current = null;
    }
    
    activeElementRef.current = null;
    setState(prev => ({ 
      ...prev, 
      isOpen: false, 
      focusedIndex: null,
      currentValue: '',
    }));
  }, []);

  // Move focus to next element
  const focusNext = useCallback((elements: HTMLElement[]) => {
    if (state.focusedIndex === null) return;
    
    const nextIndex = state.focusedIndex + 1;
    if (nextIndex < elements.length) {
      focusElement(elements[nextIndex], nextIndex);
    } else {
      blurElement();
    }
  }, [state.focusedIndex, focusElement, blurElement]);

  // Move focus to previous element
  const focusPrevious = useCallback((elements: HTMLElement[]) => {
    if (state.focusedIndex === null) return;
    
    const prevIndex = state.focusedIndex - 1;
    if (prevIndex >= 0) {
      focusElement(elements[prevIndex], prevIndex);
    }
  }, [state.focusedIndex, focusElement]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
      setState(prev => ({ ...prev, currentValue: '' }));
      
      if (enableHapticFeedback) {
        mobileUtilities.touch.vibrate(20);
      }
    }
  }, [enableHapticFeedback]);

  // Handle enter/submit
  const handleEnter = useCallback(() => {
    blurElement();
    
    if (enableHapticFeedback) {
      mobileUtilities.touch.vibrate([50, 25, 50]);
    }
  }, [blurElement, enableHapticFeedback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hiddenInputRef.current && document.body.contains(hiddenInputRef.current)) {
        document.body.removeChild(hiddenInputRef.current);
      }
    };
  }, []);

  return {
    state,
    focusElement,
    blurElement,
    focusNext,
    focusPrevious,
    handleBackspace,
    handleEnter,
    isVirtualKeyboardSupported: mobileUtilities.utils.isMobile(),
  };
}