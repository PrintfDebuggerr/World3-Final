/**
 * Mobile optimization utilities - Main export file
 * Centralized exports for all mobile-related functionality
 */

// Core configuration and utilities
export * from '../mobile-config';
export * from '../mobile-utils';

// Re-export commonly used items for convenience
export { MOBILE_CONFIG, mobileUtils, MEDIA_QUERIES } from '../mobile-config';
export { mobileUtilities } from '../mobile-utils';

// Type exports
export type {
  DeviceCategory,
  Orientation,
  SpacingSize,
} from '../mobile-config';