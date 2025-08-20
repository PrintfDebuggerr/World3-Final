// Simple Turkish 5-letter word list for testing - 20 words
export const turkishWords = [
  'ARABA', 'ELMA', 'KITAP', 'KALEM', 'MASA',
  'BAYAN', 'ADAM', 'COCUK', 'EVRAK', 'PAZAR', 
  'GUZEL', 'BEYAZ', 'SEHIR', 'ZAMAN', 'YAZAR',
  'HABER', 'ISLEM', 'OKUMA', 'CEVAP', 'TARIH'
];

export function selectRandomWord(): string {
  return turkishWords[Math.floor(Math.random() * turkishWords.length)];
}

export function isValidWord(word: string): boolean {
  return turkishWords.includes(word.toUpperCase());
}

export function selectDifferentWords(): [string, string] {
  const word1 = selectRandomWord();
  let word2 = selectRandomWord();
  
  while (word1 === word2) {
    word2 = selectRandomWord();
  }
  
  return [word1, word2];
}
