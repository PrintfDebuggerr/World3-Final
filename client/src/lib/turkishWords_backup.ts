// Turkish 5-letter word list from words.json - 10,131 words
export const turkishWords = [
  'KÖRPE', 'ACELE', 'GÜNEŞ', 'ARGON', 'KOVAN', 'BIREY', 'KAZMA', 'CEBIR', 'SICAK', 'DORSE',
  'DÖKÜM', 'MEMNU', 'TAVLA', 'SEBIL', 'YANAK', 'IKBAL', 'DIYET', 'ÇITIR', 'YASLI', 'PAKET',
  'KALIN', 'SILAH', 'KULAK', 'KETEN', 'KAPAK', 'NEDEN', 'MAYIS', 'CESUR', 'FECIR', 'AJANS',
  'AŞAĞI', 'KORNA', 'KEPÇE', 'SOLCU', 'EMARE', 'ISPIR', 'KENET', 'KOYMA', 'HATTA', 'ÇELIM',
  'DIDIM', 'REHIN', 'SINOP', 'DOĞUM', 'DÜĞME', 'NIMET', 'PIHTI', 'KÖFTE', 'FLÖRT', 'SUFLE',
  'YAZGI', 'ARŞIV', 'HEMZE', 'ÇADIR', 'TIBBI', 'KÜTLÜ', 'NEZIH', 'ILAHI', 'GIYAP', 'ÇORBA',
  'KABAN', 'KONAK', 'IKILI', 'NEMLI', 'YILKI', 'KIRIK', 'GASIL', 'CENIN', 'ARMUT', 'ŞAŞAA',
  'KEBIR', 'DENEK', 'YASAK', 'LÜFER', 'IRKÇI', 'OTIZM', 'AŞLIK', 'ERINÇ', 'DÖKÜŞ', 'PAPAK',
  'KODES', 'SÖĞÜŞ', 'KIDEM', 'SANIK', 'IMBAT', 'BUCAK', 'BOYUT', 'ISLAH', 'BÜZGÜ', 'MATEM',
  'ANTIK', 'ÇÖMEZ', 'ANIME', 'KABAK', 'HACET', 'BUŞON', 'HESAP', 'VEFAT', 'ÇÖKÜŞ', 'SÖNÜŞ',
  'YIKIM', 'ÇELME', 'IÇTEN', 'KÖÇEK', 'HOPPA', 'TEYZE', 'SIRIK', 'BIÇAK', 'KAZAN', 'PIYAZ',
  'KAZAK', 'MOTOR', 'KOLAJ', 'KÜLÇE', 'BANKA', 'KAPIŞ', 'IÇSEL', 'KUMAR', 'YARIK', 'TOPUZ',
  'BASIT', 'TABLO', 'SATMA', 'ÇEHRE', 'KÖPEK', 'MADEN', 'MELEK', 'BACAK', 'KOŞUL', 'BAGAJ',
  'MÜMIN', 'LIBRE', 'MAGMA', 'KAVKI', 'KATRE', 'EFEKT', 'OĞLAN', 'TIKAÇ', 'ŞIŞIK', 'SAYFA',
  'KELEP', 'GENEL', 'TORBA', 'ANLAM', 'MAFYA', 'DIREK', 'MÜZIK', 'SUCUK', 'ETMEN', 'YEREL',
  'EMTIA', 'UMUMI', 'HERIF', 'CEVIZ', 'BRANŞ', 'CISIM', 'DIZGI', 'ÇALGI', 'NEFIS', 'RIYAL',
  'GÜLLÜ', 'KIRIL', 'TURBO', 'DEIZM', 'YALAK', 'ÇIÇEK', 'KÜLLI', 'VAHIY', 'AKTIF', 'RIMEL',
  'TÜMÖR', 'PATIK', 'UCUBE', 'ÖRÜLÜ', 'YOKUŞ', 'MARUL', 'SIFIR', 'DÜBEL', 'TAOCU', 'SALAT',
  'YEKTA', 'DEVIR', 'PILAV', 'MELUN', 'KAVAK', 'RESUL', 'ALGIN', 'AMBER', 'GAZEL', 'SEMIZ',
  'ÇEŞIT', 'MEKAN', 'TANIK', 'ŞEHIT', 'KAZIK', 'DOYUM', 'YÜZME', 'FITRI', 'EŞRAF', 'KALEM',
  'MASAL', 'BAYAN', 'ADAM', 'COCUK', 'EVRAK', 'PAZAR', 'GUZEL', 'BEYAZ', 'SEHIR', 'ZAMAN',
  'YAZAR', 'HABER', 'ISLEM', 'OKUMA', 'CEVAP', 'TARIH', 'ARABA', 'ELMAS', 'KITAP'
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
