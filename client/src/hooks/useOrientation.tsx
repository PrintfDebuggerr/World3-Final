import { useState, useEffect, useCallback } from 'react';
import { MOBILE_CONFIG, mobileUtils, type DeviceCategory, type Orientation } from '../lib/mobile-config';

// Orientation lock types
export type OrientationLockType = 
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary';

export interface ScreenSizeCategory {
  category: DeviceCategory;
  breakpoint: string;
  isSmallMobile: boolean;
  isLargeMobile: boolean;
  isSmallTablet: boolean;
  isLargeTablet: boolean;
}

export interface DeviceCapabilities {
  hasTouch: boolean;
  hasHapticFeedback: boolean;
  hasOrientationAPI: boolean;
  hasScreenOrientationAPI: boolean;
  hasSafeArea: boolean;
  hasFullscreenAPI: boolean;
  hasVibrationAPI: boolean;
  hasDeviceMotionAPI: boolean;
  pixelRatio: number;
  maxTouchPoints: number;
}

export interface OrientationLockState {
  isLocked: boolean;
  lockedOrientation: OrientationLockType | null;
  canLock: boolean;
}

export interface OrientationState {
  orientation: Orientation;
  angle: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceCategory: DeviceCategory;
  screenSize: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
  };
  screenSizeCategory: ScreenSizeCategory;
  deviceCapabilities: DeviceCapabilities;
  orientationLock: OrientationLockState;
}

/**
 * Get detailed screen size categorization
 */
const getScreenSizeCategory = (width: number, height: number): ScreenSizeCategory => {
  const deviceCategory = mobileUtils.getDeviceCategory();
  
  // Determine specific size categories
  const isSmallMobile = width <= 375; // iPhone SE and smaller
  const isLargeMobile = width >= 414 && deviceCategory === 'mobile'; // iPhone Plus and larger
  const isSmallTablet = width >= 768 && width <= 834 && deviceCategory === 'tablet'; // iPad mini
  const isLargeTablet = width >= 1024 && deviceCategory === 'tablet'; // iPad Pro
  
  // Determine breakpoint name
  let breakpoint = 'xs';
  if (width >= MOBILE_CONFIG.breakpoints.desktop) breakpoint = 'xl';
  else if (width >= MOBILE_CONFIG.breakpoints.tablet) breakpoint = 'lg';
  else if (width >= MOBILE_CONFIG.breakpoints.mobile) breakpoint = 'md';
  else if (width >= 640) breakpoint = 'sm';
  
  return {
    category: deviceCategory,
    breakpoint,
    isSmallMobile,
    isLargeMobile,
    isSmallTablet,
    isLargeTablet,
  };
};

/**
 * Detect device capabilities
 */
const getDeviceCapabilities = (): DeviceCapabilities => {
  if (typeof window === 'undefined') {
    return {
      hasTouch: false,
      hasHapticFeedback: false,
      hasOrientationAPI: false,
      hasScreenOrientationAPI: false,
      hasSafeArea: false,
      hasFullscreenAPI: false,
      hasVibrationAPI: false,
      hasDeviceMotionAPI: false,
      pixelRatio: 1,
      maxTouchPoints: 0,
    };
  }

  return {
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hasHapticFeedback: 'vibrate' in navigator,
    hasOrientationAPI: 'orientation' in window,
    hasScreenOrientationAPI: 'screen' in window && 'orientation' in window.screen,
    hasSafeArea: CSS.supports('padding-top', 'env(safe-area-inset-top)'),
    hasFullscreenAPI: 'requestFullscreen' in document.documentElement,
    hasVibrationAPI: 'vibrate' in navigator,
    hasDeviceMotionAPI: 'DeviceMotionEvent' in window,
    pixelRatio: window.devicePixelRatio || 1,
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
};

/**
 * Get orientation angle
 */
const getOrientationAngle = (): number => {
  if (typeof window === 'undefined') return 0;
  
  // Try screen.orientation first (modern API)
  if (window.screen?.orientation?.angle !== undefined) {
    return window.screen.orientation.angle;
  }
  
  // Fallback to window.orientation (deprecated but widely supported)
  if (window.orientation !== undefined) {
    return Math.abs(window.orientation);
  }
  
  // Calculate from dimensions as last resort
  return window.innerWidth > window.innerHeight ? 90 : 0;
};

/**
 * Get orientation lock state
 */
const getOrientationLockState = (): OrientationLockState => {
  if (typeof window === 'undefined' || !window.screen?.orientation) {
    return {
      isLocked: false,
      lockedOrientation: null,
      canLock: false,
    };
  }

  const orientation = window.screen.orientation;
  
  return {
    isLocked: orientation.type.includes('locked') || false,
    lockedOrientation: orientation.type as OrientationLockType || null,
    canLock: 'lock' in orientation,
  };
};

export function useOrientation(): OrientationState & {
  lockOrientation: (orientation: OrientationLockType) => Promise<boolean>;
  unlockOrientation: () => Promise<boolean>;
  refreshCapabilities: () => void;
} {
  const [state, setState] = useState<OrientationState>(() => ({
    orientation: 'portrait',
    angle: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    deviceCategory: 'mobile',
    screenSize: { width: 0, height: 0, availWidth: 0, availHeight: 0 },
    screenSizeCategory: {
      category: 'mobile',
      breakpoint: 'xs',
      isSmallMobile: false,
      isLargeMobile: false,
      isSmallTablet: false,
      isLargeTablet: false,
    },
    deviceCapabilities: getDeviceCapabilities(),
    orientationLock: {
      isLocked: false,
      lockedOrientation: null,
      canLock: false,
    },
  }));

  const updateOrientation = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const availWidth = window.screen?.availWidth || width;
    const availHeight = window.screen?.availHeight || height;
    const orientation = mobileUtils.isPortrait() ? 'portrait' : 'landscape';
    const angle = getOrientationAngle();
    const deviceCategory = mobileUtils.getDeviceCategory();
    const screenSizeCategory = getScreenSizeCategory(width, height);
    const deviceCapabilities = getDeviceCapabilities();
    const orientationLock = getOrientationLockState();
    
    setState({
      orientation,
      angle,
      isMobile: deviceCategory === 'mobile',
      isTablet: deviceCategory === 'tablet',
      isDesktop: deviceCategory === 'desktop',
      deviceCategory,
      screenSize: { width, height, availWidth, availHeight },
      screenSizeCategory,
      deviceCapabilities,
      orientationLock,
    });
  }, []);

  const lockOrientation = useCallback(async (orientation: OrientationLockType): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.screen?.orientation?.lock) {
      console.warn('Screen orientation lock is not supported');
      return false;
    }

    try {
      await window.screen.orientation.lock(orientation);
      updateOrientation(); // Refresh state after lock
      return true;
    } catch (error) {
      console.error('Failed to lock orientation:', error);
      return false;
    }
  }, [updateOrientation]);

  const unlockOrientation = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.screen?.orientation?.unlock) {
      console.warn('Screen orientation unlock is not supported');
      return false;
    }

    try {
      window.screen.orientation.unlock();
      updateOrientation(); // Refresh state after unlock
      return true;
    } catch (error) {
      console.error('Failed to unlock orientation:', error);
      return false;
    }
  }, [updateOrientation]);

  const refreshCapabilities = useCallback(() => {
    updateOrientation();
  }, [updateOrientation]);

  useEffect(() => {
    // Initial check
    updateOrientation();

    // Event listeners
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    // Listen for screen orientation changes (modern API)
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', updateOrientation);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
      
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', updateOrientation);
      }
    };
  }, [updateOrientation]);

  return {
    ...state,
    lockOrientation,
    unlockOrientation,
    refreshCapabilities,
  };
}

