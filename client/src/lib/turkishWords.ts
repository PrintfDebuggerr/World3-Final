// Comprehensive Turkish 5-letter word list
export const turkishWords = [
  'ARABA', 'BALIK', 'CICEK', 'DAĞIR', 'ELMAS', 'FINCAN', 'GÜNEŞ', 'HAYAT',
  'INSAN', 'JETON', 'KAĞIT', 'LIMAN', 'MASA', 'NEDEN', 'OKUL', 'PRENS',
  'RAKAM', 'SAAT', 'TAKIM', 'UZMAN', 'VAGON', 'YAPIM', 'ZEMIN', 'AÇMAK',
  'BAKAN', 'CEKET', 'DOĞRU', 'EMLEK', 'FAKAT', 'GIDER', 'HABER', 'IŞLIK',
  'JILET', 'KAHVE', 'LADIN', 'MASAL', 'NABIZ', 'OĞLAN', 'PAKET', 'RESIM',
  'SAĞIR', 'TABAN', 'UÇMAK', 'VAKIT', 'YALAN', 'ZAMAN', 'ADRES', 'BEKAR',
  'ÇEVRE', 'DENIM', 'EVREN', 'FAŞOS', 'GIZEM', 'HAFTA', 'İDARE', 'JÖLEN',
  'KAYAK', 'LEZIZ', 'MADEN', 'NASIL', 'ORGAN', 'PERDE', 'RADYO', 'SINIF',
  'TEMEL', 'UYGUN', 'VICIK', 'YOKSA', 'ZATEN', 'AFIŞ', 'BELLI', 'ÇIZGI',
  'DESTE', 'ESNEK', 'FAZLA', 'GÖMLEK', 'HIZLI', 'İNEK', 'JÜRI', 'KURAL',
  'LÜZUM', 'MORAL', 'NOKTA', 'OTEL', 'PILOT', 'RENK', 'SPOR', 'TEKNE',
  'ÜRÜN', 'VİZE', 'YAŞAM', 'ZORLU', 'AKTÖR', 'BAHÇE', 'ÇOCUK', 'DOYUM',
  'ELBIS', 'FOTON', 'GÖREV', 'HUKUK', 'İVME', 'JIGOLO', 'KABIN', 'LOKAL',
  'MEVKI', 'NINNI', 'OĞUL', 'PASTA', 'RITIM', 'SOSYAL', 'TARIH', 'UYARI',
  'VİRÜS', 'YAVAŞ', 'ZEHIR', 'ARAMA', 'BONUS', 'ÇİÇEK', 'DURUM', 'EKONOM',
  'FORUM', 'GARIP', 'HAMUR', 'İKLİM', 'JOKER', 'KARMA', 'LİSTE', 'MODEL',
  'NÜFUS', 'OKYANUS', 'PROJE', 'ROBOT', 'SORU', 'TIYATRO', 'ULUSAL', 'VODKA',
  'YATIR', 'ZORLUK', 'ASKER', 'BOMBA', 'ÇANTA', 'DEVAM', 'ERKEK', 'FOTOĞRAF',
  'GENÇLIK', 'HASTA', 'İÇKİ', 'JAPON', 'KADIN', 'LIDER', 'METAL', 'NETICE',
  'OLAY', 'PARTI', 'RADKAL', 'SORUN', 'TEMA', 'ULUS', 'VERİ', 'YAZIK'
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
