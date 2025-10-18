/**
 * Unit tests for useVirtualKeyboard hook
 * Tests virtual keyboard integration and mobile input management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualKeyboard } from '../useVirtualKeyboard';

// Mock mobile utilities
vi.mock('../../lib/mobile-utils', () => ({
  mobileUtilities: {
    viewport: {
      isVirtualKeyboardOpen: vi.fn(() => false),
    },
    touch: {
      vibrate: vi.fn(),
    },
    utils: {
      isMobile: vi.fn(() => true),
    },
  },
}));

// Mock DOM methods
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateElement = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Mock document
Object.defineProperty(document, 'body', {
  value: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
    contains: vi.fn(() => true),
  },
  writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

// Mock input element
const createMockInput = () => {
  const input = {
    type: 'text',
    style: {},
    maxLength: 1,
    autocomplete: 'off',
    spellcheck: false,
    value: '',
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    focus: vi.fn(),
    blur: vi.fn(),
  };
  
  mockCreateElement.mockReturnValue(input);
  return input;
};

describe('useVirtualKeyboard', () => {
  let mockInput: ReturnType<typeof createMockInput>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInput = createMockInput();
    
    // Mock window events
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true,
    });
    
    Object.defineProperty(window, 'removeEventListener', {
      value: vi.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      
      expect(result.current.state).toEqual({
        isOpen: false,
        currentValue: '',
        focusedIndex: null,
        isNativeKeyboardOpen: false,
      });
    });

    it('should accept custom configuration', () => {
      const config = {
        maxLength: 5,
        enableHapticFeedback: false,
        allowedChars: /^[A-Z]$/,
      };
      
      const { result } = renderHook(() => useVirtualKeyboard(config));
      
      expect(result.current.isVirtualKeyboardSupported).toBe(true);
    });

    it('should set up window event listeners for keyboard detection', () => {
      renderHook(() => useVirtualKeyboard());
      
      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });
  });

  describe('Virtual Keyboard Detection', () => {
    it('should detect virtual keyboard state changes', async () => {
      const { mobileUtilities } = await import('../../lib/mobile-utils');
      const mockIsVirtualKeyboardOpen = mobileUtilities.viewport.isVirtualKeyboardOpen as ReturnType<typeof vi.fn>;
      
      const { result } = renderHook(() => useVirtualKeyboard());
      
      // Simulate keyboard opening
      mockIsVirtualKeyboardOpen.mockReturnValue(true);
      
      // Trigger resize event
      const resizeHandler = (window.addEventListener as ReturnType<typeof vi.fn>).mock.calls
        .find(call => call[0] === 'resize')?.[1];
      
      act(() => {
        resizeHandler();
      });
      
      expect(result.current.state.isNativeKeyboardOpen).toBe(true);
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useVirtualKeyboard());
      
      unmount();
      
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });
  });

  describe('Hidden Input Management', () => {
    it('should create hidden input element when focusing', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      expect(mockCreateElement).toHaveBeenCalledWith('input');
      expect(mockAppendChild).toHaveBeenCalledWith(mockInput);
    });

    it('should configure hidden input with correct properties', () => {
      const { result } = renderHook(() => useVirtualKeyboard({ maxLength: 3 }));
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      expect(mockInput.type).toBe('text');
      expect(mockInput.maxLength).toBe(3);
      expect(mockInput.autocomplete).toBe('off');
      expect(mockInput.spellcheck).toBe(false);
    });

    it('should remove previous hidden input when creating new one', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement1 = document.createElement('div');
      const mockElement2 = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement1, 0);
      });
      
      act(() => {
        result.current.focusElement(mockElement2, 1);
      });
      
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('Input Handling', () => {
    it('should handle valid character input', async () => {
      const { mobileUtilities } = await import('../../lib/mobile-utils');
      const mockVibrate = mobileUtilities.touch.vibrate as ReturnType<typeof vi.fn>;
      
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      // Simulate input event
      const inputHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'input')?.[1];
      
      const mockEvent = {
        target: { value: 'A' },
      };
      
      act(() => {
        inputHandler(mockEvent);
      });
      
      expect(result.current.state.currentValue).toBe('A');
      expect(mockVibrate).toHaveBeenCalledWith(10);
    });

    it('should reject invalid characters', async () => {
      const { mobileUtilities } = await import('../../lib/mobile-utils');
      const mockVibrate = mobileUtilities.touch.vibrate as ReturnType<typeof vi.fn>;
      
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      // Simulate invalid input
      const inputHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'input')?.[1];
      
      const mockEvent = {
        target: { value: '1' }, // Invalid character
      };
      
      act(() => {
        inputHandler(mockEvent);
      });
      
      expect(result.current.state.currentValue).toBe('');
      expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]); // Error pattern
    });

    it('should handle empty input', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      const inputHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'input')?.[1];
      
      const mockEvent = {
        target: { value: '' },
      };
      
      act(() => {
        inputHandler(mockEvent);
      });
      
      expect(result.current.state.currentValue).toBe('');
    });

    it('should convert input to uppercase', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      const inputHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'input')?.[1];
      
      const mockEvent = {
        target: { value: 'a' },
      };
      
      act(() => {
        inputHandler(mockEvent);
      });
      
      expect(result.current.state.currentValue).toBe('A');
    });
  });

  describe('Focus Management', () => {
    it('should update state when focusing element', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 2);
      });
      
      expect(result.current.state.focusedIndex).toBe(2);
      expect(result.current.state.currentValue).toBe('');
    });

    it('should focus hidden input with delay', () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      expect(mockInput.focus).not.toHaveBeenCalled();
      
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      expect(mockInput.focus).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should handle focus events', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      const focusHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'focus')?.[1];
      
      act(() => {
        focusHandler();
      });
      
      expect(result.current.state.isOpen).toBe(true);
    });

    it('should handle blur events', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      const blurHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'blur')?.[1];
      
      act(() => {
        blurHandler();
      });
      
      expect(result.current.state.isOpen).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should focus next element', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      
      act(() => {
        result.current.focusElement(elements[0], 0);
      });
      
      act(() => {
        result.current.focusNext(elements);
      });
      
      expect(result.current.state.focusedIndex).toBe(1);
    });

    it('should focus previous element', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      
      act(() => {
        result.current.focusElement(elements[1], 1);
      });
      
      act(() => {
        result.current.focusPrevious(elements);
      });
      
      expect(result.current.state.focusedIndex).toBe(0);
    });

    it('should blur when focusing next beyond last element', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const elements = [document.createElement('div')];
      
      act(() => {
        result.current.focusElement(elements[0], 0);
      });
      
      act(() => {
        result.current.focusNext(elements);
      });
      
      expect(result.current.state.focusedIndex).toBe(null);
      expect(result.current.state.isOpen).toBe(false);
    });

    it('should not focus previous when at first element', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const elements = [document.createElement('div')];
      
      act(() => {
        result.current.focusElement(elements[0], 0);
      });
      
      act(() => {
        result.current.focusPrevious(elements);
      });
      
      expect(result.current.state.focusedIndex).toBe(0);
    });
  });

  describe('Special Actions', () => {
    it('should handle backspace', async () => {
      const { mobileUtilities } = await import('../../lib/mobile-utils');
      const mockVibrate = mobileUtilities.touch.vibrate as ReturnType<typeof vi.fn>;
      
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      act(() => {
        result.current.handleBackspace();
      });
      
      expect(mockInput.value).toBe('');
      expect(result.current.state.currentValue).toBe('');
      expect(mockVibrate).toHaveBeenCalledWith(20);
    });

    it('should handle enter', async () => {
      const { mobileUtilities } = await import('../../lib/mobile-utils');
      const mockVibrate = mobileUtilities.touch.vibrate as ReturnType<typeof vi.fn>;
      
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      act(() => {
        result.current.handleEnter();
      });
      
      expect(result.current.state.isOpen).toBe(false);
      expect(result.current.state.focusedIndex).toBe(null);
      expect(mockVibrate).toHaveBeenCalledWith([50, 25, 50]);
    });
  });

  describe('Cleanup', () => {
    it('should clean up hidden input on blur', () => {
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      act(() => {
        result.current.blurElement();
      });
      
      expect(mockRemoveChild).toHaveBeenCalledWith(mockInput);
      expect(result.current.state.isOpen).toBe(false);
      expect(result.current.state.focusedIndex).toBe(null);
    });

    it('should clean up on unmount', () => {
      const { result, unmount } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      unmount();
      
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('Mobile Detection', () => {
    it('should return correct mobile support status', async () => {
      const { mobileUtilities } = await import('../../lib/mobile-utils');
      const mockIsMobile = mobileUtilities.utils.isMobile as ReturnType<typeof vi.fn>;
      
      mockIsMobile.mockReturnValue(true);
      
      const { result } = renderHook(() => useVirtualKeyboard());
      
      expect(result.current.isVirtualKeyboardSupported).toBe(true);
    });

    it('should not create hidden input on non-mobile devices', async () => {
      const { mobileUtilities } = await import('../../lib/mobile-utils');
      const mockIsMobile = mobileUtilities.utils.isMobile as ReturnType<typeof vi.fn>;
      
      mockIsMobile.mockReturnValue(false);
      
      const { result } = renderHook(() => useVirtualKeyboard());
      const mockElement = document.createElement('div');
      
      act(() => {
        result.current.focusElement(mockElement, 0);
      });
      
      expect(mockCreateElement).not.toHaveBeenCalled();
    });
  });
});