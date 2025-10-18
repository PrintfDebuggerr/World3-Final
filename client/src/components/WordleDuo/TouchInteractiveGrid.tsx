/**
 * TouchInteractiveGrid - Example component demonstrating enhanced touch interactions
 * This component showcases the new touch features for the LetterGrid
 */

import React, { useState } from 'react';
import { LetterGrid } from './LetterGrid';
import { LetterStatus } from '../../types/game';

export function TouchInteractiveGrid() {
  const [letters, setLetters] = useState<string[]>(['', '', '', '', '']);
  const [statuses, setStatuses] = useState<LetterStatus[]>(['empty', 'empty', 'empty', 'empty', 'empty']);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLetterInput = (index: number, letter: string) => {
    const newLetters = [...letters];
    newLetters[index] = letter;
    setLetters(newLetters);
    
    // Update status to show input
    const newStatuses = [...statuses];
    newStatuses[index] = letter ? 'empty' : 'empty'; // Keep as empty for demo
    setStatuses(newStatuses);
    
    // Move to next cell if letter was entered
    if (letter && index < letters.length - 1) {
      setCurrentIndex(index + 1);
    }
  };

  const handleLetterClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleNavigation = (direction: 'next' | 'previous') => {
    if (direction === 'next' && currentIndex < letters.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'previous' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetGrid = () => {
    setLetters(['', '', '', '', '']);
    setStatuses(['empty', 'empty', 'empty', 'empty', 'empty']);
    setCurrentIndex(0);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Touch Interactive Letter Grid</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tap cells to input letters. On mobile, virtual keyboard will appear.
        </p>
      </div>
      
      <div className="flex justify-center">
        <LetterGrid
          letters={letters}
          statuses={statuses}
          interactive={true}
          enableVirtualKeyboard={true}
          autoFocus={true}
          onLetterInput={handleLetterInput}
          onLetterClick={handleLetterClick}
          onNavigate={handleNavigation}
        />
      </div>
      
      <div className="text-center space-y-2">
        <div className="text-sm">
          Current word: <span className="font-mono font-bold">{letters.map(letter => letter || '-').join('')}</span>
        </div>
        <div className="text-xs text-gray-500">
          Active cell: {currentIndex + 1}
        </div>
        <button
          onClick={resetGrid}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div><strong>Touch features:</strong></div>
        <div>• Tap to focus and input letters</div>
        <div>• Long press to clear letter</div>
        <div>• Swipe left/right to navigate</div>
        <div>• Haptic feedback on interactions</div>
        <div>• Auto-navigation to next cell</div>
      </div>
    </div>
  );
}