# 🎮 WORDLE DUO - OYUN FONKSİYONLARI VE DİNAMİKLERİ

## 1. ANA MENÜ SİSTEMİ

### 1.1 Ana Menü Fonksiyonları
```javascript
// Ana menü state management
const [menuState, setMenuState] = useState('main'); // 'main', 'create', 'join'
const [playerName, setPlayerName] = useState('');

// Menü navigasyonu
function navigateToCreateRoom() {
  setMenuState('create');
}

function navigateToJoinRoom() {
  setMenuState('join');
}

function returnToMain() {
  setMenuState('main');
}
```

### 1.2 Oyuncu Kimlik Sistemi
```javascript
// Oyuncu bilgileri
const playerData = {
  id: generateUniqueId(),
  name: playerName || 'Anonim Oyuncu',
  avatar: generateRandomAvatar(),
  joinTime: Date.now()
};

// Avatar sistemi
const avatars = ['👨‍💻', '👩‍🎨', '🧑‍🚀', '👩‍🔬', '🧑‍🎓', '👨‍🎤'];
function generateRandomAvatar() {
  return avatars[Math.floor(Math.random() * avatars.length)];
}
```

## 2. ODA YÖNETİM SİSTEMİ

### 2.1 Oda Oluşturma Fonksiyonları
```javascript
// Oda kodu üretimi
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Oda oluşturma
async function createRoom(gameMode) {
  const roomCode = generateRoomCode();
  const roomData = {
    code: roomCode,
    mode: gameMode, // 'sequential' veya 'duel'
    host: playerData.id,
    players: [playerData],
    status: 'waiting', // 'waiting', 'playing', 'finished'
    word: selectRandomWord(),
    currentTurn: 0, // Sadece sequential modda kullanılır
    createdAt: Date.now()
  };
  
  await saveRoomToDatabase(roomCode, roomData);
  return roomCode;
}
```

### 2.2 Odaya Katılma Fonksiyonları
```javascript
// Oda kodunun geçerliliğini kontrol etme
async function validateRoomCode(code) {
  const room = await getRoomFromDatabase(code);
  if (!room) return { valid: false, message: 'Oda bulunamadı!' };
  if (room.players.length >= 2) return { valid: false, message: 'Oda dolu!' };
  if (room.status !== 'waiting') return { valid: false, message: 'Oyun zaten başlamış!' };
  return { valid: true, room };
}

// Odaya katılma
async function joinRoom(roomCode) {
  const validation = await validateRoomCode(roomCode);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  const updatedRoom = {
    ...validation.room,
    players: [...validation.room.players, playerData],
    status: 'playing'
  };
  
  await updateRoomInDatabase(roomCode, updatedRoom);
  return updatedRoom;
}
```

### 2.3 Real-time Oda Senkronizasyonu
```javascript
// Firebase listener kurulum
function setupRoomListener(roomCode, callback) {
  const roomRef = firebase.database().ref(`rooms/${roomCode}`);
  return roomRef.on('value', (snapshot) => {
    const roomData = snapshot.val();
    callback(roomData);
  });
}

// Oda durumu güncelleme
function updateRoomState(roomCode, updates) {
  return firebase.database().ref(`rooms/${roomCode}`).update(updates);
}
```

## 3. KELİME YÖNETİM SİSTEMİ

### 3.1 Kelime Havuzu Sistemi
```javascript
// Türkçe 5 harfli kelime havuzu
const turkishWords = [
  'ARABA', 'BALIK', 'CICEK', 'DAĞIR', 'ELMAS', 'FINCAN', 'GÜNEŞ',
  'HAYAT', 'INSAN', 'JETON', 'KEDI', 'LIMAN', 'MASA', 'NEDEN',
  'OKUL', 'PRENS', 'RAKAM', 'SAAT', 'TAKIM', 'UZMAN', 'VAGON',
  'YAPIM', 'ZEMIN'
  // ... daha fazla kelime
];

// Rastgele kelime seçimi
function selectRandomWord() {
  return turkishWords[Math.floor(Math.random() * turkishWords.length)];
}

// Kelime geçerliliği kontrolü
function isValidWord(word) {
  return turkishWords.includes(word.toUpperCase());
}
```

### 3.2 Harf Kontrol Algoritmaları
```javascript
// Harf durumu kontrol sistemi
function checkLetterStatus(guess, targetWord) {
  const result = [];
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');
  
  // İlk geçiş: Doğru pozisyondaki harfler (yeşil)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = null; // İşaretli
      guessLetters[i] = null;  // İşaretli
    }
  }
  
  // İkinci geçiş: Yanlış pozisyondaki harfler (sarı)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] !== null) {
      const foundIndex = targetLetters.findIndex(letter => letter === guessLetters[i]);
      if (foundIndex !== -1) {
        result[i] = 'present';
        targetLetters[foundIndex] = null;
      } else {
        result[i] = 'absent';
      }
    }
  }
  
  return result;
}
```

## 4. SIRAYLA MODU DİNAMİKLERİ

### 4.1 Sıra Yönetim Sistemi
```javascript
// Sıra state management
const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
const [gameHistory, setGameHistory] = useState([]);
const [currentRow, setCurrentRow] = useState(0);

// Sıra değiştirme
function switchTurn(roomCode, roomData) {
  const nextPlayerIndex = (roomData.currentTurn + 1) % 2;
  
  updateRoomState(roomCode, {
    currentTurn: nextPlayerIndex,
    lastMoveTime: Date.now()
  });
  
  // Animasyon tetikleme
  triggerTurnChangeAnimation(nextPlayerIndex);
}

// Aktif oyuncu kontrolü
function isActivePlayer(playerId, roomData) {
  return roomData.players[roomData.currentTurn].id === playerId;
}
```

### 4.2 Dinamik Satır Ekleme Sistemi
```javascript
// Grid genişletme fonksiyonu
function expandGrid(roomCode) {
  const newRowData = {
    row: currentRow + 1,
    letters: ['', '', '', '', ''],
    status: ['empty', 'empty', 'empty', 'empty', 'empty'],
    playerId: null
  };
  
  updateRoomState(roomCode, {
    [`grid/row${currentRow + 1}`]: newRowData,
    totalRows: currentRow + 2
  });
  
  // Smooth scroll animasyonu
  scrollToNewRow(currentRow + 1);
  setCurrentRow(currentRow + 1);
}

// Otomatik scroll
function scrollToNewRow(rowIndex) {
  const rowElement = document.getElementById(`row-${rowIndex}`);
  if (rowElement) {
    rowElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }
}
```

### 4.3 Ortak Tahmin Tablosu Yönetimi
```javascript
// Tahmin geçmişi sistemi
const gameHistoryStructure = {
  rows: [
    {
      rowIndex: 0,
      playerId: 'player1_id',
      playerName: 'Ahmet',
      guess: 'ARABA',
      result: ['correct', 'absent', 'present', 'correct', 'absent'],
      timestamp: Date.now()
    }
  ]
};

// Tahmin ekleme
function addGuessToHistory(roomCode, playerData, guess, result) {
  const newGuess = {
    rowIndex: currentRow,
    playerId: playerData.id,
    playerName: playerData.name,
    playerAvatar: playerData.avatar,
    guess: guess,
    result: result,
    timestamp: Date.now()
  };
  
  updateRoomState(roomCode, {
    [`gameHistory/${currentRow}`]: newGuess
  });
}
```

## 5. DÜELLO MODU DİNAMİKLERİ

### 5.1 Ayrı Panel Sistemi
```javascript
// Düello modu state
const [player1Grid, setPlayer1Grid] = useState(initializeGrid());
const [player2Grid, setPlayer2Grid] = useState(initializeGrid());
const [player1Word, setPlayer1Word] = useState('');
const [player2Word, setPlayer2Word] = useState('');

// Grid başlatma
function initializeGrid() {
  return Array(6).fill().map(() => ({
    letters: ['', '', '', '', ''],
    status: ['empty', 'empty', 'empty', 'empty', 'empty'],
    submitted: false
  }));
}

// Farklı kelime atama
function assignDifferentWords(roomCode) {
  const word1 = selectRandomWord();
  let word2 = selectRandomWord();
  
  // Farklı kelimeler olduğundan emin ol
  while (word1 === word2) {
    word2 = selectRandomWord();
  }
  
  updateRoomState(roomCode, {
    player1Word: word1,
    player2Word: word2
  });
}
```

### 5.2 Gizlilik Sistemi
```javascript
// Karşı oyuncunun tahminini gizleme
function getVisibleGuess(guess, result, isOwnGuess) {
  if (isOwnGuess) {
    // Kendi tahminini tam olarak göster
    return {
      letters: guess,
      colors: result
    };
  } else {
    // Karşı oyuncunun tahminini sadece renklerle göster
    return {
      letters: ['■', '■', '■', '■', '■'], // Gizli bloklar
      colors: result
    };
  }
}

// Real-time güncelleme
function syncOpponentProgress(roomCode, playerId, guess, result) {
  const hiddenResult = result; // Sadece renkler paylaşılır
  
  updateRoomState(roomCode, {
    [`opponentProgress/${playerId}`]: {
      colors: hiddenResult,
      timestamp: Date.now()
    }
  });
}
```

### 5.3 Eşzamanlı Yarış Sistemi
```javascript
// Yarış durumu takibi
const raceStatus = {
  player1: {
    currentRow: 0,
    completed: false,
    completionTime: null
  },
  player2: {
    currentRow: 0,
    completed: false,
    completionTime: null
  }
};

// Yarış sonucu belirleme
function determineWinner(roomCode, raceStatus) {
  const p1Complete = raceStatus.player1.completed;
  const p2Complete = raceStatus.player2.completed;
  
  if (p1Complete && p2Complete) {
    // İkisi de tamamladı - hız karşılaştırması
    const winner = raceStatus.player1.completionTime < raceStatus.player2.completionTime 
      ? 'player1' : 'player2';
    return { winner, reason: 'speed' };
  } else if (p1Complete) {
    return { winner: 'player1', reason: 'first_to_complete' };
  } else if (p2Complete) {
    return { winner: 'player2', reason: 'first_to_complete' };
  }
  
  return { winner: null, reason: 'ongoing' };
}
```

## 6. KLAVYE VE GİRİŞ SİSTEMİ

### 6.1 Türkçe Klavye Düzeni
```javascript
// Türkçe klavye layout
const turkishKeyboard = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç']
];

// Klavye durum yönetimi
const [keyboardStatus, setKeyboardStatus] = useState({});

// Harf durumu güncelleme
function updateKeyboardStatus(letter, status) {
  setKeyboardStatus(prev => ({
    ...prev,
    [letter]: status // 'correct', 'present', 'absent'
  }));
}
```

### 6.2 Sıra Tabanlı Klavye Kontrolü
```javascript
// Klavye aktiflik kontrolü
function isKeyboardActive(playerId, roomData) {
  if (roomData.mode === 'sequential') {
    return isActivePlayer(playerId, roomData);
  } else {
    // Düello modunda her zaman aktif
    return true;
  }
}

// Klavye deaktivasyonu
function disableKeyboard() {
  const keyboard = document.getElementById('game-keyboard');
  keyboard.classList.add('disabled');
  keyboard.style.pointerEvents = 'none';
  keyboard.style.opacity = '0.5';
}

function enableKeyboard() {
  const keyboard = document.getElementById('game-keyboard');
  keyboard.classList.remove('disabled');
  keyboard.style.pointerEvents = 'auto';
  keyboard.style.opacity = '1';
}
```

## 7. ANİMASYON SİSTEMİ

### 7.1 Harf Animasyonları
```javascript
// Harf girişi animasyonu
function animateLetterInput(cellElement, letter) {
  cellElement.textContent = letter;
  cellElement.style.transform = 'scale(1.1)';
  cellElement.style.transition = 'transform 0.1s ease';
  
  setTimeout(() => {
    cellElement.style.transform = 'scale(1)';
  }, 100);
}

// Flip animasyonu
function animateFlip(rowElement, results, delay = 0) {
  const cells = rowElement.querySelectorAll('.letter-cell');
  
  cells.forEach((cell, index) => {
    setTimeout(() => {
      cell.style.transform = 'rotateX(90deg)';
      
      setTimeout(() => {
        cell.classList.add(`status-${results[index]}`);
        cell.style.transform = 'rotateX(0deg)';
      }, 150);
    }, index * 100 + delay);
  });
}
```

### 7.2 Sıra Değişim Animasyonları
```javascript
// Aktif oyuncu vurgu animasyonu
function triggerTurnChangeAnimation(activePlayerIndex) {
  // Eski aktif oyuncuyu söndür
  document.querySelectorAll('.player-indicator').forEach(indicator => {
    indicator.classList.remove('active');
  });
  
  // Yeni aktif oyuncuyu yakı
  const newActiveIndicator = document.getElementById(`player-${activePlayerIndex}`);
  newActiveIndicator.classList.add('active');
  
  // Pulse efekti
  newActiveIndicator.style.animation = 'pulse 0.5s ease-in-out';
  setTimeout(() => {
    newActiveIndicator.style.animation = '';
  }, 500);
}

// Yeni satır animasyonu
function animateNewRow(rowElement) {
  rowElement.style.transform = 'translateY(-20px)';
  rowElement.style.opacity = '0';
  rowElement.style.transition = 'all 0.3s ease-out';
  
  setTimeout(() => {
    rowElement.style.transform = 'translateY(0)';
    rowElement.style.opacity = '1';
  }, 50);
}
```

### 7.3 Kazanma Animasyonları
```javascript
// Konfetti patlaması
function triggerConfetti() {
  // Canvas üzerinde konfetti animasyonu
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  
  const confettiPieces = [];
  for (let i = 0; i < 100; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: -10,
      color: ['#E11D48', '#F59E0B', '#10B981', '#06B6D4'][Math.floor(Math.random() * 4)],
      velocity: Math.random() * 3 + 1,
      size: Math.random() * 5 + 2
    });
  }
  
  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiPieces.forEach(piece => {
      piece.y += piece.velocity;
      ctx.fillStyle = piece.color;
      ctx.fillRect(piece.x, piece.y, piece.size, piece.size);
    });
    
    if (confettiPieces.some(piece => piece.y < canvas.height)) {
      requestAnimationFrame(animateConfetti);
    }
  }
  
  animateConfetti();
}
```

## 8. OYUN DURUM YÖNETİMİ

### 8.1 Game State Machine
```javascript
// Oyun durumları
const gameStates = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
  DISCONNECTED: 'disconnected'
};

// Durum değişim fonksiyonları
function changeGameState(roomCode, newState, data = {}) {
  updateRoomState(roomCode, {
    status: newState,
    stateData: data,
    lastStateChange: Date.now()
  });
}

// Oyun bitiş kontrolü
function checkGameEnd(roomData, guess, result) {
  const isCorrect = result.every(status => status === 'correct');
  const isLastRow = roomData.mode === 'duel' ? 
    roomData.currentRow >= 5 : 
    roomData.totalRows >= 10; // Sıralı modda max 10 satır
  
  if (isCorrect) {
    return { ended: true, reason: 'won', winner: getCurrentPlayer() };
  } else if (isLastRow) {
    return { ended: true, reason: 'failed', winner: null };
  }
  
  return { ended: false };
}
```

### 8.2 Bağlantı Durumu Yönetimi
```javascript
// Bağlantı takibi
function setupConnectionMonitoring(roomCode) {
  const connectedRef = firebase.database().ref('.info/connected');
  
  connectedRef.on('value', (snapshot) => {
    if (snapshot.val() === false) {
      handleDisconnection(roomCode);
    } else {
      handleReconnection(roomCode);
    }
  });
}

// Bağlantı kopma durumu
function handleDisconnection(roomCode) {
  updateRoomState(roomCode, {
    [`players/${playerData.id}/status`]: 'disconnected',
    [`players/${playerData.id}/lastSeen`]: Date.now()
  });
}

// Tekrar bağlanma
function handleReconnection(roomCode) {
  updateRoomState(roomCode, {
    [`players/${playerData.id}/status`]: 'online',
    [`players/${playerData.id}/lastSeen`]: Date.now()
  });
}
```

## 9. ÖZEL ÖZELLİKLER

### 9.1 Real-time Cursör Sistemi
```javascript
// Karşı oyuncunun yazdığı harfleri gösterme
function showOpponentTyping(roomCode, playerId, currentInput) {
  updateRoomState(roomCode, {
    [`typing/${playerId}`]: {
      input: currentInput,
      timestamp: Date.now()
    }
  });
}

// Typing indicator
function displayTypingIndicator(opponentInput) {
  const indicator = document.getElementById('opponent-typing');
  indicator.textContent = `Rakibiniz yazıyor: ${opponentInput}`;
  indicator.style.opacity = '1';
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    indicator.style.opacity = '0';
  }, 2000);
}
```

### 9.2 Emoji Reaksiyon Sistemi
```javascript
// Reaksiyon gönderme
function sendReaction(roomCode, playerId, emoji) {
  updateRoomState(roomCode, {
    [`reactions/${playerId}`]: {
      emoji: emoji,
      timestamp: Date.now()
    }
  });
}

// Reaksiyon gösterme
function displayReaction(playerId, emoji) {
  const playerArea = document.getElementById(`player-area-${playerId}`);
  const reactionElement = document.createElement('div');
  reactionElement.className = 'reaction-bubble';
  reactionElement.textContent = emoji;
  
  playerArea.appendChild(reactionElement);
  
  // Animasyon
  reactionElement.style.animation = 'reactionPop 2s ease-out forwards';
  
  setTimeout(() => {
    reactionElement.remove();
  }, 2000);
}
```

### 9.3 Başarı Sistemi
```javascript
// Başarı türleri
const achievements = {
  PERFECT_GUESS: 'perfect_guess', // İlk tahminde doğru
  LAST_SECOND: 'last_second',     // Son satırda doğru
  SPEED_DEMON: 'speed_demon',     // 30 saniyede bitirme
  LUCKY_GUESS: 'lucky_guess'      // Rastgele tahminle doğru
};

// Başarı kontrolü
function checkAchievements(roomData, guess, result, timeTaken) {
  const achievements = [];
  
  if (result.every(r => r === 'correct') && roomData.currentRow === 0) {
    achievements.push('PERFECT_GUESS');
  }
  
  if (timeTaken < 30000) { // 30 saniye
    achievements.push('SPEED_DEMON');
  }
  
  return achievements;
}

// Başarı animasyonu
function displayAchievement(achievement) {
  const achievementModal = document.getElementById('achievement-modal');
  const achievementText = document.getElementById('achievement-text');
  
  achievementText.textContent = getAchievementText(achievement);
  achievementModal.style.display = 'block';
  achievementModal.style.animation = 'achievementSlide 3s ease-out forwards';
}
```

## 10. HATA YÖNETİMİ VE GÜVENLİK

### 10.1 Input Validasyonu
```javascript
// Güvenli input kontrolü
function validateInput(input) {
  // Sadece Türkçe harflere izin ver
  const turkishLetters = /^[A-ZÇĞIİÖŞÜ]*$/;
  
  if (!turkishLetters.test(input.toUpperCase())) {
    throw new Error('Sadece Türkçe harfler kullanabilirsiniz!');
  }
  
  if (input.length !== 5) {
    throw new Error('Kelime 5 harfli olmalıdır!');
  }
  
  return input.toUpperCase();
}

// Rate limiting
const rateLimitMap = new Map();

function checkRateLimit(playerId) {
  const now = Date.now();
  const playerLimit = rateLimitMap.get(playerId) || { count: 0, resetTime: now };
  
  if (now > playerLimit.resetTime) {
    // Reset limit
    rateLimitMap.set(playerId, { count: 1, resetTime: now + 60000 }); // 1 dakika
    return true;
  }
  
  if (playerLimit.count >= 10) { // 10 tahmin/dakika
    return false;
  }
  
  playerLimit.count++;
  return true;
}
```

### 10.2 Hata Durumu Yönetimi
```javascript
// Global hata yakalayıcı
window.addEventListener('error', (event) => {
  console.error('Oyun hatası:', event.error);
  showErrorMessage('Beklenmeyen bir hata oluştu. Sayfa yenileniyor...');
  
  setTimeout(() => {
    window.location.reload();
  }, 3000);
});

// Hata mesajı gösterme
function showErrorMessage(message, type = 'error') {
  const errorContainer = document.getElementById('error-container');
  const errorElement = document.createElement('div');
  
  errorElement.className = `error-message error-${type}`;
  errorElement.textContent = message;
  
  errorContainer.appendChild(errorElement);
  
  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}

// Network hata yönetimi
function handleNetworkError(error) {
  console.error('Network error:', error);
  showErrorMessage('İnternet bağlantısı problemi. Yeniden deneniyor...');
  
  // Otomatik yeniden bağlanma
  setTimeout(() => {
    setupRoomListener(currentRoomCode, handleRoomUpdate);
  }, 3000);
}
```

Bu fonksiyonlar ve dinamikler, WORDLE DUO oyununun tam işlevselliğini sağlayacak temel yapı taşlarını oluşturmaktadır.