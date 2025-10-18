import { useState, useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  loadTime: number;
  isLowEndDevice: boolean;
}

interface PerformanceConfig {
  enableFPSMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  enableRenderTimeMonitoring: boolean;
  fpsThreshold: number;
  memoryThreshold: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableFPSMonitoring: true,
  enableMemoryMonitoring: true,
  enableRenderTimeMonitoring: true,
  fpsThreshold: 30, // Below this FPS is considered poor performance
  memoryThreshold: 50 * 1024 * 1024, // 50MB threshold
};

export function usePerformanceMonitor(config: Partial<PerformanceConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    loadTime: 0,
    isLowEndDevice: false,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // Detect if device is low-end based on hardware concurrency and memory
  const detectLowEndDevice = useCallback(() => {
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    // Consider device low-end if it has <= 2 cores or <= 2GB RAM
    return hardwareConcurrency <= 2 || deviceMemory <= 2;
  }, []);

  // FPS Monitoring
  const measureFPS = useCallback(() => {
    if (!finalConfig.enableFPSMonitoring) return;

    const now = performance.now();
    frameCountRef.current++;

    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      
      setMetrics(prev => ({ ...prev, fps }));
      
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(measureFPS);
  }, [finalConfig.enableFPSMonitoring]);

  // Memory Usage Monitoring
  const measureMemoryUsage = useCallback(() => {
    if (!finalConfig.enableMemoryMonitoring) return;

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize;
      
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, [finalConfig.enableMemoryMonitoring]);

  // Render Time Monitoring
  const startRenderMeasurement = useCallback(() => {
    if (!finalConfig.enableRenderTimeMonitoring) return;
    renderStartTimeRef.current = performance.now();
  }, [finalConfig.enableRenderTimeMonitoring]);

  const endRenderMeasurement = useCallback(() => {
    if (!finalConfig.enableRenderTimeMonitoring || !renderStartTimeRef.current) return;
    
    const renderTime = performance.now() - renderStartTimeRef.current;
    setMetrics(prev => ({ ...prev, renderTime }));
    renderStartTimeRef.current = 0;
  }, [finalConfig.enableRenderTimeMonitoring]);

  // Load Time Measurement
  const measureLoadTime = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    }
  }, []);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    if (metrics.fps < finalConfig.fpsThreshold) {
      suggestions.push('Consider reducing animation complexity or frequency');
    }
    
    if (metrics.memoryUsage > finalConfig.memoryThreshold) {
      suggestions.push('Memory usage is high, consider cleanup of unused objects');
    }
    
    if (metrics.renderTime > 16) { // 16ms = 60fps
      suggestions.push('Render time is high, consider optimizing component re-renders');
    }
    
    if (metrics.loadTime > 3000) { // 3 seconds
      suggestions.push('Load time is high, consider code splitting or lazy loading');
    }
    
    return suggestions;
  }, [metrics, finalConfig]);

  // Initialize monitoring
  useEffect(() => {
    const isLowEndDevice = detectLowEndDevice();
    setMetrics(prev => ({ ...prev, isLowEndDevice }));

    // Start FPS monitoring
    if (finalConfig.enableFPSMonitoring) {
      measureFPS();
    }

    // Measure load time
    measureLoadTime();

    // Memory monitoring interval
    let memoryInterval: NodeJS.Timeout;
    if (finalConfig.enableMemoryMonitoring) {
      memoryInterval = setInterval(measureMemoryUsage, 5000); // Every 5 seconds
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (memoryInterval) {
        clearInterval(memoryInterval);
      }
    };
  }, [finalConfig, measureFPS, measureMemoryUsage, measureLoadTime, detectLowEndDevice]);

  return {
    metrics,
    startRenderMeasurement,
    endRenderMeasurement,
    getOptimizationSuggestions,
    isPerformanceGood: metrics.fps >= finalConfig.fpsThreshold && 
                      metrics.memoryUsage <= finalConfig.memoryThreshold &&
                      metrics.renderTime <= 16,
    // Additional properties expected by MobileContext
    isLowEndDevice: metrics.isLowEndDevice,
    shouldReduceAnimations: metrics.fps < finalConfig.fpsThreshold || metrics.isLowEndDevice,
    frameRate: metrics.fps,
    memoryPressure: metrics.memoryUsage > finalConfig.memoryThreshold ? 'high' : 
                   metrics.memoryUsage > finalConfig.memoryThreshold * 0.7 ? 'medium' : 'low',
    memoryUsage: metrics.memoryUsage,
    batteryImpact: metrics.isLowEndDevice ? 'high' : 
                  metrics.fps < finalConfig.fpsThreshold ? 'medium' : 'low',
    renderTime: metrics.renderTime,
  };
}