# Oyuncu Logları Rehberi

## Log'ları Nerede Görebilirsiniz?

### 1. Development (Geliştirme) Modunda

Terminal'de `npm run dev` komutunu çalıştırdığınızda, tüm log'lar terminal penceresinde görünür.

```bash
npm run dev
```

**Örnek Log Çıktıları:**
```
[2025-01-21T10:30:45.123Z] [ROOM ABC123] 🎮 ROOM CREATED | Players: Ahmet (🦊) vs  | {"mode":"duel","host":"Ahmet","totalRows":6}
[2025-01-21T10:31:12.456Z] [ROOM ABC123] 👥 PLAYER JOINED | Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Mehmet","avatar":"🐻","totalPlayers":2}
[2025-01-21T10:31:15.789Z] [ROOM ABC123] 🎯 GAME STARTED | Players: Ahmet (🦊) vs Mehmet (🐻) | {"mode":"duel","totalRows":6}
[2025-01-21T10:31:30.012Z] [ROOM ABC123] 💭 GUESS MADE | Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Ahmet","guess":"KADIN","correct":2,"present":1,"attempt":"1/6"}
[2025-01-21T10:31:45.345Z] [ROOM ABC123] 💭 GUESS MADE | Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Mehmet","guess":"ARABA","correct":1,"present":2,"attempt":"2/6"}
[2025-01-21T10:32:10.678Z] [ROOM ABC123] 🎉 WORD FOUND! | Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Ahmet","word":"KALEM","attempts":3}
[2025-01-21T10:32:11.901Z] [ROOM ABC123] 🏁 GAME FINISHED | Players: Ahmet (🦊) vs Mehmet (🐻) | {"winner":"Ahmet","totalGuesses":5,"mode":"duel"}
```

### 2. Production (Üretim) Modunda

#### Railway'de:
1. Railway dashboard'a gidin
2. Projenizi seçin
3. "Deployments" sekmesine tıklayın
4. En son deployment'ı seçin
5. "View Logs" butonuna tıklayın

#### Heroku'da:
```bash
heroku logs --tail --app your-app-name
```

#### Render'da:
1. Dashboard'a gidin
2. Servisinizi seçin
3. "Logs" sekmesine tıklayın

#### Vercel'de:
1. Dashboard'a gidin
2. Projenizi seçin
3. "Deployments" → Son deployment → "Logs"

## Log Türleri

### 🎮 ROOM CREATED (Oda Oluşturuldu)
Yeni bir oyun odası oluşturulduğunda.
```
[ROOM ABC123] 🎮 ROOM CREATED | Players: Ahmet (🦊) vs  | {"mode":"duel","host":"Ahmet","totalRows":6}
```

### 👥 PLAYER JOINED (Oyuncu Katıldı)
İkinci oyuncu odaya katıldığında.
```
[ROOM ABC123] 👥 PLAYER JOINED | Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Mehmet","avatar":"🐻","totalPlayers":2}
```

### 🎯 GAME STARTED (Oyun Başladı)
Oyun başladığında.
```
[ROOM ABC123] 🎯 GAME STARTED | Players: Ahmet (🦊) vs Mehmet (🐻) | {"mode":"duel","totalRows":6}
```

### 💭 GUESS MADE (Tahmin Yapıldı)
Bir oyuncu tahmin yaptığında.
```
[ROOM ABC123] 💭 GUESS MADE | Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Ahmet","guess":"KADIN","correct":2,"present":1,"attempt":"1/6"}
```
- `correct`: Doğru yerde olan harf sayısı (yeşil)
- `present`: Kelimede var ama yanlış yerde olan harf sayısı (sarı)
- `attempt`: Kaçıncı deneme / Toplam deneme hakkı

### 🎉 WORD FOUND! (Kelime Bulundu!)
Bir oyuncu kelimeyi bulduğunda.
```
[ROOM ABC123] 🎉 WORD FOUND! | Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Ahmet","word":"KALEM","attempts":3}
```

### 🏁 GAME FINISHED (Oyun Bitti)
Oyun sona erdiğinde.
```
[ROOM ABC123] 🏁 GAME FINISHED | Players: Ahmet (🦊) vs Mehmet (🐻) | {"winner":"Ahmet","totalGuesses":5,"mode":"duel"}
```

## Aktif Odaları Görüntüleme

Tüm aktif odaları ve oyuncuları görmek için:

### API Endpoint:
```
GET http://localhost:5001/api/rooms
```

### Tarayıcıda:
```
http://localhost:5001/api/rooms
```

### cURL ile:
```bash
curl http://localhost:5001/api/rooms
```

**Örnek Yanıt:**
```json
{
  "rooms": [
    {
      "code": "ABC123",
      "mode": "duel",
      "status": "playing",
      "players": [
        { "name": "Ahmet", "avatar": "🦊", "status": "online" },
        { "name": "Mehmet", "avatar": "🐻", "status": "online" }
      ],
      "guesses": 5,
      "createdAt": 1705834245123
    }
  ],
  "total": 1
}
```

## Log Filtreleme

### Terminal'de belirli bir odayı takip etme:
```bash
npm run dev | grep "ABC123"
```

### Sadece oyun başlangıçlarını görme:
```bash
npm run dev | grep "GAME STARTED"
```

### Sadece kazananları görme:
```bash
npm run dev | grep "WORD FOUND"
```

### Tüm tahminleri görme:
```bash
npm run dev | grep "GUESS MADE"
```

## Log Dosyasına Kaydetme

### Linux/Mac:
```bash
npm run dev > game-logs.txt 2>&1
```

### Windows PowerShell:
```powershell
npm run dev *> game-logs.txt
```

### Hem ekranda göster hem dosyaya kaydet (Linux/Mac):
```bash
npm run dev | tee game-logs.txt
```

## Gerçek Zamanlı İzleme

### Terminal'de:
```bash
npm run dev
```

### Ayrı bir terminal penceresinde log dosyasını takip etme:
```bash
tail -f game-logs.txt
```

## Log Analizi

### En çok oynayan oyuncuları bulma:
```bash
grep "PLAYER JOINED" game-logs.txt | grep -o '"player":"[^"]*"' | sort | uniq -c | sort -rn
```

### Toplam oyun sayısı:
```bash
grep "GAME STARTED" game-logs.txt | wc -l
```

### Toplam tahmin sayısı:
```bash
grep "GUESS MADE" game-logs.txt | wc -l
```

### Kazanan oyuncular:
```bash
grep "WORD FOUND" game-logs.txt | grep -o '"player":"[^"]*"'
```

## Önemli Notlar

1. **Log Formatı**: Tüm log'lar ISO 8601 formatında timestamp içerir
2. **Oda Kodları**: Her oda benzersiz bir kod ile tanımlanır (örn: ABC123)
3. **Oyuncu Bilgileri**: İsim ve avatar emoji ile gösterilir
4. **JSON Detaylar**: Her log satırı ek detaylar için JSON içerir

## Sorun Giderme

### Log'lar görünmüyorsa:
1. Server'ın çalıştığından emin olun: `npm run dev`
2. Console log'larının aktif olduğundan emin olun
3. Production'da log seviyesini kontrol edin

### Log'lar çok fazla ise:
1. Sadece önemli event'leri filtreleyin
2. Log seviyesini ayarlayın
3. Belirli odaları takip edin

## Gelişmiş Kullanım

### Custom Log Viewer Oluşturma:
```javascript
// client/src/admin/LogViewer.tsx
import { useEffect, useState } from 'react';

export function LogViewer() {
  const [rooms, setRooms] = useState([]);
  
  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data.rooms);
    };
    
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Her 5 saniyede bir güncelle
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h1>Aktif Oyunlar ({rooms.length})</h1>
      {rooms.map(room => (
        <div key={room.code}>
          <h3>Oda: {room.code}</h3>
          <p>Oyuncular: {room.players.map(p => p.name).join(' vs ')}</p>
          <p>Durum: {room.status}</p>
          <p>Tahminler: {room.guesses}</p>
        </div>
      ))}
    </div>
  );
}
```

## Örnek Kullanım Senaryoları

### 1. Bir oyuncunun tüm oyunlarını takip etme:
```bash
grep "Ahmet" game-logs.txt
```

### 2. Belirli bir zaman aralığındaki oyunları görme:
```bash
grep "2025-01-21T10:" game-logs.txt
```

### 3. Duel mode oyunlarını görme:
```bash
grep "duel" game-logs.txt
```

### 4. Sequential mode oyunlarını görme:
```bash
grep "sequential" game-logs.txt
```

## İstatistikler

Log'lardan çıkarılabilecek istatistikler:
- Toplam oyun sayısı
- Toplam oyuncu sayısı
- Ortalama tahmin sayısı
- En popüler kelimeler
- En başarılı oyuncular
- Oyun süreleri
- Mod tercihleri (duel vs sequential)

## Yardım

Daha fazla bilgi için:
- `server/simple-routes.ts` - Log implementasyonu
- `server/index.ts` - Server konfigürasyonu
