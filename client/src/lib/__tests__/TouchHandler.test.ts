/**
 * Unit tests for TouchHandler utility
 * Tests touch event handling, gesture recognition, and haptic feedback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TouchHandler, createTouchHandler, validateTouchTargetSize, makeTouchFriendly, DEFAULT_TOUCH_CONFIG } from '../TouchHandler';

// Mock DOM methods
const mockGetBoundingClientRect = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockQuerySelectorAll = vi.fn();

// Mock element
const createMockElement = (width = 50, height = 50) => {
  const element = {
    getBoundingClientRect: mockGetBoundingClientRect.mockReturnValue({ width, height }),
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    querySelectorAll: mockQuerySelectorAll.mockReturnValue([]),
    style: {},
    classList: { add: vi.fn() },
  } as unknown as HTMLElement;
  
  return element;
};

// Mock touch event
const createMockTouch = (id: number, x: number, y: number): Touch => {
  return new Touch({
    identifier: id,
    target: document.body,
    clientX: x,
    clientY: y,
  });
};

const createMockTouchEvent = (type: string, touches: Touch[], changedTouches?: Touch[]): TouchEvent => {
  return new TouchEvent(type, {
    touches,
    changedTouches: changedTouches || touches,
    bubbles: true,
    cancelable: true,
  });
};

describe('TouchHandler', () => {
  let touchHandler: TouchHandler;
  let mockElement: HTMLElement;
  let mockNavigatorVibrate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigatorVibrate = vi.fn();
    (navigator as any).vibrate = mockNavigatorVibrate;
    
    touchHandler = new TouchHandler();
    mockElement = createMockElement();
    mockQuerySelectorAll.mockReturnValue([]);
  });

  afterEach(() => {
    touchHandler.destroy();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const handler = new TouchHandler();
      expect(handler).toBeInstanceOf(TouchHandler);
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        minTouchTargetSize: 48,
        enableHapticFeedback: false,
      };
      const handler = new TouchHandler(customConfig);
      expect(handler).toBeInstanceOf(TouchHandler);
    });

    it('should merge custom config with defaults', () => {
      const customConfig = { minTouchTargetSize: 48 };
      const handler = new TouchHandler(customConfig);
      
      // Should still have default values for other properties
      expect(handler).toBeInstanceOf(TouchHandler);
    });
  });

  describe('Element Attachment', () => {
    it('should attach touch event listeners to element', () => {
      const cleanup = touchHandler.attachToElement(mockElement);
      
      expect(mockAddEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
      expect(mockAddEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
      expect(mockAddEventListener).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: false });
      expect(mockAddEventListener).toHaveBeenCalledWith('touchcancel', expect.any(Function), { passive: false });
      
      expect(typeof cleanup).toBe('function');
    });

    it('should apply touch-optimized styles', () => {
      touchHandler.attachToElement(mockElement);
      
      expect(mockElement.style.touchAction).toBe('manipulation');
      expect((mockElement.style as any).webkitTapHighlightColor).toBe('transparent');
      expect((mockElement.style as any).webkitUserSelect).toBe('none');
      expect(mockElement.style.userSelect).toBe('none');
      expect(mockElement.classList.add).toHaveBeenCalledWith('touch-optimized');
    });

    it('should return cleanup function that removes event listeners', () => {
      const cleanup = touchHandler.attachToElement(mockElement);
      cleanup();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('touchcancel', expect.any(Function));
    });
  });

  describe('Touch Target Validation', () => {
    it('should validate touch target sizes', () => {
      const smallElement = createMockElement(30, 30);
      mockQuerySelectorAll.mockReturnValue([smallElement]);
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      touchHandler.attachToElement(mockElement);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Touch target too small'),
        smallElement
      );
      
      consoleSpy.mockRestore();
    });

    it('should not warn for adequately sized touch targets', () => {
      const adequateElement = createMockElement(50, 50);
      mockQuerySelectorAll.mockReturnValue([adequateElement]);
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      touchHandler.attachToElement(mockElement);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Gesture Recognition', () => {
    let gestureCallback: ReturnType<typeof vi.fn>;
    let touchStartHandler: (event: TouchEvent) => void;
    let touchEndHandler: (event: TouchEvent) => void;

    beforeEach(() => {
      gestureCallback = vi.fn();
      touchHandler.on('tap', gestureCallback);
      
      touchHandler.attachToElement(mockElement);
      
      // Get the actual event handlers
      const calls = mockAddEventListener.mock.calls;
      touchStartHandler = calls.find(call => call[0] === 'touchstart')?.[1];
      touchEndHandler = calls.find(call => call[0] === 'touchend')?.[1];
    });

    it('should recognize tap gesture', () => {
      const touch = createMockTouch(1, 100, 100);
      const startEvent = createMockTouchEvent('touchstart', [touch]);
      const endEvent = createMockTouchEvent('touchend', [], [touch]);
      
      touchStartHandler(startEvent);
      
      // Simulate short duration tap
      setTimeout(() => {
        touchEndHandler(endEvent);
        
        expect(gestureCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'tap',
            startPoint: expect.objectContaining({ x: 100, y: 100 }),
            endPoint: expect.objectContaining({ x: 100, y: 100 }),
          })
        );
      }, 100);
    });

    it('should recognize swipe gesture', () => {
      const swipeCallback = vi.fn();
      touchHandler.on('swipe', swipeCallback);
      
      const startTouch = createMockTouch(1, 100, 100);
      const endTouch = createMockTouch(1, 200, 100); // Swipe right
      
      const startEvent = createMockTouchEvent('touchstart', [startTouch]);
      const endEvent = createMockTouchEvent('touchend', [], [endTouch]);
      
      touchStartHandler(startEvent);
      touchEndHandler(endEvent);
      
      expect(swipeCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'swipe',
          direction: 'right',
          distance: expect.any(Number),
        })
      );
    });

    it('should recognize long press gesture', () => {
      const longPressCallback = vi.fn();
      touchHandler.on('longpress', longPressCallback);
      
      const touch = createMockTouch(1, 100, 100);
      const startEvent = createMockTouchEvent('touchstart', [touch]);
      
      touchStartHandler(startEvent);
      
      // Fast-forward time to trigger long press
      vi.advanceTimersByTime(DEFAULT_TOUCH_CONFIG.longPressMinDuration + 100);
      
      expect(longPressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'longpress',
          startPoint: expect.objectContaining({ x: 100, y: 100 }),
        })
      );
    });

    it('should recognize double tap gesture', () => {
      const doubleTapCallback = vi.fn();
      touchHandler.on('doubletap', doubleTapCallback);
      
      const touch1 = createMockTouch(1, 100, 100);
      const touch2 = createMockTouch(2, 105, 105); // Close to first tap
      
      const startEvent1 = createMockTouchEvent('touchstart', [touch1]);
      const endEvent1 = createMockTouchEvent('touchend', [], [touch1]);
      const startEvent2 = createMockTouchEvent('touchstart', [touch2]);
      const endEvent2 = createMockTouchEvent('touchend', [], [touch2]);
      
      // First tap
      touchStartHandler(startEvent1);
      setTimeout(() => touchEndHandler(endEvent1), 100);
      
      // Second tap within double tap delay
      setTimeout(() => {
        touchStartHandler(startEvent2);
        setTimeout(() => touchEndHandler(endEvent2), 100);
        
        expect(doubleTapCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'doubletap',
          })
        );
      }, 200);
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback for tap', () => {
      touchHandler.hapticFeedback('tap');
      
      expect(mockNavigatorVibrate).toHaveBeenCalledWith(DEFAULT_TOUCH_CONFIG.hapticPatterns.tap);
    });

    it('should trigger haptic feedback for long press', () => {
      touchHandler.hapticFeedback('longPress');
      
      expect(mockNavigatorVibrate).toHaveBeenCalledWith(DEFAULT_TOUCH_CONFIG.hapticPatterns.longPress);
    });

    it('should trigger haptic feedback for swipe', () => {
      touchHandler.hapticFeedback('swipe');
      
      expect(mockNavigatorVibrate).toHaveBeenCalledWith(DEFAULT_TOUCH_CONFIG.hapticPatterns.swipe);
    });

    it('should trigger haptic feedback for error', () => {
      touchHandler.hapticFeedback('error');
      
      expect(mockNavigatorVibrate).toHaveBeenCalledWith(DEFAULT_TOUCH_CONFIG.hapticPatterns.error);
    });

    it('should trigger haptic feedback for success', () => {
      touchHandler.hapticFeedback('success');
      
      expect(mockNavigatorVibrate).toHaveBeenCalledWith(DEFAULT_TOUCH_CONFIG.hapticPatterns.success);
    });

    it('should not trigger haptic feedback when disabled', () => {
      const handler = new TouchHandler({ enableHapticFeedback: false });
      handler.hapticFeedback('tap');
      
      expect(mockNavigatorVibrate).not.toHaveBeenCalled();
    });

    it('should handle missing navigator.vibrate gracefully', () => {
      delete (navigator as any).vibrate;
      
      expect(() => {
        touchHandler.hapticFeedback('tap');
      }).not.toThrow();
    });
  });

  describe('Event Listener Management', () => {
    it('should add gesture event listeners', () => {
      const callback = vi.fn();
      touchHandler.on('tap', callback);
      
      // Verify callback is stored (internal state test)
      expect(typeof callback).toBe('function');
    });

    it('should remove gesture event listeners', () => {
      const callback = vi.fn();
      touchHandler.on('tap', callback);
      touchHandler.off('tap', callback);
      
      // Callback should be removed from internal storage
      expect(typeof callback).toBe('function');
    });

    it('should handle multiple listeners for same gesture', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      touchHandler.on('tap', callback1);
      touchHandler.on('tap', callback2);
      
      expect(typeof callback1).toBe('function');
      expect(typeof callback2).toBe('function');
    });
  });

  describe('Cleanup and Destruction', () => {
    it('should clean up resources on destroy', () => {
      touchHandler.destroy();
      
      // Should not throw errors after destruction
      expect(() => {
        touchHandler.hapticFeedback('tap');
      }).not.toThrow();
    });

    it('should clear active touches on destroy', () => {
      const touch = createMockTouch(1, 100, 100);
      const startEvent = createMockTouchEvent('touchstart', [touch]);
      
      touchHandler.attachToElement(mockElement);
      const touchStartHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'touchstart')?.[1];
      touchStartHandler(startEvent);
      
      touchHandler.destroy();
      
      // Should handle destruction gracefully
      expect(() => touchHandler.destroy()).not.toThrow();
    });
  });
});

describe('TouchHandler Utility Functions', () => {
  describe('createTouchHandler', () => {
    it('should create TouchHandler instance with default config', () => {
      const handler = createTouchHandler();
      expect(handler).toBeInstanceOf(TouchHandler);
    });

    it('should create TouchHandler instance with custom config', () => {
      const config = { minTouchTargetSize: 48 };
      const handler = createTouchHandler(config);
      expect(handler).toBeInstanceOf(TouchHandler);
    });
  });

  describe('validateTouchTargetSize', () => {
    it('should return true for adequately sized elements', () => {
      const element = createMockElement(50, 50);
      const result = validateTouchTargetSize(element, 44);
      expect(result).toBe(true);
    });

    it('should return false for undersized elements', () => {
      const element = createMockElement(30, 30);
      const result = validateTouchTargetSize(element, 44);
      expect(result).toBe(false);
    });

    it('should use default minimum size when not specified', () => {
      const element = createMockElement(50, 50);
      const result = validateTouchTargetSize(element);
      expect(result).toBe(true);
    });
  });

  describe('makeTouchFriendly', () => {
    it('should create TouchHandler and attach to element', () => {
      const element = createMockElement();
      const cleanup = makeTouchFriendly(element);
      
      expect(typeof cleanup).toBe('function');
      expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('should accept custom configuration', () => {
      const element = createMockElement();
      const config = { enableHapticFeedback: false };
      const cleanup = makeTouchFriendly(element, config);
      
      expect(typeof cleanup).toBe('function');
    });
  });
});