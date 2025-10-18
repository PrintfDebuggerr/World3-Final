import { useMemo, useCallback } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';

interface AnimationConfig {
  enableHardwareAcceleration: boolean;
  reduceMotion: boolean;
  throttleAnimations: boolean;
  animationDuration: number;
  easing: string;
}

export function useOptimizedAnimations() {
  const { metrics, isPerformanceGood } = usePerformanceMonitor();

  // Detect if user prefers reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Create optimized animation config based on performance
  const animationConfig = useMemo((): AnimationConfig => {
    const isLowPerformance = !isPerformanceGood || metrics.fps < 30;
    
    return {
      enableHardwareAcceleration: true,
      reduceMotion: prefersReducedMotion || isLowPerformance,
      throttleAnimations: isLowPerformance,
      animationDuration: isLowPerformance ? 0.2 : 0.6,
      easing: isLowPerformance ? 'linear' : 'easeInOut',
    };
  }, [isPerformanceGood, metrics.fps, prefersReducedMotion]);

  // Hardware-accelerated transform styles
  const getHardwareAcceleratedStyle = useCallback((transform?: string) => {
    if (!animationConfig.enableHardwareAcceleration) return {};
    
    return {
      transform: transform || 'translateZ(0)',
      willChange: 'transform',
      backfaceVisibility: 'hidden' as const,
      perspective: 1000,
    };
  }, [animationConfig.enableHardwareAcceleration]);

  // Optimized motion variants for framer-motion
  const getOptimizedVariants = useCallback((baseVariants: any) => {
    if (animationConfig.reduceMotion) {
      // Return instant variants for reduced motion
      return Object.keys(baseVariants).reduce((acc, key) => {
        acc[key] = {
          ...baseVariants[key],
          transition: { duration: 0 },
        };
        return acc;
      }, {} as any);
    }

    // Apply performance-based optimizations
    return Object.keys(baseVariants).reduce((acc, key) => {
      const variant = baseVariants[key];
      acc[key] = {
        ...variant,
        transition: {
          ...variant.transition,
          duration: animationConfig.animationDuration,
          ease: animationConfig.easing,
          // Use hardware acceleration
          type: 'tween',
        },
      };
      return acc;
    }, {} as any);
  }, [animationConfig]);

  // Throttled animation callback
  const createThrottledAnimation = useCallback((callback: () => void, delay: number = 16) => {
    if (!animationConfig.throttleAnimations) {
      return callback;
    }

    let lastCall = 0;
    return () => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback();
      }
    };
  }, [animationConfig.throttleAnimations]);

  // Optimized transition props for framer-motion
  const getOptimizedTransition = useCallback((baseTransition: any = {}) => {
    return {
      ...baseTransition,
      duration: animationConfig.reduceMotion ? 0 : (baseTransition.duration || animationConfig.animationDuration),
      ease: animationConfig.easing,
      type: 'tween',
    };
  }, [animationConfig]);

  return {
    config: animationConfig,
    getHardwareAcceleratedStyle,
    getOptimizedVariants,
    getOptimizedTransition,
    createThrottledAnimation,
    shouldAnimate: !animationConfig.reduceMotion,
  };
}