import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TurkishKeyboard } from '../TurkishKeyboard';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock mobile hooks and utilities
vi.mock('../../../hooks/use-is-mobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('../../../lib/mobile-config', () => ({
  mobileUtils: {
    getDeviceCategory: () => 'desktop',
    isPortrait: () => true,
    isTouchDevice: () => false,
    getSpacing: (size: string) => {
      const spacingMap: Record<string, number> = {
        'xs': 4, 'sm': 8, 'md': 12, 'lg': 16, 'xl': 24, '2xl': 32
      };
      return spacingMap[size] || 16;
    },
  },
  MOBILE_CONFIG: {
    touchTarget: {
      minimum: 44,
      comfortable: 48,
    },
  },
}));

vi.mock('../../../lib/mobile-utils', () => ({
  touch: {
    vibrate: vi.fn(),
  },
  viewport: {
    isVirtualKeyboardOpen: () => false,
  },
}));

describe('TurkishKeyboard', () => {
  const mockOnKeyPress = vi.fn();
  const mockKeyboardStatus = {};

  beforeEach(() => {
    mockOnKeyPress.mockClear();
  });

  it('renders all Turkish keyboard keys', () => {
    render(
      <TurkishKeyboard
        onKeyPress={mockOnKeyPress}
        keyboardStatus={mockKeyboardStatus}
      />
    );

    // Check for Turkish-specific letters
    expect(screen.getByLabelText('Ğ harfi')).toBeInTheDocument();
    expect(screen.getByLabelText('Ü harfi')).toBeInTheDocument();
    expect(screen.getByLabelText('Ş harfi')).toBeInTheDocument();
    expect(screen.getByLabelText('İ harfi')).toBeInTheDocument();
    expect(screen.getByLabelText('Ö harfi')).toBeInTheDocument();
    expect(screen.getByLabelText('Ç harfi')).toBeInTheDocument();
  });

  it('renders special keys (ENTER and BACKSPACE)', () => {
    render(
      <TurkishKeyboard
        onKeyPress={mockOnKeyPress}
        keyboardStatus={mockKeyboardStatus}
      />
    );

    expect(screen.getByLabelText('Enter tuşu')).toBeInTheDocument();
    expect(screen.getByLabelText('Geri silme tuşu')).toBeInTheDocument();
  });

  it('calls onKeyPress when a key is clicked', () => {
    render(
      <TurkishKeyboard
        onKeyPress={mockOnKeyPress}
        keyboardStatus={mockKeyboardStatus}
      />
    );

    const qKey = screen.getByLabelText('Q harfi');
    fireEvent.click(qKey);

    expect(mockOnKeyPress).toHaveBeenCalledWith('Q');
  });

  it('calls onKeyPress for special keys', () => {
    render(
      <TurkishKeyboard
        onKeyPress={mockOnKeyPress}
        keyboardStatus={mockKeyboardStatus}
      />
    );

    const enterKey = screen.getByLabelText('Enter tuşu');
    const backspaceKey = screen.getByLabelText('Geri silme tuşu');

    fireEvent.click(enterKey);
    expect(mockOnKeyPress).toHaveBeenCalledWith('ENTER');

    fireEvent.click(backspaceKey);
    expect(mockOnKeyPress).toHaveBeenCalledWith('BACKSPACE');
  });

  it('applies correct status classes to keys', () => {
    const keyboardStatus = {
      'Q': 'correct',
      'W': 'present',
      'E': 'absent',
    };

    render(
      <TurkishKeyboard
        onKeyPress={mockOnKeyPress}
        keyboardStatus={keyboardStatus}
      />
    );

    const qKey = screen.getByLabelText('Q harfi');
    const wKey = screen.getByLabelText('W harfi');
    const eKey = screen.getByLabelText('E harfi');

    expect(qKey).toHaveClass('correct');
    expect(wKey).toHaveClass('present');
    expect(eKey).toHaveClass('absent');
  });

  it('disables keyboard when disabled prop is true', () => {
    render(
      <TurkishKeyboard
        onKeyPress={mockOnKeyPress}
        keyboardStatus={mockKeyboardStatus}
        disabled={true}
      />
    );

    const qKey = screen.getByLabelText('Q harfi');
    expect(qKey).toBeDisabled();

    fireEvent.click(qKey);
    expect(mockOnKeyPress).not.toHaveBeenCalled();
  });

  it('shows disabled message when disabled', () => {
    render(
      <TurkishKeyboard
        onKeyPress={mockOnKeyPress}
        keyboardStatus={mockKeyboardStatus}
        disabled={true}
      />
    );

    expect(screen.getByText('Sıranızı bekleyin...')).toBeInTheDocument();
  });

  it('applies adaptive sizing classes', () => {
    render(
      <TurkishKeyboard
        onKeyPress={mockOnKeyPress}
        keyboardStatus={mockKeyboardStatus}
        adaptiveSize={true}
      />
    );

    const container = screen.getByRole('group', { hidden: true }) || 
                     document.querySelector('.keyboard-container');
    expect(container).toHaveClass('keyboard-container');
  });
});