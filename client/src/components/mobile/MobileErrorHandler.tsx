import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobile } from '../../contexts/MobileContext';
import { mobileUtilities } from '../../lib/mobile-utils';
import { mobileFallbacks } from '../../utils/mobileFallbacks';
import { useOfflineMode } from '../../hooks/useOfflineMode';

// Error types for mobile-specific errors
export interface MobileError {
  id: string;
  type: 'orientation' | 'touch' | 'performance' | 'network' | 'offline' | 'fullscreen';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  autoHide?: boolean;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

// Error display component
interface ErrorDisplayProps {
  error: MobileError;
  onDismiss: (id: string) => void;
  isMobile: boolean;
}

function ErrorDisplay({ error, onDismiss, isMobile }: ErrorDisplayProps) {
  const getErrorIcon = (type: MobileError['type']) => {
    switch (type) {
      case 'orientation': return '🔄';
      case 'touch': return '👆';
      case 'performance': return '⚡';
      case 'network': return '📶';
      case 'offline': return '📴';
      case 'fullscreen': return '📱';
      default: return '⚠️';
    }
  };

  const getErrorColor = (severity: MobileError['severity']) => {
    switch (severity) {
      case 'low': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'medium': return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
      case 'high': return 'bg-red-500/20 border-red-500/30 text-red-300';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 100 : 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isMobile ? 100 : 50, scale: 0.95 }}
      className={`
        ${getErrorColor(error.severity)}
        border rounded-xl backdrop-blur-sm
        ${isMobile ? 'p-3 text-sm' : 'p-4'}
        shadow-lg
      `}
    >
      <div className="flex items-start space-x-3">
        <span className="text-xl flex-shrink-0 mt-0.5">
          {getErrorIcon(error.type)}
        </span>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium break-words">
            {error.message}
          </p>
          
          {error.action && (
            <button
              onClick={error.action.handler}
              className={`
                mt-2 px-3 py-1 rounded-lg text-xs font-medium
                bg-white/10 hover:bg-white/20 transition-colors
                ${isMobile ? 'w-full' : 'inline-block'}
              `}
            >
              {error.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onDismiss(error.id)}
          className="flex-shrink-0 text-lg leading-none opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Hatayı kapat"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

// Main error handler component
export function MobileErrorHandler() {
  const { isMobile, errors, actions, config } = useMobile();
  const offlineMode = useOfflineMode();
  const [activeErrors, setActiveErrors] = useState<MobileError[]>([]);
  const [fallbackManager] = useState(() => new mobileFallbacks.manager());

  // Generate unique error ID
  const generateErrorId = useCallback(() => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add error to active errors
  const addError = useCallback((error: Omit<MobileError, 'id' | 'timestamp'>) => {
    const newError: MobileError = {
      ...error,
      id: generateErrorId(),
      timestamp: Date.now(),
    };

    setActiveErrors(prev => {
      // Remove duplicate errors of the same type
      const filtered = prev.filter(e => e.type !== error.type);
      return [...filtered, newError];
    });

    // Auto-hide error if specified
    if (error.autoHide !== false) {
      const duration = error.duration || (isMobile ? 4000 : 3000);
      setTimeout(() => {
        dismissError(newError.id);
      }, duration);
    }

    // Provide haptic feedback for high severity errors
    if (error.severity === 'high') {
      actions.enableHapticFeedback([50, 100, 50]);
    } else if (error.severity === 'medium') {
      actions.enableHapticFeedback(20);
    }
  }, [generateErrorId, isMobile, actions]);

  // Dismiss error
  const dismissError = useCallback((id: string) => {
    setActiveErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setActiveErrors([]);
  }, []);

  // Handle orientation errors with fallback
  useEffect(() => {
    if (errors.orientationError) {
      addError({
        type: 'orientation',
        message: errors.orientationError,
        severity: 'medium',
        action: {
          label: 'Fallback Kullan',
          handler: () => {
            actions.clearError('orientationError');
            // Activate orientation fallback
            fallbackManager.activate('orientation', () => {
              mobileFallbacks.orientation.simulateOrientationLock('portrait');
            });
          },
        },
      });
    }
  }, [errors.orientationError, addError, actions, fallbackManager]);

  // Handle touch errors
  useEffect(() => {
    if (errors.touchError) {
      addError({
        type: 'touch',
        message: errors.touchError,
        severity: 'low',
        action: {
          label: 'Tamam',
          handler: () => actions.clearError('touchError'),
        },
      });
    }
  }, [errors.touchError, addError, actions]);

  // Handle performance errors
  useEffect(() => {
    if (errors.performanceError) {
      addError({
        type: 'performance',
        message: errors.performanceError,
        severity: 'medium',
        action: {
          label: 'Optimizasyon Aç',
          handler: () => {
            actions.clearError('performanceError');
            // Enable performance optimizations
            actions.updateConfig({
              preferences: {
                ...config.preferences,
                reducedMotion: true,
                fontSize: 'small',
              },
            });
          },
        },
      });
    }
  }, [errors.performanceError, addError, actions]);

  // Handle network errors
  useEffect(() => {
    if (errors.networkError) {
      addError({
        type: 'network',
        message: errors.networkError,
        severity: 'high',
        autoHide: false,
        action: {
          label: 'Yeniden Dene',
          handler: () => {
            actions.clearError('networkError');
            window.location.reload();
          },
        },
      });
    }
  }, [errors.networkError, addError, actions]);

  // Monitor offline mode with enhanced detection
  useEffect(() => {
    if (!offlineMode.isOnline) {
      addError({
        type: 'offline',
        message: `İnternet bağlantısı kesildi${offlineMode.offlineDuration > 0 ? ` (${Math.round(offlineMode.offlineDuration / 1000)}s)` : ''}. Çevrimdışı mod etkin.`,
        severity: 'high',
        autoHide: false,
        action: {
          label: 'Çevrimdışı Mod',
          handler: () => {
            // Activate offline fallbacks
            fallbackManager.activate('offline', () => {
              return mobileFallbacks.network.activateOfflineMode();
            });
            setActiveErrors(prev => prev.filter(error => error.type !== 'offline'));
          },
        },
      });
    } else {
      // Clear offline errors when back online
      setActiveErrors(prev => prev.filter(error => error.type !== 'offline'));
      fallbackManager.deactivate('offline');
    }
  }, [offlineMode.isOnline, offlineMode.offlineDuration, addError, fallbackManager]);

  // Handle poor connection
  useEffect(() => {
    if (offlineMode.connectionQuality === 'poor' && offlineMode.isOnline) {
      addError({
        type: 'network',
        message: 'Bağlantı kalitesi düşük. Performans etkilenebilir.',
        severity: 'medium',
        action: {
          label: 'Optimize Et',
          handler: () => {
            fallbackManager.activate('poor-connection', () => {
              return mobileFallbacks.network.handlePoorConnection();
            });
            setActiveErrors(prev => prev.filter(error => error.type === 'network' && error.message.includes('düşük')));
          },
        },
      });
    }
  }, [offlineMode.connectionQuality, offlineMode.isOnline, addError, fallbackManager]);

  // Monitor virtual keyboard changes
  useEffect(() => {
    if (!isMobile) return;

    let lastHeight = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = lastHeight - currentHeight;
      
      // Detect virtual keyboard opening/closing
      if (heightDifference > 150) {
        actions.updateTouchState({ isVirtualKeyboardOpen: true });
      } else if (heightDifference < -150) {
        actions.updateTouchState({ isVirtualKeyboardOpen: false });
      }
      
      lastHeight = currentHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, actions]);

  // Monitor device memory pressure (if available)
  useEffect(() => {
    if ('memory' in performance && (performance as any).memory) {
      const checkMemoryPressure = () => {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize;
        const totalMemory = memory.totalJSHeapSize;
        const memoryUsage = usedMemory / totalMemory;

        if (memoryUsage > 0.9) {
          addError({
            type: 'performance',
            message: 'Cihaz belleği dolmak üzere. Performans etkilenebilir.',
            severity: 'medium',
            action: {
              label: 'Optimizasyon Aç',
              handler: () => {
                actions.updateConfig({
                  preferences: {
                    ...config.preferences,
                    reducedMotion: true,
                    fontSize: 'small',
                  },
                });
              },
            },
          });
        }
      };

      const interval = setInterval(checkMemoryPressure, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [addError, actions]);

  // Provide fallback mechanisms for common mobile issues
  const provideFallbackMechanisms = useCallback(() => {
    // Fallback for orientation lock issues
    if (errors.orientationError && isMobile) {
      // Add CSS-based orientation handling
      mobileUtilities.css.setCustomProperty('--orientation-fallback', 'true');
    }

    // Fallback for touch issues
    if (errors.touchError) {
      // Enable alternative input methods
      actions.updateTouchState({ inputMode: 'keyboard' });
    }

    // Fallback for performance issues
    if (errors.performanceError) {
      // Reduce animations and effects
      mobileUtilities.css.setCustomProperty('--reduced-motion', 'true');
    }
  }, [errors, isMobile, actions]);

  useEffect(() => {
    provideFallbackMechanisms();
  }, [provideFallbackMechanisms]);

  return (
    <div className={`fixed z-50 pointer-events-none ${
      isMobile 
        ? 'inset-x-2 bottom-2 top-auto' 
        : 'bottom-4 right-4 max-w-md'
    }`}>
      <div className="space-y-2 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {activeErrors.map((error) => (
            <ErrorDisplay
              key={error.id}
              error={error}
              onDismiss={dismissError}
              isMobile={isMobile}
            />
          ))}
        </AnimatePresence>
        
        {/* Clear all button when multiple errors */}
        {activeErrors.length > 1 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={clearAllErrors}
            className={`
              w-full bg-gray-500/20 border border-gray-500/30 text-gray-300
              rounded-lg backdrop-blur-sm hover:bg-gray-500/30 transition-colors
              ${isMobile ? 'p-2 text-sm' : 'p-3'}
            `}
          >
            Tüm Hataları Temizle ({activeErrors.length})
          </motion.button>
        )}
      </div>
    </div>
  );
}

// Hook for adding custom mobile errors
export function useMobileError() {
  const [errors, setErrors] = useState<MobileError[]>([]);

  const addError = useCallback((error: Omit<MobileError, 'id' | 'timestamp'>) => {
    const newError: MobileError = {
      ...error,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setErrors(prev => [...prev, newError]);
    return newError.id;
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearAllErrors,
  };
}

export default MobileErrorHandler;