/**
 * Mobile-specific fallback mechanisms
 * Provides alternative solutions when mobile features fail
 */

import { mobileUtilities } from '../lib/mobile-utils';

// Fallback types
export interface FallbackOptions {
  enableLogging?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Orientation fallback
export const orientationFallback = {
  /**
   * CSS-based orientation detection when API fails
   */
  detectOrientation: (): 'portrait' | 'landscape' => {
    if (typeof window === 'undefined') return 'portrait';
    
    // Primary method: window dimensions
    const isPortrait = window.innerHeight > window.innerWidth;
    
    // Fallback method: media query
    if (window.matchMedia) {
      const portraitQuery = window.matchMedia('(orientation: portrait)');
      if (portraitQuery.matches !== undefined) {
        return portraitQuery.matches ? 'portrait' : 'landscape';
      }
    }
    
    return isPortrait ? 'portrait' : 'landscape';
  },

  /**
   * CSS-based orientation lock simulation
   */
  simulateOrientationLock: (orientation: 'portrait' | 'landscape') => {
    const root = document.documentElement;
    
    // Remove existing orientation classes
    root.classList.remove('force-portrait', 'force-landscape');
    
    // Add new orientation class
    root.classList.add(`force-${orientation}`);
    
    // Set CSS custom properties
    mobileUtilities.css.setCustomProperty('--forced-orientation', orientation);
    
    return true;
  },

  /**
   * Remove orientation lock simulation
   */
  removeOrientationLock: () => {
    const root = document.documentElement;
    root.classList.remove('force-portrait', 'force-landscape');
    mobileUtilities.css.setCustomProperty('--forced-orientation', 'none');
    return true;
  },
};

// Touch fallback mechanisms
export const touchFallback = {
  /**
   * Mouse event simulation for touch events
   */
  enableMouseFallback: (element: HTMLElement) => {
    let isMouseDown = false;
    
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{
          identifier: 0,
          target: e.target as Element,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          screenX: e.screenX,
          screenY: e.screenY,
          radiusX: 0,
          radiusY: 0,
          rotationAngle: 0,
          force: 1,
        }] as any,
        changedTouches: [] as any,
        targetTouches: [] as any,
        bubbles: true,
        cancelable: true,
      });
      
      element.dispatchEvent(touchEvent);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      
      const touchEvent = new TouchEvent('touchmove', {
        touches: [{
          identifier: 0,
          target: e.target as Element,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          screenX: e.screenX,
          screenY: e.screenY,
          radiusX: 0,
          radiusY: 0,
          rotationAngle: 0,
          force: 1,
        }] as any,
        changedTouches: [] as any,
        targetTouches: [] as any,
        bubbles: true,
        cancelable: true,
      });
      
      element.dispatchEvent(touchEvent);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      
      const touchEvent = new TouchEvent('touchend', {
        touches: [] as any,
        changedTouches: [{
          identifier: 0,
          target: e.target as Element,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          screenX: e.screenX,
          screenY: e.screenY,
          radiusX: 0,
          radiusY: 0,
          rotationAngle: 0,
          force: 1,
        }] as any,
        targetTouches: [] as any,
        bubbles: true,
        cancelable: true,
      });
      
      element.dispatchEvent(touchEvent);
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  },

  /**
   * Keyboard navigation fallback for touch interfaces
   */
  enableKeyboardFallback: (element: HTMLElement) => {
    element.setAttribute('tabindex', '0');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          element.click();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // Navigate to adjacent focusable elements
          const focusableElements = Array.from(
            document.querySelectorAll('[tabindex]:not([tabindex="-1"])')
          ) as HTMLElement[];
          
          const currentIndex = focusableElements.indexOf(element);
          let nextIndex = currentIndex;
          
          switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
              nextIndex = Math.max(0, currentIndex - 1);
              break;
            case 'ArrowDown':
            case 'ArrowRight':
              nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
              break;
          }
          
          if (nextIndex !== currentIndex) {
            e.preventDefault();
            focusableElements[nextIndex]?.focus();
          }
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeAttribute('tabindex');
    };
  },
};

// Virtual keyboard fallback
export const virtualKeyboardFallback = {
  /**
   * Force show virtual keyboard on iOS
   */
  forceShowKeyboard: (): boolean => {
    try {
      // Create a temporary input element
      const input = document.createElement('input');
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      input.style.opacity = '0';
      input.setAttribute('readonly', 'true');
      
      document.body.appendChild(input);
      
      // Focus the input to trigger keyboard
      input.focus();
      
      // Remove readonly to allow input
      setTimeout(() => {
        input.removeAttribute('readonly');
        input.focus();
      }, 100);
      
      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(input);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Failed to force show keyboard:', error);
      return false;
    }
  },

  /**
   * Alternative keyboard trigger methods
   */
  triggerKeyboardAlternatives: (): boolean => {
    // Method 1: Focus existing input
    const existingInput = document.querySelector('input, textarea') as HTMLInputElement;
    if (existingInput) {
      existingInput.focus();
      return true;
    }

    // Method 2: Create and focus temporary input
    return virtualKeyboardFallback.forceShowKeyboard();
  },

  /**
   * Detect if virtual keyboard should be shown
   */
  shouldShowVirtualKeyboard: (): boolean => {
    // Check if device has touch capability
    if (!mobileUtilities.touchDetection.hasTouch()) {
      return false;
    }

    // Check if device is mobile
    if (!mobileUtilities.utils.isMobile()) {
      return false;
    }

    // Check if there's an active input
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return false; // Native keyboard should handle this
    }

    return true;
  },
};

// Performance fallback mechanisms
export const performanceFallback = {
  /**
   * Reduce animations for low-end devices
   */
  enableLowEndOptimizations: () => {
    const root = document.documentElement;
    
    // Add low-end device class
    root.classList.add('low-end-device');
    
    // Set CSS custom properties for reduced performance
    mobileUtilities.css.setCustomProperties({
      '--animation-duration': '0.1s',
      '--transition-duration': '0.1s',
      '--blur-amount': '0px',
      '--shadow-intensity': '0',
    });
    
    // Disable complex animations
    const style = document.createElement('style');
    style.textContent = `
      .low-end-device * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      .low-end-device .animate-pulse,
      .low-end-device .animate-spin,
      .low-end-device .animate-bounce {
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      root.classList.remove('low-end-device');
      document.head.removeChild(style);
    };
  },

  /**
   * Memory pressure handling
   */
  handleMemoryPressure: () => {
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('temp') || name.includes('cache')) {
            caches.delete(name);
          }
        });
      });
    }

    // Clear unused DOM elements
    const unusedElements = document.querySelectorAll('[data-unused="true"]');
    unusedElements.forEach(el => el.remove());

    // Trigger garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  },
};

// Network fallback mechanisms
export const networkFallback = {
  /**
   * Offline mode activation
   */
  activateOfflineMode: () => {
    const root = document.documentElement;
    root.classList.add('offline-mode');
    
    // Set offline indicators
    mobileUtilities.css.setCustomProperty('--network-status', 'offline');
    
    // Show offline message
    const offlineMessage = document.createElement('div');
    offlineMessage.id = 'offline-indicator';
    offlineMessage.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50';
    offlineMessage.textContent = 'Çevrimdışı mod - Bazı özellikler kullanılamayabilir';
    
    document.body.appendChild(offlineMessage);
    
    return () => {
      root.classList.remove('offline-mode');
      const indicator = document.getElementById('offline-indicator');
      if (indicator) {
        document.body.removeChild(indicator);
      }
    };
  },

  /**
   * Poor connection handling
   */
  handlePoorConnection: () => {
    const root = document.documentElement;
    root.classList.add('poor-connection');
    
    // Reduce image quality
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && !img.src.includes('low-quality')) {
        img.setAttribute('data-original-src', img.src);
        // You would implement low-quality image serving here
      }
    });
    
    // Disable auto-refresh features
    mobileUtilities.css.setCustomProperty('--auto-refresh', 'disabled');
    
    return () => {
      root.classList.remove('poor-connection');
      // Restore original images
      images.forEach(img => {
        const originalSrc = img.getAttribute('data-original-src');
        if (originalSrc) {
          img.src = originalSrc;
          img.removeAttribute('data-original-src');
        }
      });
    };
  },
};

// Main fallback manager
export class MobileFallbackManager {
  private activeFallbacks: Map<string, () => void> = new Map();
  private options: FallbackOptions;

  constructor(options: FallbackOptions = {}) {
    this.options = {
      enableLogging: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...options,
    };
  }

  /**
   * Activate a fallback mechanism
   */
  activate(type: string, fallbackFn: () => (() => void) | void): boolean {
    try {
      if (this.options.enableLogging) {
        console.log(`Activating fallback: ${type}`);
      }

      const cleanup = fallbackFn();
      if (cleanup && typeof cleanup === 'function') {
        this.activeFallbacks.set(type, cleanup);
      }

      return true;
    } catch (error) {
      if (this.options.enableLogging) {
        console.error(`Failed to activate fallback ${type}:`, error);
      }
      return false;
    }
  }

  /**
   * Deactivate a fallback mechanism
   */
  deactivate(type: string): boolean {
    try {
      const cleanup = this.activeFallbacks.get(type);
      if (cleanup) {
        cleanup();
        this.activeFallbacks.delete(type);
        
        if (this.options.enableLogging) {
          console.log(`Deactivated fallback: ${type}`);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      if (this.options.enableLogging) {
        console.error(`Failed to deactivate fallback ${type}:`, error);
      }
      return false;
    }
  }

  /**
   * Deactivate all fallbacks
   */
  deactivateAll(): void {
    for (const [type] of this.activeFallbacks) {
      this.deactivate(type);
    }
  }

  /**
   * Check if a fallback is active
   */
  isActive(type: string): boolean {
    return this.activeFallbacks.has(type);
  }

  /**
   * Get list of active fallbacks
   */
  getActiveFallbacks(): string[] {
    return Array.from(this.activeFallbacks.keys());
  }
}

// Export fallback utilities
export const mobileFallbacks = {
  orientation: orientationFallback,
  touch: touchFallback,
  virtualKeyboard: virtualKeyboardFallback,
  performance: performanceFallback,
  network: networkFallback,
  manager: MobileFallbackManager,
};

export default mobileFallbacks;