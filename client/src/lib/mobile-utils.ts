/**
 * Mobile utility functions and helpers
 * Additional utilities for mobile optimization
 */

import { MOBILE_CONFIG, MEDIA_QUERIES, mobileUtils } from './mobile-config';
import { TouchHandler, createTouchHandler, validateTouchTargetSize, makeTouchFriendly } from './TouchHandler';

/**
 * Enhanced viewport utilities with detailed screen information
 */
export const viewport = {
  /**
   * Get current viewport dimensions
   */
  getDimensions: () => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    availableWidth: typeof window !== 'undefined' ? window.screen.availWidth : 0,
    availableHeight: typeof window !== 'undefined' ? window.screen.availHeight : 0,
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  }),

  /**
   * Get detailed screen size information with categorization
   */
  getDetailedInfo: () => {
    const dimensions = viewport.getDimensions();
    const deviceCategory = mobileUtils.getDeviceCategory();
    
    // Screen size categorization
    const isSmallMobile = dimensions.width <= 375;
    const isLargeMobile = dimensions.width >= 414 && deviceCategory === 'mobile';
    const isSmallTablet = dimensions.width >= 768 && dimensions.width <= 834 && deviceCategory === 'tablet';
    const isLargeTablet = dimensions.width >= 1024 && deviceCategory === 'tablet';
    
    // Determine breakpoint
    let breakpoint = 'xs';
    if (dimensions.width >= MOBILE_CONFIG.breakpoints.desktop) breakpoint = 'xl';
    else if (dimensions.width >= MOBILE_CONFIG.breakpoints.tablet) breakpoint = 'lg';
    else if (dimensions.width >= MOBILE_CONFIG.breakpoints.mobile) breakpoint = 'md';
    else if (dimensions.width >= 640) breakpoint = 'sm';
    
    return {
      ...dimensions,
      deviceCategory,
      screenSizeCategory: {
        category: deviceCategory,
        breakpoint,
        isSmallMobile,
        isLargeMobile,
        isSmallTablet,
        isLargeTablet,
      },
      aspectRatio: dimensions.width / dimensions.height,
      orientation: dimensions.width > dimensions.height ? 'landscape' : 'portrait',
    };
  },

  /**
   * Get safe area insets
   */
  getSafeAreaInsets: () => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
    
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-top') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0'),
    };
  },

  /**
   * Check if viewport height is affected by virtual keyboard
   */
  isVirtualKeyboardOpen: () => {
    if (typeof window === 'undefined') return false;
    const heightDifference = window.screen.height - window.innerHeight;
    return heightDifference > 150; // Threshold for virtual keyboard detection
  },

  /**
   * Get viewport scale factor
   */
  getScale: (): number => {
    if (typeof window === 'undefined') return 1;
    return window.outerWidth / window.innerWidth;
  },

  /**
   * Check if viewport is zoomed
   */
  isZoomed: (): boolean => {
    const scale = viewport.getScale();
    return Math.abs(scale - 1) > 0.1;
  },

  /**
   * Get effective viewport size (accounting for zoom)
   */
  getEffectiveSize: () => {
    const dimensions = viewport.getDimensions();
    const scale = viewport.getScale();
    
    return {
      width: dimensions.width * scale,
      height: dimensions.height * scale,
      scale,
    };
  },
};

/**
 * Enhanced touch detection and capability checking
 */
export const touchDetection = {
  /**
   * Comprehensive touch support detection
   */
  hasTouch: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Multiple detection methods for better accuracy
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  },

  /**
   * Detect if device has precise pointer (mouse)
   */
  hasPrecisePointer: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: fine)').matches;
  },

  /**
   * Detect if device can hover
   */
  canHover: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover)').matches;
  },

  /**
   * Get maximum number of simultaneous touch points
   */
  getMaxTouchPoints: (): number => {
    if (typeof navigator === 'undefined') return 0;
    return navigator.maxTouchPoints || (navigator as any).msMaxTouchPoints || 0;
  },

  /**
   * Detect touch capability level
   */
  getTouchCapability: (): 'none' | 'basic' | 'multitouch' | 'advanced' => {
    const maxTouchPoints = touchDetection.getMaxTouchPoints();
    const hasTouch = touchDetection.hasTouch();
    
    if (!hasTouch) return 'none';
    if (maxTouchPoints <= 1) return 'basic';
    if (maxTouchPoints <= 5) return 'multitouch';
    return 'advanced';
  },

  /**
   * Check if device supports force touch/3D touch
   */
  supportsForceTouch: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchforcechange' in window;
  },

  /**
   * Check if device supports haptic feedback
   */
  supportsHaptics: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return 'vibrate' in navigator || 'hapticFeedback' in navigator;
  },
};

/**
 * Touch utilities
 */
export const touch = {
  /**
   * Enable haptic feedback if supported
   */
  vibrate: (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  },

  /**
   * Enhanced haptic feedback with patterns
   */
  hapticFeedback: {
    light: () => touch.vibrate(10),
    medium: () => touch.vibrate(20),
    heavy: () => touch.vibrate(50),
    success: () => touch.vibrate([10, 50, 10]),
    error: () => touch.vibrate([50, 100, 50]),
    warning: () => touch.vibrate([20, 50, 20]),
    tap: () => touch.vibrate(5),
    longPress: () => touch.vibrate([20, 100]),
  },

  /**
   * Prevent default touch behaviors
   */
  preventDefaultTouch: (element: HTMLElement) => {
    element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  },

  /**
   * Enable smooth scrolling for touch devices
   */
  enableSmoothScrolling: (element: HTMLElement) => {
    (element.style as any).webkitOverflowScrolling = 'touch';
    element.style.scrollBehavior = 'smooth';
  },

  /**
   * Get touch coordinates from event
   */
  getTouchCoordinates: (event: TouchEvent) => {
    const touch = event.touches[0] || event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  },

  /**
   * Get all touch points from event
   */
  getAllTouchPoints: (event: TouchEvent) => {
    return Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      force: touch.force || 0,
    }));
  },

  /**
   * Calculate distance between two touch points
   */
  getTouchDistance: (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Calculate angle between two touch points
   */
  getTouchAngle: (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  },
};

/**
 * Performance utilities
 */
export const performance = {
  /**
   * Request animation frame with fallback
   */
  requestAnimationFrame: (callback: FrameRequestCallback): number => {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      return window.requestAnimationFrame(callback);
    }
    return setTimeout(callback, 16); // ~60fps fallback
  },

  /**
   * Cancel animation frame with fallback
   */
  cancelAnimationFrame: (id: number): void => {
    if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  },

  /**
   * Throttle function calls for performance
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastExecTime = 0;
    
    return (...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  },

  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },
};

/**
 * Enhanced CSS utilities with mobile-specific class management
 */
export const css = {
  /**
   * Add comprehensive mobile-specific CSS classes to element
   */
  addMobileClasses: (element: HTMLElement) => {
    const deviceCategory = mobileUtils.getDeviceCategory();
    const orientation = mobileUtils.isPortrait() ? 'portrait' : 'landscape';
    const touchCapability = touchDetection.getTouchCapability();
    
    // Device category classes
    element.classList.add(`device-${deviceCategory}`);
    element.classList.add(`orientation-${orientation}`);
    
    // Touch capability classes
    element.classList.add(`touch-${touchCapability}`);
    
    if (touchDetection.hasTouch()) {
      element.classList.add('touch-device');
    } else {
      element.classList.add('no-touch-device');
    }
    
    if (touchDetection.canHover()) {
      element.classList.add('can-hover');
    } else {
      element.classList.add('no-hover');
    }
    
    if (touchDetection.hasPrecisePointer()) {
      element.classList.add('precise-pointer');
    } else {
      element.classList.add('coarse-pointer');
    }
    
    // Screen size classes
    const { screenSizeCategory } = viewport.getDetailedInfo();
    if (screenSizeCategory.isSmallMobile) element.classList.add('small-mobile');
    if (screenSizeCategory.isLargeMobile) element.classList.add('large-mobile');
    if (screenSizeCategory.isSmallTablet) element.classList.add('small-tablet');
    if (screenSizeCategory.isLargeTablet) element.classList.add('large-tablet');
    
    // Breakpoint class
    element.classList.add(`breakpoint-${screenSizeCategory.breakpoint}`);
  },

  /**
   * Remove all mobile-specific classes
   */
  removeMobileClasses: (element: HTMLElement) => {
    const classesToRemove = [
      'device-mobile', 'device-tablet', 'device-desktop',
      'orientation-portrait', 'orientation-landscape',
      'touch-none', 'touch-basic', 'touch-multitouch', 'touch-advanced',
      'touch-device', 'no-touch-device',
      'can-hover', 'no-hover',
      'precise-pointer', 'coarse-pointer',
      'small-mobile', 'large-mobile', 'small-tablet', 'large-tablet',
      'breakpoint-xs', 'breakpoint-sm', 'breakpoint-md', 'breakpoint-lg', 'breakpoint-xl'
    ];
    
    element.classList.remove(...classesToRemove);
  },

  /**
   * Update mobile classes when device state changes
   */
  updateMobileClasses: (element: HTMLElement) => {
    css.removeMobileClasses(element);
    css.addMobileClasses(element);
  },

  /**
   * Apply mobile-optimized styles
   */
  applyMobileStyles: (element: HTMLElement) => {
    if (mobileUtils.isMobile()) {
      element.style.touchAction = 'manipulation';
      (element.style as any).webkitTapHighlightColor = 'transparent';
      (element.style as any).webkitUserSelect = 'none';
      element.style.userSelect = 'none';
    }
  },

  /**
   * Apply touch-friendly styles
   */
  applyTouchFriendlyStyles: (element: HTMLElement) => {
    const minTouchTarget = MOBILE_CONFIG.touchTarget.minimum;
    const currentWidth = element.offsetWidth;
    const currentHeight = element.offsetHeight;
    
    // Ensure minimum touch target size
    if (currentWidth < minTouchTarget) {
      element.style.minWidth = `${minTouchTarget}px`;
    }
    if (currentHeight < minTouchTarget) {
      element.style.minHeight = `${minTouchTarget}px`;
    }
    
    // Add touch-friendly properties
    element.style.touchAction = 'manipulation';
    element.style.cursor = 'pointer';
    (element.style as any).webkitTapHighlightColor = 'rgba(0, 0, 0, 0.1)';
  },

  /**
   * Get computed CSS custom property value
   */
  getCustomProperty: (property: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  },

  /**
   * Set CSS custom property value
   */
  setCustomProperty: (property: string, value: string): void => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(property, value);
    }
  },

  /**
   * Set multiple CSS custom properties
   */
  setCustomProperties: (properties: Record<string, string>): void => {
    Object.entries(properties).forEach(([property, value]) => {
      css.setCustomProperty(property, value);
    });
  },

  /**
   * Generate responsive CSS classes based on current state
   */
  generateResponsiveClasses: (): string[] => {
    const classes: string[] = [];
    const deviceCategory = mobileUtils.getDeviceCategory();
    const orientation = mobileUtils.isPortrait() ? 'portrait' : 'landscape';
    
    classes.push(`device-${deviceCategory}`);
    classes.push(`orientation-${orientation}`);
    
    if (touchDetection.hasTouch()) classes.push('touch-enabled');
    if (touchDetection.canHover()) classes.push('hover-enabled');
    if (accessibility.prefersReducedMotion()) classes.push('reduced-motion');
    if (accessibility.prefersHighContrast()) classes.push('high-contrast');
    
    return classes;
  },
};

/**
 * Responsive breakpoint management system
 */
export const breakpoints = {
  /**
   * Get current active breakpoint
   */
  getCurrent: (): string => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    
    if (width >= MOBILE_CONFIG.breakpoints.desktop) return 'xl';
    if (width >= MOBILE_CONFIG.breakpoints.tablet) return 'lg';
    if (width >= MOBILE_CONFIG.breakpoints.mobile) return 'md';
    if (width >= 640) return 'sm';
    return 'xs';
  },

  /**
   * Check if current viewport matches breakpoint
   */
  matches: (breakpoint: string): boolean => {
    const current = breakpoints.getCurrent();
    const order = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = order.indexOf(current);
    const targetIndex = order.indexOf(breakpoint);
    
    return currentIndex >= targetIndex;
  },

  /**
   * Check if current viewport is exactly at breakpoint
   */
  isExactly: (breakpoint: string): boolean => {
    return breakpoints.getCurrent() === breakpoint;
  },

  /**
   * Check if current viewport is between two breakpoints
   */
  isBetween: (min: string, max: string): boolean => {
    const current = breakpoints.getCurrent();
    const order = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = order.indexOf(current);
    const minIndex = order.indexOf(min);
    const maxIndex = order.indexOf(max);
    
    return currentIndex >= minIndex && currentIndex <= maxIndex;
  },

  /**
   * Get breakpoint values
   */
  getValues: () => MOBILE_CONFIG.breakpoints,

  /**
   * Create responsive value based on breakpoints
   */
  createResponsiveValue: <T>(values: Partial<Record<string, T>>): T | undefined => {
    const current = breakpoints.getCurrent();
    const order = ['xl', 'lg', 'md', 'sm', 'xs']; // Check from largest to smallest
    
    for (const bp of order) {
      if (values[bp] !== undefined && breakpoints.matches(bp)) {
        return values[bp];
      }
    }
    
    return undefined;
  },

  /**
   * Add breakpoint change listener
   */
  addChangeListener: (callback: (breakpoint: string) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    
    let currentBreakpoint = breakpoints.getCurrent();
    
    const handler = () => {
      const newBreakpoint = breakpoints.getCurrent();
      if (newBreakpoint !== currentBreakpoint) {
        currentBreakpoint = newBreakpoint;
        callback(newBreakpoint);
      }
    };
    
    window.addEventListener('resize', handler);
    callback(currentBreakpoint); // Call immediately with current state
    
    return () => window.removeEventListener('resize', handler);
  },
};

/**
 * Enhanced media query utilities
 */
export const mediaQuery = {
  /**
   * Check if media query matches
   */
  matches: (query: string): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  },

  /**
   * Add media query listener
   */
  addListener: (query: string, callback: (matches: boolean) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mql.addEventListener('change', handler);
    callback(mql.matches); // Call immediately with current state
    
    return () => mql.removeEventListener('change', handler);
  },

  /**
   * Create media query string for breakpoint
   */
  createBreakpointQuery: (breakpoint: string, type: 'min' | 'max' | 'exact' = 'min'): string => {
    const values = MOBILE_CONFIG.breakpoints;
    const breakpointValue = values[breakpoint as keyof typeof values];
    
    if (!breakpointValue) return '';
    
    switch (type) {
      case 'min':
        return `(min-width: ${breakpointValue}px)`;
      case 'max':
        return `(max-width: ${breakpointValue - 1}px)`;
      case 'exact':
        const nextBreakpoint = breakpoint === 'desktop' ? Infinity : 
                              breakpoint === 'tablet' ? values.desktop :
                              values.tablet;
        return `(min-width: ${breakpointValue}px) and (max-width: ${nextBreakpoint - 1}px)`;
      default:
        return '';
    }
  },

  /**
   * Predefined media query checks
   */
  isMobile: () => mediaQuery.matches(MEDIA_QUERIES.mobile),
  isTablet: () => mediaQuery.matches(MEDIA_QUERIES.tablet),
  isDesktop: () => mediaQuery.matches(MEDIA_QUERIES.desktop),
  isPortrait: () => mediaQuery.matches(MEDIA_QUERIES.portrait),
  isLandscape: () => mediaQuery.matches(MEDIA_QUERIES.landscape),
  isTouchDevice: () => mediaQuery.matches(MEDIA_QUERIES.touch),
  prefersReducedMotion: () => mediaQuery.matches(MEDIA_QUERIES.reducedMotion),
  prefersHighContrast: () => mediaQuery.matches(MEDIA_QUERIES.highContrast),

  /**
   * Advanced media query combinations
   */
  isMobilePortrait: () => mediaQuery.matches(`${MEDIA_QUERIES.mobile} and ${MEDIA_QUERIES.portrait}`),
  isMobileLandscape: () => mediaQuery.matches(`${MEDIA_QUERIES.mobile} and ${MEDIA_QUERIES.landscape}`),
  isTabletPortrait: () => mediaQuery.matches(`${MEDIA_QUERIES.tablet} and ${MEDIA_QUERIES.portrait}`),
  isTabletLandscape: () => mediaQuery.matches(`${MEDIA_QUERIES.tablet} and ${MEDIA_QUERIES.landscape}`),
  isTouchAndMobile: () => mediaQuery.matches(`${MEDIA_QUERIES.touch} and ${MEDIA_QUERIES.mobile}`),
};

/**
 * Accessibility utilities
 */
export const accessibility = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return mediaQuery.matches(MEDIA_QUERIES.reducedMotion);
  },

  /**
   * Check if user prefers high contrast
   */
  prefersHighContrast: (): boolean => {
    return mediaQuery.matches(MEDIA_QUERIES.highContrast);
  },

  /**
   * Announce text to screen readers
   */
  announce: (text: string): void => {
    if (typeof document === 'undefined') return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = text;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Focus management for mobile
   */
  manageFocus: {
    /**
     * Focus element with mobile considerations
     */
    focus: (element: HTMLElement): void => {
      if (mobileUtils.isMobile()) {
        // Delay focus on mobile to avoid virtual keyboard issues
        setTimeout(() => element.focus(), 100);
      } else {
        element.focus();
      }
    },

    /**
     * Blur element and hide virtual keyboard
     */
    blur: (element: HTMLElement): void => {
      element.blur();
      // Force virtual keyboard to hide on mobile
      if (mobileUtils.isMobile() && document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
    },
  },
};

/**
 * Device detection utilities
 */
export const device = {
  /**
   * Get device information
   */
  getInfo: () => ({
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? (navigator.platform || (navigator as any).userAgentData?.platform || '') : '',
    language: typeof navigator !== 'undefined' ? navigator.language : 'en',
    cookieEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : false,
    onLine: typeof navigator !== 'undefined' ? navigator.onLine : true,
  }),

  /**
   * Check if device is iOS
   */
  isIOS: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  /**
   * Check if device is Android
   */
  isAndroid: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  },

  /**
   * Check if device is mobile Safari
   */
  isMobileSafari: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return device.isIOS() && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
  },

  /**
   * Check if device supports PWA installation
   */
  supportsPWA: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },
};

/**
 * Enhanced touch utilities with gesture recognition
 */
export const enhancedTouch = {
  /**
   * Create a new touch handler instance
   */
  createHandler: createTouchHandler,
  
  /**
   * Make an element touch-friendly with gesture recognition
   */
  makeTouchFriendly,
  
  /**
   * Validate touch target size
   */
  validateTouchTargetSize,
  
  /**
   * Create touch handler for specific element with callbacks
   */
  attachToElement: (element: HTMLElement, callbacks?: {
    onTap?: (event: any) => void;
    onSwipe?: (event: any) => void;
    onLongPress?: (event: any) => void;
    onDoubleTap?: (event: any) => void;
  }) => {
    const handler = createTouchHandler();
    
    if (callbacks?.onTap) handler.on('tap', callbacks.onTap);
    if (callbacks?.onSwipe) handler.on('swipe', callbacks.onSwipe);
    if (callbacks?.onLongPress) handler.on('longpress', callbacks.onLongPress);
    if (callbacks?.onDoubleTap) handler.on('doubletap', callbacks.onDoubleTap);
    
    return handler.attachToElement(element);
  },
};

/**
 * Export all utilities as a single object
 */
export const mobileUtilities = {
  viewport,
  touchDetection,
  touch,
  enhancedTouch,
  performance,
  css,
  mediaQuery,
  breakpoints,
  accessibility,
  device,
  config: MOBILE_CONFIG,
  queries: MEDIA_QUERIES,
  utils: mobileUtils,
};

// Export TouchHandler class and utilities for direct use
export { TouchHandler, createTouchHandler, validateTouchTargetSize, makeTouchFriendly };