import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { mobileUtilities, MOBILE_CONFIG } from '../lib/mobile-utils';
import { MEDIA_QUERIES } from '../lib/mobile-config';
import { useOrientation } from '../hooks/useOrientation';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

// Mobile configuration state interface
export interface MobileConfig {
  screenSize: {
    width: number;
    height: number;
    density: number;
  };
  capabilities: {
    touchSupport: boolean;
    hapticFeedback: boolean;
    orientationLock: boolean;
    fullscreen: boolean;
    virtualKeyboard: boolean;
  };
  preferences: {
    keyboardType: 'native' | 'virtual' | 'hybrid';
    hapticEnabled: boolean;
    autoRotate: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    highContrast: boolean;
  };
  performance: {
    frameRate: number;
    memoryUsage: number;
    batteryImpact: 'low' | 'medium' | 'high';
    networkUsage: number;
    renderTime: number;
  };
}

// Touch interaction state interface
export interface TouchState {
  activeTouch: {
    id: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null;
  gestureType: 'tap' | 'swipe' | 'pinch' | 'none';
  inputMode: 'keyboard' | 'touch' | 'hybrid';
  isVirtualKeyboardOpen: boolean;
}

// Mobile context state interface
export interface MobileContextState {
  // Device information
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  
  // Configuration
  config: MobileConfig;
  touchState: TouchState;
  
  // Capabilities
  capabilities: {
    hasTouch: boolean;
    hasHapticFeedback: boolean;
    hasOrientationAPI: boolean;
    hasSafeArea: boolean;
    hasFullscreenAPI: boolean;
    maxTouchPoints: number;
  };
  
  // Performance metrics
  performance: {
    isLowEndDevice: boolean;
    shouldReduceAnimations: boolean;
    frameRate: number;
    memoryPressure: 'low' | 'medium' | 'high';
  };
  
  // Error handling
  errors: {
    orientationError: string | null;
    touchError: string | null;
    performanceError: string | null;
    networkError: string | null;
  };
  
  // Actions
  actions: {
    updateConfig: (config: Partial<MobileConfig>) => void;
    updateTouchState: (touchState: Partial<TouchState>) => void;
    clearError: (errorType: keyof MobileContextState['errors']) => void;
    enableHapticFeedback: (pattern?: number | number[]) => void;
    lockOrientation: (orientation: OrientationLockType) => Promise<boolean>;
    unlockOrientation: () => Promise<boolean>;
    enterFullscreen: () => Promise<boolean>;
    exitFullscreen: () => Promise<boolean>;
    refreshCapabilities: () => void;
  };
}

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

// Create context
const MobileContext = createContext<MobileContextState | null>(null);

// Default mobile configuration
const getDefaultMobileConfig = (): MobileConfig => ({
  screenSize: {
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    density: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  },
  capabilities: {
    touchSupport: mobileUtilities.touchDetection.hasTouch(),
    hapticFeedback: mobileUtilities.touchDetection.supportsHaptics(),
    orientationLock: typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen && 'lock' in window.screen.orientation,
    fullscreen: typeof document !== 'undefined' && 'requestFullscreen' in document.documentElement,
    virtualKeyboard: mobileUtilities.viewport.isVirtualKeyboardOpen(),
  },
  preferences: {
    keyboardType: 'hybrid',
    hapticEnabled: true,
    autoRotate: true,
    fontSize: 'medium',
    reducedMotion: mobileUtilities.accessibility.prefersReducedMotion(),
    highContrast: mobileUtilities.accessibility.prefersHighContrast(),
  },
  performance: {
    frameRate: 60,
    memoryUsage: 0,
    batteryImpact: 'low',
    networkUsage: 0,
    renderTime: 0,
  },
});

// Default touch state
const getDefaultTouchState = (): TouchState => ({
  activeTouch: null,
  gestureType: 'none',
  inputMode: 'hybrid',
  isVirtualKeyboardOpen: false,
});

// Provider component
export function MobileProvider({ children }: { children: ReactNode }) {
  const orientation = useOrientation();
  const performanceMonitor = usePerformanceMonitor();
  
  // State
  const [config, setConfig] = useState<MobileConfig>(getDefaultMobileConfig);
  const [touchState, setTouchState] = useState<TouchState>(getDefaultTouchState);
  const [errors, setErrors] = useState({
    orientationError: null as string | null,
    touchError: null as string | null,
    performanceError: null as string | null,
    networkError: null as string | null,
  });

  // Device information
  const deviceCategory = mobileUtilities.utils.getDeviceCategory();
  const isMobile = deviceCategory === 'mobile';
  const isTablet = deviceCategory === 'tablet';
  const isDesktop = deviceCategory === 'desktop';

  // Capabilities
  const capabilities = {
    hasTouch: mobileUtilities.touchDetection.hasTouch(),
    hasHapticFeedback: mobileUtilities.touchDetection.supportsHaptics(),
    hasOrientationAPI: orientation.deviceCapabilities.hasOrientationAPI,
    hasSafeArea: orientation.deviceCapabilities.hasSafeArea,
    hasFullscreenAPI: orientation.deviceCapabilities.hasFullscreenAPI,
    maxTouchPoints: orientation.deviceCapabilities.maxTouchPoints,
  };

  // Performance metrics
  const performance = {
    isLowEndDevice: performanceMonitor.isLowEndDevice,
    shouldReduceAnimations: performanceMonitor.shouldReduceAnimations || config.preferences.reducedMotion,
    frameRate: performanceMonitor.frameRate,
    memoryPressure: performanceMonitor.memoryPressure,
  };

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<MobileConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
      screenSize: { ...prev.screenSize, ...newConfig.screenSize },
      capabilities: { ...prev.capabilities, ...newConfig.capabilities },
      preferences: { ...prev.preferences, ...newConfig.preferences },
      performance: { ...prev.performance, ...newConfig.performance },
    }));
  }, []);

  // Update touch state
  const updateTouchState = useCallback((newTouchState: Partial<TouchState>) => {
    setTouchState(prev => ({
      ...prev,
      ...newTouchState,
      activeTouch: newTouchState.activeTouch !== undefined ? newTouchState.activeTouch : prev.activeTouch,
    }));
  }, []);

  // Clear error
  const clearError = useCallback((errorType: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [errorType]: null }));
  }, []);

  // Enable haptic feedback
  const enableHapticFeedback = useCallback((pattern: number | number[] = 10) => {
    if (config.preferences.hapticEnabled && capabilities.hasHapticFeedback) {
      try {
        mobileUtilities.touch.vibrate(pattern);
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
        setErrors(prev => ({ ...prev, touchError: 'Haptic feedback not available' }));
      }
    }
  }, [config.preferences.hapticEnabled, capabilities.hasHapticFeedback]);

  // Lock orientation
  const lockOrientation = useCallback(async (orientationLock: OrientationLockType): Promise<boolean> => {
    try {
      const success = await orientation.lockOrientation(orientationLock);
      if (!success) {
        setErrors(prev => ({ ...prev, orientationError: 'Orientation lock not supported' }));
      }
      return success;
    } catch (error) {
      setErrors(prev => ({ ...prev, orientationError: 'Failed to lock orientation' }));
      return false;
    }
  }, [orientation]);

  // Unlock orientation
  const unlockOrientation = useCallback(async (): Promise<boolean> => {
    try {
      const success = await orientation.unlockOrientation();
      if (!success) {
        setErrors(prev => ({ ...prev, orientationError: 'Orientation unlock not supported' }));
      }
      return success;
    } catch (error) {
      setErrors(prev => ({ ...prev, orientationError: 'Failed to unlock orientation' }));
      return false;
    }
  }, [orientation]);

  // Enter fullscreen
  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    if (!capabilities.hasFullscreenAPI) {
      setErrors(prev => ({ ...prev, orientationError: 'Fullscreen not supported' }));
      return false;
    }

    try {
      await document.documentElement.requestFullscreen();
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, orientationError: 'Failed to enter fullscreen' }));
      return false;
    }
  }, [capabilities.hasFullscreenAPI]);

  // Exit fullscreen
  const exitFullscreen = useCallback(async (): Promise<boolean> => {
    if (!document.fullscreenElement) {
      return true;
    }

    try {
      await document.exitFullscreen();
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, orientationError: 'Failed to exit fullscreen' }));
      return false;
    }
  }, []);

  // Refresh capabilities
  const refreshCapabilities = useCallback(() => {
    orientation.refreshCapabilities();
    updateConfig({
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight,
        density: window.devicePixelRatio,
      },
      capabilities: {
        touchSupport: mobileUtilities.touchDetection.hasTouch(),
        hapticFeedback: mobileUtilities.touchDetection.supportsHaptics(),
        orientationLock: typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen && 'lock' in window.screen.orientation,
        fullscreen: typeof document !== 'undefined' && 'requestFullscreen' in document.documentElement,
        virtualKeyboard: mobileUtilities.viewport.isVirtualKeyboardOpen(),
      },
    });
  }, [orientation, updateConfig]);

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      updateConfig({
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
          density: window.devicePixelRatio,
        },
        capabilities: {
          ...config.capabilities,
          virtualKeyboard: mobileUtilities.viewport.isVirtualKeyboardOpen(),
        },
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updateConfig, config.capabilities]);

  // Update performance metrics
  useEffect(() => {
    updateConfig({
      performance: {
        frameRate: performanceMonitor.frameRate,
        memoryUsage: performanceMonitor.memoryUsage,
        batteryImpact: performanceMonitor.batteryImpact,
        networkUsage: 0, // Would need network monitoring
        renderTime: performanceMonitor.renderTime,
      },
    });
  }, [performanceMonitor, updateConfig]);

  // Update accessibility preferences
  useEffect(() => {
    const updateAccessibilityPreferences = () => {
      updateConfig({
        preferences: {
          ...config.preferences,
          reducedMotion: mobileUtilities.accessibility.prefersReducedMotion(),
          highContrast: mobileUtilities.accessibility.prefersHighContrast(),
        },
      });
    };

    // Listen for preference changes
    const reducedMotionQuery = window.matchMedia(MEDIA_QUERIES.reducedMotion);
    const highContrastQuery = window.matchMedia(MEDIA_QUERIES.highContrast);

    reducedMotionQuery.addEventListener('change', updateAccessibilityPreferences);
    highContrastQuery.addEventListener('change', updateAccessibilityPreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', updateAccessibilityPreferences);
      highContrastQuery.removeEventListener('change', updateAccessibilityPreferences);
    };
  }, [config.preferences, updateConfig]);

  // Apply mobile CSS classes to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      mobileUtilities.css.addMobileClasses(document.documentElement);
      
      return () => {
        mobileUtilities.css.removeMobileClasses(document.documentElement);
      };
    }
  }, [deviceCategory, orientation.orientation]);

  // Context value
  const contextValue: MobileContextState = {
    // Device information
    isMobile,
    isTablet,
    isDesktop,
    deviceCategory,
    orientation: orientation.orientation,
    
    // Configuration
    config,
    touchState,
    
    // Capabilities
    capabilities,
    
    // Performance metrics
    performance,
    
    // Error handling
    errors,
    
    // Actions
    actions: {
      updateConfig,
      updateTouchState,
      clearError,
      enableHapticFeedback,
      lockOrientation,
      unlockOrientation,
      enterFullscreen,
      exitFullscreen,
      refreshCapabilities,
    },
  };

  return (
    <MobileContext.Provider value={contextValue}>
      {children}
    </MobileContext.Provider>
  );
}

// Hook to use mobile context
export function useMobile(): MobileContextState {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
}

// Hook for mobile-specific error handling
export function useMobileErrorHandler() {
  const { errors, actions } = useMobile();
  
  const handleOrientationError = useCallback((error: Error) => {
    console.error('Orientation error:', error);
    // Set error state that will be handled by mobile-friendly error display
    // This will be handled by the error handling system we'll create next
  }, []);

  const handleTouchError = useCallback((error: Error) => {
    console.error('Touch error:', error);
    // Handle touch-related errors
  }, []);

  const handlePerformanceError = useCallback((error: Error) => {
    console.error('Performance error:', error);
    // Handle performance-related errors
  }, []);

  const handleNetworkError = useCallback((error: Error) => {
    console.error('Network error:', error);
    // Handle network-related errors
  }, []);

  return {
    errors,
    clearError: actions.clearError,
    handleOrientationError,
    handleTouchError,
    handlePerformanceError,
    handleNetworkError,
  };
}

// Export types
export type { MobileConfig, TouchState, MobileContextState };