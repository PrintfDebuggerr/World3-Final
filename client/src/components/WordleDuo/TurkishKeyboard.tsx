import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LetterStatus } from '../../types/game';
import { useOrientation } from '../../hooks/useOrientation';

interface TurkishKeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardStatus: Record<string, LetterStatus>;
  disabled?: boolean;
}

export function TurkishKeyboard({ onKeyPress, keyboardStatus, disabled = false }: TurkishKeyboardProps) {
  const { isMobile } = useOrientation();
  const [showMobileInput, setShowMobileInput] = useState(false);
  const [mobileInputValue, setMobileInputValue] = useState('');

  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç']
  ];

  const getKeyStatus = (key: string): LetterStatus => {
    return keyboardStatus[key] || 'empty';
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const oldValue = mobileInputValue;
    setMobileInputValue(value);
    
    // Sadece yeni eklenen harfi işle
    if (value.length > oldValue.length) {
      const newChar = value[value.length - 1].toUpperCase();
      if (/^[A-ZÇĞIİÖŞÜ]$/.test(newChar)) {
        // Harfi manuel olarak ekle, otomatik onKeyPress çağırma
        // Burada sadece input'u güncelle, oyun mantığını handle etme
      }
    } else if (value.length < oldValue.length) {
      // Harf silindi, oyun mantığını handle etme
    }
  };

  const handleMobileInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Enter tuşuna basıldığında tüm kelimeyi gönder
      const word = mobileInputValue.toUpperCase();
      if (word.length === 5) {
        // Her harfi tek tek ekle
        for (let i = 0; i < word.length; i++) {
          onKeyPress(word[i]);
        }
        // Enter tuşunu gönder
        onKeyPress('ENTER');
        setMobileInputValue('');
      }
    } else if (e.key === 'Backspace') {
      // Backspace tuşuna basıldığında son harfi sil
      onKeyPress('BACKSPACE');
      setMobileInputValue(mobileInputValue.slice(0, -1));
    }
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
      {/* Mobil Input Field */}
      {isMobile && (
        <div className="mb-4 text-center">
          <button
            onClick={() => setShowMobileInput(!showMobileInput)}
            className="glass-button px-4 py-2 rounded-lg text-white text-sm mb-2"
          >
            {showMobileInput ? 'Klavyeyi Gizle' : 'Kendi Klavyeni Kullan'}
          </button>
          
          {showMobileInput && (
            <div className="space-y-2">
              <input
                type="text"
                value={mobileInputValue}
                onChange={handleMobileInputChange}
                onKeyDown={handleMobileInputKeyDown}
                placeholder="Buraya yazın..."
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                maxLength={5}
              />
              <p className="text-xs text-gray-400">
                Kendi klavyenizi kullanarak yazın veya yukarıdaki sanal klavyeyi kullanın
              </p>
            </div>
          )}
        </div>
      )}

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
