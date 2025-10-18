import { useState, useEffect, useCallback } from 'react';
import { useMobile } from '../contexts/MobileContext';

// Offline mode state interface
export interface OfflineState {
  isOnline: boolean;
  isOfflineMode: boolean;
  lastOnlineTime: number | null;
  offlineDuration: number;
  networkType: string | null;
  connectionQuality: 'good' | 'poor' | 'offline';
}

// Network information interface (if available)
interface NetworkInformation extends EventTarget {
  downlink?: number;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  rtt?: number;
  saveData?: boolean;
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
}

// Offline mode hook
export function useOfflineMode() {
  const { actions } = useMobile();
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOfflineMode: false,
    lastOnlineTime: navigator.onLine ? Date.now() : null,
    offlineDuration: 0,
    networkType: null,
    connectionQuality: navigator.onLine ? 'good' : 'offline',
  });

  // Get network information if available
  const getNetworkInfo = useCallback((): NetworkInformation | null => {
    return (navigator as any).connection || 
           (navigator as any).mozConnection || 
           (navigator as any).webkitConnection || 
           null;
  }, []);

  // Determine connection quality based on network info
  const getConnectionQuality = useCallback((networkInfo: NetworkInformation | null): 'good' | 'poor' | 'offline' => {
    if (!navigator.onLine) return 'offline';
    
    if (!networkInfo) return 'good'; // Assume good if no info available
    
    // Check effective type
    if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
      return 'poor';
    }
    
    // Check downlink speed (Mbps)
    if (networkInfo.downlink && networkInfo.downlink < 1) {
      return 'poor';
    }
    
    // Check RTT (round trip time in ms)
    if (networkInfo.rtt && networkInfo.rtt > 1000) {
      return 'poor';
    }
    
    return 'good';
  }, []);

  // Update offline state
  const updateOfflineState = useCallback(() => {
    const networkInfo = getNetworkInfo();
    const isOnline = navigator.onLine;
    const connectionQuality = getConnectionQuality(networkInfo);
    
    setOfflineState(prev => {
      const now = Date.now();
      const lastOnlineTime = isOnline ? now : prev.lastOnlineTime;
      const offlineDuration = isOnline ? 0 : (prev.lastOnlineTime ? now - prev.lastOnlineTime : 0);
      
      return {
        isOnline,
        isOfflineMode: !isOnline || connectionQuality === 'poor',
        lastOnlineTime,
        offlineDuration,
        networkType: networkInfo?.type || null,
        connectionQuality,
      };
    });
  }, [getNetworkInfo, getConnectionQuality]);

  // Handle online event
  const handleOnline = useCallback(() => {
    updateOfflineState();
    
    // Clear network error when back online
    actions.clearError('networkError');
    
    // Show success message
    console.log('Connection restored');
  }, [updateOfflineState, actions]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    updateOfflineState();
    
    // Set network error
    // This will be handled by the MobileErrorHandler component
    console.log('Connection lost');
  }, [updateOfflineState]);

  // Handle network change
  const handleNetworkChange = useCallback(() => {
    updateOfflineState();
    
    const networkInfo = getNetworkInfo();
    const connectionQuality = getConnectionQuality(networkInfo);
    
    if (connectionQuality === 'poor') {
      console.log('Poor network connection detected');
    }
  }, [updateOfflineState, getNetworkInfo, getConnectionQuality]);

  // Enable offline mode manually
  const enableOfflineMode = useCallback(() => {
    setOfflineState(prev => ({
      ...prev,
      isOfflineMode: true,
    }));
  }, []);

  // Disable offline mode manually
  const disableOfflineMode = useCallback(() => {
    if (navigator.onLine) {
      setOfflineState(prev => ({
        ...prev,
        isOfflineMode: false,
      }));
    }
  }, []);

  // Check if feature is available offline
  const isFeatureAvailableOffline = useCallback((feature: string): boolean => {
    const offlineFeatures = [
      'singleplayer',
      'settings',
      'help',
      'about',
      'keyboard',
      'local-storage',
    ];
    
    return offlineFeatures.includes(feature);
  }, []);

  // Get offline fallback data
  const getOfflineFallback = useCallback((key: string): any => {
    try {
      const data = localStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get offline fallback:', error);
      return null;
    }
  }, []);

  // Save data for offline use
  const saveForOfflineUse = useCallback((key: string, data: any): void => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }, []);

  // Clear offline data
  const clearOfflineData = useCallback((key?: string): void => {
    try {
      if (key) {
        localStorage.removeItem(`offline_${key}`);
      } else {
        // Clear all offline data
        const keys = Object.keys(localStorage).filter(k => k.startsWith('offline_'));
        keys.forEach(k => localStorage.removeItem(k));
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Initial state update
    updateOfflineState();

    // Online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network change events
    const networkInfo = getNetworkInfo();
    if (networkInfo) {
      networkInfo.addEventListener('change', handleNetworkChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (networkInfo) {
        networkInfo.removeEventListener('change', handleNetworkChange);
      }
    };
  }, [updateOfflineState, handleOnline, handleOffline, handleNetworkChange, getNetworkInfo]);

  // Periodic connection quality check
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) {
        updateOfflineState();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [updateOfflineState]);

  return {
    ...offlineState,
    enableOfflineMode,
    disableOfflineMode,
    isFeatureAvailableOffline,
    getOfflineFallback,
    saveForOfflineUse,
    clearOfflineData,
    networkInfo: getNetworkInfo(),
  };
}

// Hook for offline-aware data fetching
export function useOfflineAwareFetch() {
  const { isOnline, isOfflineMode, getOfflineFallback, saveForOfflineUse } = useOfflineMode();

  const fetchWithOfflineFallback = useCallback(async (
    url: string,
    options?: RequestInit,
    cacheKey?: string
  ): Promise<any> => {
    // If offline, return cached data
    if (!isOnline || isOfflineMode) {
      if (cacheKey) {
        const cachedData = getOfflineFallback(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      throw new Error('No offline data available');
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache successful responses for offline use
      if (cacheKey) {
        saveForOfflineUse(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      // If fetch fails and we have cached data, return it
      if (cacheKey) {
        const cachedData = getOfflineFallback(cacheKey);
        if (cachedData) {
          console.warn('Using cached data due to fetch error:', error);
          return cachedData;
        }
      }
      
      throw error;
    }
  }, [isOnline, isOfflineMode, getOfflineFallback, saveForOfflineUse]);

  return {
    fetchWithOfflineFallback,
    isOnline,
    isOfflineMode,
  };
}

export default useOfflineMode;