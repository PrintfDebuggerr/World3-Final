/**
 * Unit tests for TouchInteractiveGrid component
 * Tests touch interactions, virtual keyboard integration, and grid functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TouchInteractiveGrid } from '../TouchInteractiveGrid';

// Mock LetterGrid component
vi.mock('../LetterGrid', () => ({
  LetterGrid: vi.fn(({ 
    letters, 
    statuses, 
    interactive, 
    enableVirtualKeyboard, 
    autoFocus, 
    onLetterInput, 
    onLetterClick, 
    onNavigate 
  }) => (
    <div data-testid="letter-grid">
      {letters.map((letter: string, index: number) => (
        <div
          key={index}
          data-testid={`letter-cell-${index}`}
          data-letter={letter}
          data-status={statuses[index]}
          data-interactive={interactive}
          data-virtual-keyboard={enableVirtualKeyboard}
          data-auto-focus={autoFocus}
          onClick={() => onLetterClick?.(index)}
          onKeyDown={(e) => {
            if (e.key.length === 1 && /^[A-ZÇĞIİÖŞÜ]$/i.test(e.key)) {
              onLetterInput?.(index, e.key.toUpperCase());
            }
          }}
          tabIndex={0}
          role="button"
        >
          {letter || '-'}
        </div>
      ))}
      <button
        data-testid="navigate-next"
        onClick={() => onNavigate?.('next')}
      >
        Next
      </button>
      <button
        data-testid="navigate-previous"
        onClick={() => onNavigate?.('previous')}
      >
        Previous
      </button>
    </div>
  )),
}));

describe('TouchInteractiveGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with initial state', () => {
      render(<TouchInteractiveGrid />);
      
      expect(screen.getByText('Touch Interactive Letter Grid')).toBeInTheDocument();
      expect(screen.getByText('Tap cells to input letters. On mobile, virtual keyboard will appear.')).toBeInTheDocument();
      expect(screen.getByTestId('letter-grid')).toBeInTheDocument();
      expect(screen.getByText('-----')).toBeInTheDocument();
      expect(screen.getByText('Active cell: 1')).toBeInTheDocument();
    });

    it('should render all letter cells', () => {
      render(<TouchInteractiveGrid />);
      
      for (let i = 0; i < 5; i++) {
        expect(screen.getByTestId(`letter-cell-${i}`)).toBeInTheDocument();
      }
    });

    it('should render reset button', () => {
      render(<TouchInteractiveGrid />);
      
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    });

    it('should render touch features description', () => {
      render(<TouchInteractiveGrid />);
      
      expect(screen.getByText('Touch features:')).toBeInTheDocument();
      expect(screen.getByText('• Tap to focus and input letters')).toBeInTheDocument();
      expect(screen.getByText('• Long press to clear letter')).toBeInTheDocument();
      expect(screen.getByText('• Swipe left/right to navigate')).toBeInTheDocument();
      expect(screen.getByText('• Haptic feedback on interactions')).toBeInTheDocument();
      expect(screen.getByText('• Auto-navigation to next cell')).toBeInTheDocument();
    });
  });

  describe('LetterGrid Configuration', () => {
    it('should pass correct props to LetterGrid', () => {
      render(<TouchInteractiveGrid />);
      
      const letterGrid = screen.getByTestId('letter-grid');
      
      expect(letterGrid).toHaveAttribute('data-interactive', 'true');
      expect(letterGrid).toHaveAttribute('data-virtual-keyboard', 'true');
      expect(letterGrid).toHaveAttribute('data-auto-focus', 'true');
    });

    it('should initialize with empty letters and statuses', () => {
      render(<TouchInteractiveGrid />);
      
      for (let i = 0; i < 5; i++) {
        const cell = screen.getByTestId(`letter-cell-${i}`);
        expect(cell).toHaveAttribute('data-letter', '');
        expect(cell).toHaveAttribute('data-status', 'empty');
      }
    });
  });

  describe('Letter Input Handling', () => {
    it('should handle letter input and update state', async () => {
      render(<TouchInteractiveGrid />);
      
      const firstCell = screen.getByTestId('letter-cell-0');
      
      // Simulate letter input via keyboard
      fireEvent.keyDown(firstCell, { key: 'A' });
      
      await waitFor(() => {
        expect(screen.getByText('A----')).toBeInTheDocument();
      });
    });

    it('should auto-navigate to next cell after input', async () => {
      render(<TouchInteractiveGrid />);
      
      const firstCell = screen.getByTestId('letter-cell-0');
      
      // Input letter in first cell
      fireEvent.keyDown(firstCell, { key: 'A' });
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 2')).toBeInTheDocument();
      });
    });

    it('should not navigate beyond last cell', async () => {
      render(<TouchInteractiveGrid />);
      
      const lastCell = screen.getByTestId('letter-cell-4');
      
      // Input letter in last cell
      fireEvent.keyDown(lastCell, { key: 'E' });
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 5')).toBeInTheDocument();
      });
    });

    it('should handle empty input', async () => {
      render(<TouchInteractiveGrid />);
      
      const firstCell = screen.getByTestId('letter-cell-0');
      
      // First add a letter
      fireEvent.keyDown(firstCell, { key: 'A' });
      
      // Then clear it with backspace
      fireEvent.keyDown(firstCell, { key: 'Backspace' });
      
      await waitFor(() => {
        expect(screen.getByText('-----')).toBeInTheDocument();
      });
    });

    it('should handle multiple letter inputs', async () => {
      render(<TouchInteractiveGrid />);
      
      // Input letters in sequence
      for (let i = 0; i < 5; i++) {
        const cell = screen.getByTestId(`letter-cell-${i}`);
        fireEvent.keyDown(cell, { key: String.fromCharCode(65 + i) }); // A, B, C, D, E
      }
      
      await waitFor(() => {
        expect(screen.getByText('ABCDE')).toBeInTheDocument();
      });
    });
  });

  describe('Cell Click Handling', () => {
    it('should handle cell click and update current index', async () => {
      render(<TouchInteractiveGrid />);
      
      const thirdCell = screen.getByTestId('letter-cell-2');
      
      fireEvent.click(thirdCell);
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 3')).toBeInTheDocument();
      });
    });

    it('should allow clicking any cell to focus it', async () => {
      render(<TouchInteractiveGrid />);
      
      const lastCell = screen.getByTestId('letter-cell-4');
      
      fireEvent.click(lastCell);
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 5')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Handling', () => {
    it('should handle next navigation', async () => {
      render(<TouchInteractiveGrid />);
      
      const nextButton = screen.getByTestId('navigate-next');
      
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 2')).toBeInTheDocument();
      });
    });

    it('should handle previous navigation', async () => {
      render(<TouchInteractiveGrid />);
      
      // First navigate to second cell
      const nextButton = screen.getByTestId('navigate-next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 2')).toBeInTheDocument();
      });
      
      // Then navigate back
      const previousButton = screen.getByTestId('navigate-previous');
      fireEvent.click(previousButton);
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 1')).toBeInTheDocument();
      });
    });

    it('should not navigate before first cell', async () => {
      render(<TouchInteractiveGrid />);
      
      const previousButton = screen.getByTestId('navigate-previous');
      
      fireEvent.click(previousButton);
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 1')).toBeInTheDocument();
      });
    });

    it('should not navigate beyond last cell', async () => {
      render(<TouchInteractiveGrid />);
      
      const nextButton = screen.getByTestId('navigate-next');
      
      // Navigate to last cell
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 5')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset grid to initial state', async () => {
      render(<TouchInteractiveGrid />);
      
      // First, input some letters
      for (let i = 0; i < 3; i++) {
        const cell = screen.getByTestId(`letter-cell-${i}`);
        fireEvent.keyDown(cell, { key: String.fromCharCode(65 + i) });
      }
      
      await waitFor(() => {
        expect(screen.getByText('ABC--')).toBeInTheDocument();
      });
      
      // Then reset
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('-----')).toBeInTheDocument();
        expect(screen.getByText('Active cell: 1')).toBeInTheDocument();
      });
    });

    it('should reset all letter cells to empty', async () => {
      render(<TouchInteractiveGrid />);
      
      // Input letters
      for (let i = 0; i < 5; i++) {
        const cell = screen.getByTestId(`letter-cell-${i}`);
        fireEvent.keyDown(cell, { key: 'X' });
      }
      
      // Reset
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        for (let i = 0; i < 5; i++) {
          const cell = screen.getByTestId(`letter-cell-${i}`);
          expect(cell).toHaveAttribute('data-letter', '');
          expect(cell).toHaveAttribute('data-status', 'empty');
        }
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle user typing with userEvent', async () => {
      const user = userEvent.setup();
      render(<TouchInteractiveGrid />);
      
      const firstCell = screen.getByTestId('letter-cell-0');
      
      await user.click(firstCell);
      
      // Simulate typing
      fireEvent.keyDown(firstCell, { key: 'T' });
      
      await waitFor(() => {
        expect(screen.getByText('T----')).toBeInTheDocument();
      });
    });

    it('should handle rapid input changes', async () => {
      render(<TouchInteractiveGrid />);
      
      const firstCell = screen.getByTestId('letter-cell-0');
      
      // Rapid input changes
      fireEvent.keyDown(firstCell, { key: 'A' });
      fireEvent.keyDown(firstCell, { key: 'B' });
      fireEvent.keyDown(firstCell, { key: 'C' });
      
      await waitFor(() => {
        expect(screen.getByText('C----')).toBeInTheDocument();
      });
    });

    it('should handle mixed interactions (click and input)', async () => {
      render(<TouchInteractiveGrid />);
      
      // Click third cell
      const thirdCell = screen.getByTestId('letter-cell-2');
      fireEvent.click(thirdCell);
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 3')).toBeInTheDocument();
      });
      
      // Input letter
      fireEvent.keyDown(thirdCell, { key: 'M' });
      
      await waitFor(() => {
        expect(screen.getByText('--M--')).toBeInTheDocument();
        expect(screen.getByText('Active cell: 4')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TouchInteractiveGrid />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Touch Interactive Letter Grid');
    });

    it('should have descriptive text for users', () => {
      render(<TouchInteractiveGrid />);
      
      expect(screen.getByText(/Tap cells to input letters/)).toBeInTheDocument();
      expect(screen.getByText(/On mobile, virtual keyboard will appear/)).toBeInTheDocument();
    });

    it('should have accessible reset button', () => {
      render(<TouchInteractiveGrid />);
      
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toHaveClass('px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded');
    });
  });

  describe('State Management', () => {
    it('should maintain consistent state across interactions', async () => {
      render(<TouchInteractiveGrid />);
      
      // Input letter
      const firstCell = screen.getByTestId('letter-cell-0');
      fireEvent.keyDown(firstCell, { key: 'A' });
      
      // Navigate
      const nextButton = screen.getByTestId('navigate-next');
      fireEvent.click(nextButton);
      
      // Input another letter
      const thirdCell = screen.getByTestId('letter-cell-2');
      fireEvent.keyDown(thirdCell, { key: 'C' });
      
      await waitFor(() => {
        expect(screen.getByText('A-C--')).toBeInTheDocument();
        expect(screen.getByText('Active cell: 4')).toBeInTheDocument();
      });
    });

    it('should handle edge cases in state updates', async () => {
      render(<TouchInteractiveGrid />);
      
      // Try to navigate beyond bounds
      const nextButton = screen.getByTestId('navigate-next');
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 5')).toBeInTheDocument();
      });
      
      // Try to navigate before bounds
      const previousButton = screen.getByTestId('navigate-previous');
      for (let i = 0; i < 10; i++) {
        fireEvent.click(previousButton);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Active cell: 1')).toBeInTheDocument();
      });
    });
  });
});