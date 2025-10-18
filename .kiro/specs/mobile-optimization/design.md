# Design Document

## Overview

Bu tasarım dokümanı, mevcut Wordle Duo oyununu mobil cihazlarda optimize edilmiş bir deneyim sunacak şekilde geliştirmeyi amaçlamaktadır. Tasarım, responsive layout, dokunmatik kontroller, performans optimizasyonları ve mobil-specific UX iyileştirmelerini kapsamaktadır.

Mevcut oyun zaten temel responsive özellikler içermektedir ancak mobil deneyim için daha spesifik optimizasyonlara ihtiyaç vardır. Bu tasarım, özellikle küçük ekranlarda kullanılabilirliği artıracak ve dokunmatik etkileşimleri geliştirecektir.

## Architecture

### Component Hierarchy

```
GameBoard (Ana Container)
├── Header (Responsive Navigation)
├── Game Content
│   ├── SequentialMode (Mobil Optimized)
│   │   ├── TurnIndicator (Compact Mobile View)
│   │   ├── ScrollableGameGrid (Touch-friendly)
│   │   └── InteractiveLetterGrid (Touch Input)
│   ├── DuelMode (Dual Layout Optimization)
│   │   ├── PlayerGrids (Responsive Layout)
│   │   ├── ProgressIndicators (Mobile-friendly)
│   │   └── InteractiveLetterGrid (Touch Input)
│   └── TurkishKeyboard (Adaptive Sizing)
└── MobileOptimizations (New Layer)
    ├── TouchHandler (Gesture Management)
    ├── VirtualKeyboard (Enhanced Mobile Input)
    ├── ResponsiveLayout (Breakpoint Management)
    └── PerformanceOptimizer (Mobile Performance)
```

### Mobile-First Design Principles

1. **Progressive Enhancement**: Mobil deneyim öncelikli, desktop'a genişletilmiş
2. **Touch-First Interactions**: Dokunmatik kontroller birincil input method
3. **Responsive Breakpoints**: 
   - Mobile: < 768px
   - Tablet: 768px - 1024px  
   - Desktop: > 1024px
4. **Performance Optimization**: Mobil cihazlar için optimize edilmiş rendering

## Components and Interfaces

### 1. Enhanced Mobile Layout System

#### ResponsiveGameBoard Component
```typescript
interface ResponsiveGameBoardProps {
  gameMode: 'sequential' | 'duel';
  orientation: 'portrait' | 'landscape';
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

interface MobileLayoutConfig {
  headerHeight: number;
  keyboardHeight: number;
  gameAreaHeight: number;
  spacing: {
    mobile: number;
    tablet: number;
  };
}
```

#### Adaptive Sizing System
- **Letter Cells**: 
  - Mobile Portrait: 40px x 40px (minimum touch target)
  - Mobile Landscape: 36px x 36px
  - Tablet: 48px x 48px
- **Keyboard Keys**:
  - Mobile: 44px minimum (Apple HIG compliance)
  - Spacing: 4px between keys
  - Special keys (Enter, Backspace): 1.5x width

### 2. Enhanced Touch Input System

#### TouchOptimizedKeyboard Component
```typescript
interface TouchKeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardStatus: Record<string, LetterStatus>;
  disabled?: boolean;
  hapticFeedback?: boolean;
  adaptiveSize?: boolean;
}

interface TouchFeedbackConfig {
  haptic: boolean;
  visual: boolean;
  audio: boolean;
  duration: number;
}
```

#### Interactive Letter Grid Enhancement
```typescript
interface InteractiveLetterGridProps extends LetterGridProps {
  touchEnabled: boolean;
  virtualKeyboard: boolean;
  autoFocus: boolean;
  onTouchInput: (index: number, letter: string) => void;
}
```

### 3. Mobile-Optimized Game Modes

#### Sequential Mode Mobile Layout
- **Compact Turn Indicator**: Horizontal scroll for multiple players
- **Scrollable Game History**: Infinite scroll with smooth animations
- **Sticky Current Input**: Always visible current turn row
- **Touch-to-Type**: Direct letter cell interaction

#### Duel Mode Mobile Layout
- **Portrait Mode**: Vertical stack layout
  - My grid on top
  - Opponent grid below
  - Progress indicators at bottom
- **Landscape Mode**: Side-by-side layout
  - Compressed vertical space
  - Smaller font sizes
  - Optimized spacing

### 4. Virtual Keyboard System

#### Enhanced Mobile Input
```typescript
interface VirtualKeyboardConfig {
  layout: 'turkish' | 'qwerty';
  size: 'compact' | 'normal' | 'large';
  hapticFeedback: boolean;
  predictiveText: boolean;
  autoCorrect: boolean;
}
```

#### Smart Input Detection
- Native keyboard detection
- Virtual keyboard fallback
- Hybrid input mode (native + virtual)
- Context-aware keyboard switching

## Data Models

### Mobile Configuration State
```typescript
interface MobileConfig {
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
  };
  preferences: {
    keyboardType: 'native' | 'virtual' | 'hybrid';
    hapticEnabled: boolean;
    autoRotate: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}
```

### Touch Interaction State
```typescript
interface TouchState {
  activeTouch: {
    id: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null;
  gestureType: 'tap' | 'swipe' | 'pinch' | 'none';
  inputMode: 'keyboard' | 'touch' | 'hybrid';
}
```

### Performance Metrics
```typescript
interface MobilePerformance {
  frameRate: number;
  memoryUsage: number;
  batteryImpact: 'low' | 'medium' | 'high';
  networkUsage: number;
  renderTime: number;
}
```

## Error Handling

### Mobile-Specific Error Scenarios

1. **Orientation Change Errors**
   - Layout recalculation failures
   - Animation interruptions
   - State preservation issues

2. **Touch Input Errors**
   - Accidental touches
   - Multi-touch conflicts
   - Gesture recognition failures

3. **Virtual Keyboard Issues**
   - Keyboard height detection
   - Input focus problems
   - Character encoding issues

4. **Performance Degradation**
   - Memory leaks on mobile
   - Battery drain optimization
   - Network timeout handling

### Error Recovery Strategies

```typescript
interface MobileErrorHandler {
  handleOrientationError: () => void;
  handleTouchError: (error: TouchError) => void;
  handlePerformanceError: (metrics: MobilePerformance) => void;
  handleNetworkError: (error: NetworkError) => void;
}
```

## Testing Strategy

### Mobile Testing Approach

#### 1. Device Testing Matrix
- **iOS Devices**: iPhone SE, iPhone 12/13/14, iPad
- **Android Devices**: Various screen sizes (5" - 7")
- **Browsers**: Safari Mobile, Chrome Mobile, Samsung Internet

#### 2. Responsive Testing
- **Breakpoint Testing**: All major breakpoints
- **Orientation Testing**: Portrait/Landscape transitions
- **Zoom Testing**: 100% - 200% zoom levels

#### 3. Touch Interaction Testing
- **Touch Accuracy**: Minimum 44px touch targets
- **Gesture Recognition**: Tap, swipe, pinch gestures
- **Multi-touch Handling**: Prevent accidental inputs

#### 4. Performance Testing
- **Load Time**: < 3 seconds on 3G
- **Frame Rate**: Maintain 60fps during animations
- **Memory Usage**: < 50MB on low-end devices
- **Battery Impact**: Minimal background processing

### Automated Testing Strategy

```typescript
// Mobile-specific test scenarios
describe('Mobile Optimization', () => {
  describe('Responsive Layout', () => {
    test('adapts to mobile breakpoints');
    test('handles orientation changes');
    test('maintains aspect ratios');
  });
  
  describe('Touch Interactions', () => {
    test('registers touch events correctly');
    test('provides haptic feedback');
    test('prevents accidental touches');
  });
  
  describe('Performance', () => {
    test('loads within 3 seconds');
    test('maintains 60fps animations');
    test('optimizes memory usage');
  });
});
```

### Manual Testing Checklist

#### Usability Testing
- [ ] All buttons are easily tappable (44px minimum)
- [ ] Text is readable without zooming
- [ ] Navigation is intuitive on touch
- [ ] Keyboard doesn't obstruct important content
- [ ] Orientation changes work smoothly

#### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Large text support
- [ ] Voice control compatibility
- [ ] Switch control support

#### Performance Testing
- [ ] Fast loading on slow networks
- [ ] Smooth animations on low-end devices
- [ ] Minimal battery drain
- [ ] Efficient memory usage
- [ ] Offline functionality

## Implementation Phases

### Phase 1: Core Mobile Layout (Week 1)
- Responsive breakpoint system
- Mobile-first CSS architecture
- Basic touch event handling
- Orientation change support

### Phase 2: Enhanced Touch Interactions (Week 2)
- Interactive letter grid
- Virtual keyboard improvements
- Haptic feedback integration
- Gesture recognition

### Phase 3: Game Mode Optimizations (Week 3)
- Sequential mode mobile layout
- Duel mode responsive design
- Performance optimizations
- Error handling improvements

### Phase 4: Polish and Testing (Week 4)
- Cross-device testing
- Performance tuning
- Accessibility improvements
- User feedback integration

## Technical Considerations

### CSS Architecture
- Mobile-first media queries
- Flexbox/Grid for responsive layouts
- CSS custom properties for theming
- Hardware acceleration for animations

### JavaScript Optimizations
- Event delegation for touch events
- Debounced resize handlers
- Lazy loading for non-critical components
- Service worker for offline support

### Performance Optimizations
- Image optimization for mobile
- Code splitting for faster loading
- Memory leak prevention
- Battery usage optimization

### Browser Compatibility
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+
- Firefox Mobile 90+