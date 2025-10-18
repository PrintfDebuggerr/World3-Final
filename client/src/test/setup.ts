import '@testing-library/jest-dom';

// Mock navigator.vibrate for haptic feedback tests
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn(),
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock touch events
global.TouchEvent = class TouchEvent extends Event {
  touches: Touch[];
  changedTouches: Touch[];
  targetTouches: Touch[];

  constructor(type: string, eventInitDict?: TouchEventInit) {
    super(type, eventInitDict);
    this.touches = eventInitDict?.touches ? Array.from(eventInitDict.touches) : [];
    this.changedTouches = eventInitDict?.changedTouches ? Array.from(eventInitDict.changedTouches) : [];
    this.targetTouches = eventInitDict?.targetTouches ? Array.from(eventInitDict.targetTouches) : [];
  }
};

// Mock Touch interface
global.Touch = class Touch {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;

  constructor(touchInit: TouchInit) {
    this.identifier = touchInit.identifier;
    this.target = touchInit.target;
    this.clientX = touchInit.clientX || 0;
    this.clientY = touchInit.clientY || 0;
    this.pageX = touchInit.pageX || this.clientX;
    this.pageY = touchInit.pageY || this.clientY;
    this.screenX = touchInit.screenX || this.clientX;
    this.screenY = touchInit.screenY || this.clientY;
    this.radiusX = touchInit.radiusX || 0;
    this.radiusY = touchInit.radiusY || 0;
    this.rotationAngle = touchInit.rotationAngle || 0;
    this.force = touchInit.force || 1;
  }
};