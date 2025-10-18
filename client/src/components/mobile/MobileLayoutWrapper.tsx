import React, { useEffect, useCallback, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobile } from '../../contexts/MobileContext';
import { mobileUtilities } from '../../lib/mobile-utils';
import MobileErrorHandler from './MobileErrorHandler';
import MobileConfigManager from './MobileConfigManager';

// Layout wrapper props
interface MobileLayoutWrapperProps {
  children: ReactNode;
  className?: string;
  enableConfigManager?: boolean;
  enableErrorHandler?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableOrientationHandling?: boolean;
  enableSafeAreaHandling?: boolean;
}

// Safe area component
function SafeAreaHandler({ children }: { children: ReactNode }) {
  const { capabilities } = useMobile();

  useEffect(() => {
    if (capabilities.hasSafeArea) {
      // Set CSS custom properties for safe area insets
      mobileUtilities.css.setCustomProperties({
        '--safe-area-top': 'env(safe-area-inset-top, 0px)',
        '--safe-area-bottom': 'env(safe-area-inset-bottom, 0px)',
        '--safe-area-left': 'env(safe-area-inset-left, 0px)',
        '--safe-area-right': 'env(safe-area-inset-right, 0px)',
      });

      // Add safe area classes
      document.documentElement.classList.add('has-safe-area');
    } else {
      document.documentElement.classList.remove('has-safe-area');
    }
  }, [capabilities.hasSafeArea]);

  return (
    <div className="safe-area-container">
      {children}
    </div>
  );
}

// Orientation change handler
function OrientationHandler({ children }: { children: ReactNode }) {
  const { orientation, isMobile, actions } = useMobile();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousOrientation, setPreviousOrientation] = useState(orientation);

  useEffect(() => {
    if (orientation !== previousOrientation && isMobile) {
      setIsTransitioning(true);
      
      // Brief transition period to allow layout to settle
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousOrientation(orientation);
      }, 300);

      // Update CSS classes for orientation
      document.documentElement.classList.remove('orientation-portrait', 'orientation-landscape');
      document.documentElement.classList.add(`orientation-${orientation}`);

      return () => clearTimeout(timeout);
    }
  }, [orientation, previousOrientation, isMobile]);

  return (
    <>
      {children}
      
      {/* Orientation transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-gray-900/90 border border-gray-700 rounded-xl p-4 text-white text-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin text-lg">🔄</div>
                <span>Ekran döndürülüyor...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Performance monitor component
function PerformanceMonitor({ children }: { children: ReactNode }) {
  const { performance, actions, config } = useMobile();
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);

  useEffect(() => {
    // Monitor frame rate
    if (performance.frameRate < 30) {
      setPerformanceWarning('Düşük performans tespit edildi. Ayarları optimize etmek ister misiniz?');
    } else {
      setPerformanceWarning(null);
    }

    // Auto-optimize for low-end devices
    if (performance.isLowEndDevice && !config.preferences.reducedMotion) {
      actions.updateConfig({
        preferences: {
          ...config.preferences,
          reducedMotion: true,
          fontSize: 'small',
        },
      });
    }
  }, [performance, actions, config]);

  return (
    <>
      {children}
      
      {/* Performance warning */}
      <AnimatePresence>
        {performanceWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-40 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-xl p-3 text-sm"
          >
            <div className="flex items-start space-x-2">
              <span className="text-lg">⚡</span>
              <div className="flex-1">
                <p>{performanceWarning}</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => {
                      actions.updateConfig({
                        preferences: {
                          ...config.preferences,
                          reducedMotion: true,
                          fontSize: 'small',
                        },
                      });
                      setPerformanceWarning(null);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                  >
                    Optimize Et
                  </button>
                  <button
                    onClick={() => setPerformanceWarning(null)}
                    className="text-yellow-300 hover:text-yellow-100 text-xs px-3 py-1 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Virtual keyboard handler
function VirtualKeyboardHandler({ children }: { children: ReactNode }) {
  const { touchState, actions, isMobile } = useMobile();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isMobile) return;

    let initialViewportHeight = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      if (heightDifference > 150) {
        // Virtual keyboard is likely open
        setKeyboardHeight(heightDifference);
        actions.updateTouchState({ isVirtualKeyboardOpen: true });
        
        // Set CSS custom property for keyboard height
        mobileUtilities.css.setCustomProperty('--keyboard-height', `${heightDifference}px`);
        document.documentElement.classList.add('virtual-keyboard-open');
      } else {
        // Virtual keyboard is likely closed
        setKeyboardHeight(0);
        actions.updateTouchState({ isVirtualKeyboardOpen: false });
        
        mobileUtilities.css.setCustomProperty('--keyboard-height', '0px');
        document.documentElement.classList.remove('virtual-keyboard-open');
      }
    };

    const handleFocus = () => {
      // Reset initial height when input is focused
      initialViewportHeight = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocus);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [isMobile, actions]);

  return (
    <div className={`virtual-keyboard-container ${touchState.isVirtualKeyboardOpen ? 'keyboard-open' : ''}`}>
      {children}
    </div>
  );
}

// Touch feedback handler
function TouchFeedbackHandler({ children }: { children: ReactNode }) {
  const { config, actions, capabilities } = useMobile();

  useEffect(() => {
    if (!capabilities.hasTouch) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (config.preferences.hapticEnabled && capabilities.hasHapticFeedback) {
        // Light haptic feedback for touch start
        actions.enableHapticFeedback(5);
      }

      // Update touch state
      const touch = event.touches[0];
      if (touch) {
        actions.updateTouchState({
          activeTouch: {
            id: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
          },
          gestureType: 'tap',
        });
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        actions.updateTouchState({
          activeTouch: {
            id: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
          },
          gestureType: 'swipe',
        });
      }
    };

    const handleTouchEnd = () => {
      actions.updateTouchState({
        activeTouch: null,
        gestureType: 'none',
      });
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [config.preferences.hapticEnabled, capabilities, actions]);

  return <>{children}</>;
}

// Main mobile layout wrapper - Simplified version
export function MobileLayoutWrapper({
  children,
  className = '',
  enableConfigManager = false, // Disabled - removed settings button
  enableErrorHandler = true,   // Re-enabled
  enablePerformanceMonitoring = true,
  enableOrientationHandling = true,
  enableSafeAreaHandling = true,
}: MobileLayoutWrapperProps) {
  const { isMobile, deviceCategory, orientation, config } = useMobile();

  // Apply mobile-specific CSS classes
  useEffect(() => {
    const classes = [
      `device-${deviceCategory}`,
      `orientation-${orientation}`,
      isMobile ? 'mobile-device' : 'desktop-device',
      config.preferences.reducedMotion ? 'reduced-motion' : '',
      config.preferences.highContrast ? 'high-contrast' : '',
    ].filter(Boolean);

    document.documentElement.classList.add(...classes);

    return () => {
      document.documentElement.classList.remove(...classes);
    };
  }, [deviceCategory, orientation, isMobile, config.preferences]);

  // Set CSS custom properties for mobile configuration
  useEffect(() => {
    mobileUtilities.css.setCustomProperties({
      '--mobile-font-size': config.preferences.fontSize === 'small' ? '0.875rem' : 
                           config.preferences.fontSize === 'large' ? '1.125rem' : '1rem',
      '--mobile-spacing': isMobile ? '0.5rem' : '1rem',
      '--touch-target-size': `${mobileUtilities.utils.getTouchTargetSize()}px`,
      '--device-category': deviceCategory,
      '--orientation': orientation,
    });
  }, [config, isMobile, deviceCategory, orientation]);

  return (
    <div className={`mobile-layout-wrapper ${className}`}>
      {children}
      {enableErrorHandler && <MobileErrorHandler />}
      {enableConfigManager && <MobileConfigManager />}
    </div>
  );
}

export default MobileLayoutWrapper;