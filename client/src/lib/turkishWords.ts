// Turkish 5-letter words loaded from words.json
let turkishWords: string[] = [];
let isLoaded = false;

// Load words from JSON file
async function loadWords(): Promise<string[]> {
  if (!isLoaded) {
    try {
      const response = await fetch('/words.json');
      if (!response.ok) {
        throw new Error('Words file not found');
      }
      const wordsData: string[] = await response.json();
      
      // Filter only 5-letter words and handle Turkish characters properly
      turkishWords = wordsData
        .filter((word: string) => word.length === 5)
        .map((word: string) => {
          // Handle Turkish i/ı properly when converting to uppercase
          // First handle lowercase Turkish characters, then convert to uppercase
          return word
            .replace(/i/g, 'İ')  // i → İ
            .replace(/ı/g, 'I')  // ı → I
            .toUpperCase();
        });
      
      isLoaded = true;
      console.log(`Loaded ${turkishWords.length} Turkish words`);
    } catch (error) {
      console.error('Error loading words:', error);
      // Fallback to a small set of words
      turkishWords = [
        'ARABA', 'ELMAS', 'KITAP', 'KALEM', 'MASAL',
        'BAYAN', 'ÇOCUK', 'EVRAK', 'PAZAR', 'GÜZEL', 
        'BEYAZ', 'ŞEHİR', 'ZAMAN', 'YAZAR', 'HABER',
        'İŞLEM', 'OKUMA', 'CEVAP', 'TARİH', 'ŞAHAN'
      ];
      isLoaded = true;
    }
  }
  return turkishWords;
}

// Initialize words on module load
loadWords();

export function selectRandomWord(): string {
  if (turkishWords.length === 0) {
    // Fallback words if not loaded yet
    const fallback = ['ARABA', 'ELMAS', 'KITAP', 'KALEM', 'MASAL'];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
  return turkishWords[Math.floor(Math.random() * turkishWords.length)];
}

export function isValidWord(word: string): boolean {
  if (turkishWords.length === 0) {
    // Allow any 5-letter word if words not loaded yet
    return word.length === 5;
  }
  
  // Handle Turkish i/ı properly when converting to uppercase
  const upperWord = word
    .replace(/i/g, 'İ')  // i → İ
    .replace(/ı/g, 'I')  // ı → I
    .toUpperCase();
  
  // Check exact match - I and İ are different letters
  return turkishWords.includes(upperWord);
}

export function selectDifferentWords(): [string, string] {
  const word = selectRandomWord();
  // Düello modunda her iki oyuncu da aynı kelimeyi tahmin etsin
  return [word, word];
}

// Export the words array for debugging
export { turkishWords };