/**
 * TouchHandler utility for enhanced touch event handling
 * Provides gesture recognition, haptic feedback, and touch target validation
 */

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureEvent {
  type: 'tap' | 'swipe' | 'pinch' | 'longpress' | 'doubletap';
  startPoint: TouchPoint;
  endPoint?: TouchPoint;
  duration: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
}

export interface TouchHandlerConfig {
  // Touch target validation
  minTouchTargetSize: number; // minimum 44px for accessibility
  touchTargetPadding: number; // additional padding around touch targets
  
  // Gesture recognition thresholds
  tapMaxDuration: number; // max duration for tap gesture
  longPressMinDuration: number; // min duration for long press
  swipeMinDistance: number; // min distance for swipe gesture
  doubleTapMaxDelay: number; // max delay between taps for double tap
  
  // Haptic feedback settings
  enableHapticFeedback: boolean;
  hapticPatterns: {
    tap: number | number[];
    longPress: number | number[];
    swipe: number | number[];
    error: number | number[];
    success: number | number[];
  };
}

export const DEFAULT_TOUCH_CONFIG: TouchHandlerConfig = {
  minTouchTargetSize: 44,
  touchTargetPadding: 8,
  tapMaxDuration: 300,
  longPressMinDuration: 500,
  swipeMinDistance: 30,
  doubleTapMaxDelay: 300,
  enableHapticFeedback: true,
  hapticPatterns: {
    tap: 10,
    longPress: [50, 50, 50],
    swipe: [20, 20],
    error: [100, 50, 100],
    success: [50, 25, 50, 25, 50],
  },
};

export class TouchHandler {
  private config: TouchHandlerConfig;
  private activeTouches: Map<number, TouchPoint> = new Map();
  private gestureStartTime: number = 0;
  private lastTapTime: number = 0;
  private lastTapPoint: TouchPoint | null = null;
  private longPressTimer: number | null = null;
  
  // Event listeners
  private onGestureCallbacks: Map<string, ((event: GestureEvent) => void)[]> = new Map();
  
  constructor(config: Partial<TouchHandlerConfig> = {}) {
    this.config = { ...DEFAULT_TOUCH_CONFIG, ...config };
  }

  /**
   * Initialize touch handler on an element
   */
  public attachToElement(element: HTMLElement): () => void {
    // Validate touch targets
    this.validateTouchTargets(element);
    
    // Add touch event listeners
    const handleTouchStart = this.handleTouchStart.bind(this);
    const handleTouchMove = this.handleTouchMove.bind(this);
    const handleTouchEnd = this.handleTouchEnd.bind(this);
    const handleTouchCancel = this.handleTouchCancel.bind(this);
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: false });
    
    // Apply mobile-optimized styles
    this.applyTouchStyles(element);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }

  /**
   * Add gesture event listener
   */
  public on(gestureType: string, callback: (event: GestureEvent) => void): void {
    if (!this.onGestureCallbacks.has(gestureType)) {
      this.onGestureCallbacks.set(gestureType, []);
    }
    this.onGestureCallbacks.get(gestureType)!.push(callback);
  }

  /**
   * Remove gesture event listener
   */
  public off(gestureType: string, callback: (event: GestureEvent) => void): void {
    const callbacks = this.onGestureCallbacks.get(gestureType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Trigger haptic feedback
   */
  public hapticFeedback(type: keyof TouchHandlerConfig['hapticPatterns']): void {
    if (!this.config.enableHapticFeedback) return;
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const pattern = this.config.hapticPatterns[type];
      navigator.vibrate(pattern);
    }
  }

  /**
   * Validate touch target sizes
   */
  private validateTouchTargets(element: HTMLElement): void {
    const touchableElements = element.querySelectorAll('[data-touchable], button, input, [role="button"]');
    
    touchableElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const minSize = this.config.minTouchTargetSize;
      
      if (rect.width < minSize || rect.height < minSize) {
        console.warn(`Touch target too small: ${rect.width}x${rect.height}px. Minimum: ${minSize}x${minSize}px`, el);
        
        // Auto-fix by adding padding if possible
        const htmlEl = el as HTMLElement;
        const currentPadding = parseInt(getComputedStyle(htmlEl).padding) || 0;
        const neededPadding = Math.max(0, (minSize - Math.min(rect.width, rect.height)) / 2);
        
        if (neededPadding > 0) {
          htmlEl.style.padding = `${currentPadding + neededPadding}px`;
        }
      }
    });
  }

  /**
   * Apply mobile-optimized touch styles
   */
  private applyTouchStyles(element: HTMLElement): void {
    element.style.touchAction = 'manipulation';
    (element.style as any).webkitTapHighlightColor = 'transparent';
    (element.style as any).webkitUserSelect = 'none';
    element.style.userSelect = 'none';
    
    // Add CSS class for touch-specific styling
    element.classList.add('touch-optimized');
  }

  /**
   * Handle touch start event
   */
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    if (!touch) return;
    
    const touchPoint: TouchPoint = {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
    
    this.activeTouches.set(touch.identifier, touchPoint);
    this.gestureStartTime = touchPoint.timestamp;
    
    // Start long press timer
    this.longPressTimer = window.setTimeout(() => {
      this.handleLongPress(touchPoint);
    }, this.config.longPressMinDuration);
    
    // Prevent default to avoid unwanted behaviors
    if (this.shouldPreventDefault(event.target as HTMLElement)) {
      event.preventDefault();
    }
  }

  /**
   * Handle touch move event
   */
  private handleTouchMove(event: TouchEvent): void {
    // Cancel long press if touch moves significantly
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    // Update active touches
    Array.from(event.touches).forEach((touch) => {
      const existingTouch = this.activeTouches.get(touch.identifier);
      if (existingTouch) {
        this.activeTouches.set(touch.identifier, {
          ...existingTouch,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now(),
        });
      }
    });
    
    // Prevent scrolling during touch interactions
    if (this.activeTouches.size > 0) {
      event.preventDefault();
    }
  }

  /**
   * Handle touch end event
   */
  private handleTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    if (!touch) return;
    
    const startTouch = this.activeTouches.get(touch.identifier);
    if (!startTouch) return;
    
    const endPoint: TouchPoint = {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
    
    const duration = endPoint.timestamp - startTouch.timestamp;
    const distance = this.calculateDistance(startTouch, endPoint);
    
    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    // Determine gesture type
    this.recognizeGesture(startTouch, endPoint, duration, distance);
    
    // Clean up
    this.activeTouches.delete(touch.identifier);
  }

  /**
   * Handle touch cancel event
   */
  private handleTouchCancel(event: TouchEvent): void {
    // Clear all active touches and timers
    this.activeTouches.clear();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Recognize gesture based on touch data
   */
  private recognizeGesture(startPoint: TouchPoint, endPoint: TouchPoint, duration: number, distance: number): void {
    // Check for double tap
    if (this.isDoubleTap(startPoint)) {
      this.emitGesture({
        type: 'doubletap',
        startPoint,
        endPoint,
        duration,
        distance,
      });
      this.hapticFeedback('tap');
      return;
    }
    
    // Check for swipe
    if (distance >= this.config.swipeMinDistance) {
      const direction = this.getSwipeDirection(startPoint, endPoint);
      this.emitGesture({
        type: 'swipe',
        startPoint,
        endPoint,
        duration,
        distance,
        direction,
      });
      this.hapticFeedback('swipe');
      return;
    }
    
    // Check for tap
    if (duration <= this.config.tapMaxDuration && distance < this.config.swipeMinDistance) {
      this.emitGesture({
        type: 'tap',
        startPoint,
        endPoint,
        duration,
        distance,
      });
      this.hapticFeedback('tap');
      
      // Store for potential double tap
      this.lastTapTime = endPoint.timestamp;
      this.lastTapPoint = startPoint;
    }
  }

  /**
   * Handle long press gesture
   */
  private handleLongPress(touchPoint: TouchPoint): void {
    this.emitGesture({
      type: 'longpress',
      startPoint: touchPoint,
      duration: Date.now() - touchPoint.timestamp,
    });
    this.hapticFeedback('longPress');
  }

  /**
   * Check if current tap is a double tap
   */
  private isDoubleTap(currentTap: TouchPoint): boolean {
    if (!this.lastTapPoint) return false;
    
    const timeDiff = currentTap.timestamp - this.lastTapTime;
    const distance = this.calculateDistance(this.lastTapPoint, currentTap);
    
    return timeDiff <= this.config.doubleTapMaxDelay && distance < 30;
  }

  /**
   * Get swipe direction
   */
  private getSwipeDirection(start: TouchPoint, end: TouchPoint): 'up' | 'down' | 'left' | 'right' {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(point1: TouchPoint, point2: TouchPoint): number {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  /**
   * Emit gesture event to listeners
   */
  private emitGesture(gestureEvent: GestureEvent): void {
    const callbacks = this.onGestureCallbacks.get(gestureEvent.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(gestureEvent));
    }
  }

  /**
   * Determine if default behavior should be prevented
   */
  private shouldPreventDefault(target: HTMLElement): boolean {
    // Don't prevent default for input elements
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return false;
    }
    
    // Prevent default for interactive elements
    return target.hasAttribute('data-touchable') || 
           target.role === 'button' || 
           target.tagName === 'BUTTON';
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.activeTouches.clear();
    this.onGestureCallbacks.clear();
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}

/**
 * Create a touch handler instance with default configuration
 */
export function createTouchHandler(config?: Partial<TouchHandlerConfig>): TouchHandler {
  return new TouchHandler(config);
}

/**
 * Utility function to validate touch target size
 */
export function validateTouchTargetSize(element: HTMLElement, minSize: number = 44): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= minSize && rect.height >= minSize;
}

/**
 * Utility function to make an element touch-friendly
 */
export function makeTouchFriendly(element: HTMLElement, config?: Partial<TouchHandlerConfig>): () => void {
  const touchHandler = new TouchHandler(config);
  return touchHandler.attachToElement(element);
}