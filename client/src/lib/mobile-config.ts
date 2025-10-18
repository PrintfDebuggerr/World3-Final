/**
 * Mobile-first configuration and constants
 * Centralized mobile optimization settings
 */

export const MOBILE_BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const MOBILE_CONFIG = {
  // Touch target sizes (following Apple HIG and Material Design)
  touchTarget: {
    minimum: 44, // px - minimum touch target size
    comfortable: 48, // px - comfortable touch target size
    spacing: 8, // px - minimum spacing between touch targets
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: MOBILE_BREAKPOINTS.md - 1, // 767px
    tablet: MOBILE_BREAKPOINTS.lg - 1, // 1023px
    desktop: MOBILE_BREAKPOINTS.lg, // 1024px
  },
  
  // Layout dimensions
  layout: {
    headerHeight: {
      mobile: 56,
      tablet: 64,
      desktop: 72,
    },
    keyboardHeight: {
      mobile: 240,
      tablet: 280,
      desktop: 320,
    },
    gameAreaPadding: {
      mobile: 16,
      tablet: 24,
      desktop: 32,
    },
    safeAreaInsets: {
      top: 'env(safe-area-inset-top, 0px)',
      bottom: 'env(safe-area-inset-bottom, 0px)',
      left: 'env(safe-area-inset-left, 0px)',
      right: 'env(safe-area-inset-right, 0px)',
    },
  },
  
  // Typography scale
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Animation settings
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Performance settings
  performance: {
    // Enable hardware acceleration for animations
    enableHardwareAcceleration: true,
    // Throttle animations on low-end devices
    enableAnimationThrottling: true,
    // Maximum frame rate for animations
    maxFrameRate: 60,
  },
  
  // Device capabilities
  capabilities: {
    // Check for touch support
    hasTouch: typeof window !== 'undefined' && 'ontouchstart' in window,
    // Check for haptic feedback support
    hasHapticFeedback: typeof window !== 'undefined' && 'vibrate' in navigator,
    // Check for orientation API support
    hasOrientationAPI: typeof window !== 'undefined' && 'orientation' in window,
    // Check for safe area support
    hasSafeArea: typeof window !== 'undefined' && CSS.supports('padding-top', 'env(safe-area-inset-top)'),
  },
} as const;

/**
 * Utility functions for mobile detection and configuration
 */
export const mobileUtils = {
  /**
   * Check if current screen size is mobile
   */
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_CONFIG.breakpoints.mobile;
  },
  
  /**
   * Check if current screen size is tablet
   */
  isTablet: (): boolean => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= MOBILE_CONFIG.breakpoints.mobile && width <= MOBILE_CONFIG.breakpoints.tablet;
  },
  
  /**
   * Check if current screen size is desktop
   */
  isDesktop: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= MOBILE_CONFIG.breakpoints.desktop;
  },
  
  /**
   * Get current device category
   */
  getDeviceCategory: (): 'mobile' | 'tablet' | 'desktop' => {
    if (mobileUtils.isMobile()) return 'mobile';
    if (mobileUtils.isTablet()) return 'tablet';
    return 'desktop';
  },
  
  /**
   * Check if device supports touch
   */
  isTouchDevice: (): boolean => {
    return MOBILE_CONFIG.capabilities.hasTouch;
  },
  
  /**
   * Check if device is in portrait orientation
   */
  isPortrait: (): boolean => {
    if (typeof window === 'undefined') return true;
    return window.innerHeight > window.innerWidth;
  },
  
  /**
   * Check if device is in landscape orientation
   */
  isLandscape: (): boolean => {
    return !mobileUtils.isPortrait();
  },
  
  /**
   * Get appropriate touch target size based on device
   */
  getTouchTargetSize: (): number => {
    const deviceCategory = mobileUtils.getDeviceCategory();
    return deviceCategory === 'mobile' 
      ? MOBILE_CONFIG.touchTarget.minimum 
      : MOBILE_CONFIG.touchTarget.comfortable;
  },
  
  /**
   * Get appropriate spacing based on device
   */
  getSpacing: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'): number => {
    const deviceCategory = mobileUtils.getDeviceCategory();
    const spacingMap = {
      mobile: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 },
      tablet: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 48 },
      desktop: { xs: 8, sm: 16, md: 24, lg: 32, xl: 48, '2xl': 64 },
    };
    return spacingMap[deviceCategory][size];
  },
  
  /**
   * Get CSS custom property value
   */
  getCSSCustomProperty: (property: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(property);
  },
  
  /**
   * Set CSS custom property value
   */
  setCSSCustomProperty: (property: string, value: string): void => {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(property, value);
  },
};

/**
 * Media query strings for responsive design
 */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${MOBILE_CONFIG.breakpoints.mobile}px)`,
  tablet: `(min-width: ${MOBILE_CONFIG.breakpoints.mobile + 1}px) and (max-width: ${MOBILE_CONFIG.breakpoints.tablet}px)`,
  desktop: `(min-width: ${MOBILE_CONFIG.breakpoints.desktop}px)`,
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  touch: '(hover: none) and (pointer: coarse)',
  noTouch: '(hover: hover) and (pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  highContrast: '(prefers-contrast: high)',
} as const;

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';
export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';