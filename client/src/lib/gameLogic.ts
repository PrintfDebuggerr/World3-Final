import { LetterStatus } from '../types/game';

export function checkLetterStatus(guess: string, targetWord: string): LetterStatus[] {
  const result: LetterStatus[] = [];
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');
  
  // Special easter egg for "DENİZ" 🥰
  if (guess === 'DENİZ') {
    // Trigger special animation flag
    (window as any).denizEasterEgg = true;
  }
  
  // Helper function to compare Turkish letters properly
  const isSameLetter = (letter1: string, letter2: string): boolean => {
    // Exact match first
    if (letter1 === letter2) return true;
    
    // I and İ are completely different letters in Turkish - never equal
    return false;
  };
  
  // First pass: Mark correct positions (green)
  for (let i = 0; i < 5; i++) {
    if (isSameLetter(guessLetters[i], targetLetters[i])) {
      result[i] = 'correct';
      targetLetters[i] = ''; // Mark as used
      guessLetters[i] = ''; // Mark as processed
    }
  }
  
  // Second pass: Mark present but wrong position (yellow)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] !== '') {
      const foundIndex = targetLetters.findIndex(letter => isSameLetter(letter, guessLetters[i]));
      if (foundIndex !== -1) {
        result[i] = 'present';
        targetLetters[foundIndex] = ''; // Mark as used
      } else {
        result[i] = 'absent';
      }
    }
  }
  
  return result;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function generateRandomAvatar(): string {
  const avatars = ['👨‍💻', '👩‍🎨', '🧑‍🚀', '👩‍🔬', '🧑‍🎓', '👨‍🎤', '👩‍💼', '🧑‍🎯'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

export function validateInput(input: string): string {
  // Turkish letters regex
  const turkishLetters = /^[A-ZÇĞIİÖŞÜ]*$/;
  
  if (!turkishLetters.test(input.toUpperCase())) {
    throw new Error('Sadece Türkçe harfler kullanabilirsiniz!');
  }
  
  if (input.length !== 5) {
    throw new Error('Kelime 5 harfli olmalıdır!');
  }
  
  return input.toUpperCase();
}

export function updateKeyboardStatus(
  currentStatus: Record<string, LetterStatus>,
  guess: string,
  result: LetterStatus[]
): Record<string, LetterStatus> {
  const newStatus = { ...currentStatus };
  
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = result[i];
    
    // Handle Turkish I/İ separately in keyboard status
    let keyToUpdate = letter;
    
    // Only update if new status is better than current
    if (!newStatus[keyToUpdate] || 
        (newStatus[keyToUpdate] === 'absent' && status !== 'absent') ||
        (newStatus[keyToUpdate] === 'present' && status === 'correct')) {
      newStatus[keyToUpdate] = status;
    }
  }
  
  return newStatus;
}
