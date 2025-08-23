import React from 'react';
import { motion } from 'framer-motion';
import { LetterStatus } from '../../types/game';

interface TurkishKeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardStatus: Record<string, LetterStatus>;
  disabled?: boolean;
}

export function TurkishKeyboard({ onKeyPress, keyboardStatus, disabled = false }: TurkishKeyboardProps) {
  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç']
  ];

  const getKeyStatus = (key: string): LetterStatus => {
    return keyboardStatus[key] || 'empty';
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.02
      }
    }
  };

  const keyVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {keyboard.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1">
          {rowIndex === 2 && (
            <motion.button
              variants={keyVariants}
              onClick={() => onKeyPress('ENTER')}
              disabled={disabled}
              className="keyboard-key px-4 py-3 rounded-lg text-white font-bold text-sm glass-button min-w-[80px]"
            >
              ENTER
            </motion.button>
          )}
          
          {row.map((key) => (
            <motion.button
              key={key}
              variants={keyVariants}
              onClick={() => onKeyPress(key)}
              disabled={disabled}
              className={`
                keyboard-key w-10 h-12 rounded-lg text-white font-bold text-sm
                transition-all duration-200 border border-white/20
                ${getKeyStatus(key) === 'correct' ? 'correct' : ''}
                ${getKeyStatus(key) === 'present' ? 'present' : ''}
                ${getKeyStatus(key) === 'absent' ? 'absent' : ''}
                ${getKeyStatus(key) === 'empty' ? 'glass-button' : ''}
              `}
            >
              {key}
            </motion.button>
          ))}
          
          {rowIndex === 2 && (
            <motion.button
              variants={keyVariants}
              onClick={() => onKeyPress('BACKSPACE')}
              disabled={disabled}
              className="keyboard-key px-4 py-3 rounded-lg text-white font-bold text-sm glass-button min-w-[80px]"
            >
              ⌫
            </motion.button>
          )}
        </div>
      ))}
      
      {disabled && (
        <div className="text-center text-gray-400 text-sm mt-4">
          Sıranızı bekleyin...
        </div>
      )}
    </motion.div>
  );
}
