# Oyuncu Logları - Hızlı Başlangıç

## Evet, oyuncu nicklerini log'larda görebilirsiniz! ✅

## Nasıl Görürsünüz?

### Development (Geliştirme):
```bash
npm run dev
```
Terminal'de tüm log'lar görünür.

### Production (Üretim):
- **Railway**: Dashboard → Deployments → View Logs
- **Heroku**: `heroku logs --tail`
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Deployments → Logs

## Log Örnekleri

```
[2025-01-21T10:30:45.123Z] [ROOM ABC123] 🎮 ROOM CREATED
Players: Ahmet (🦊) vs  | {"mode":"duel","host":"Ahmet"}

[2025-01-21T10:31:12.456Z] [ROOM ABC123] 👥 PLAYER JOINED
Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Mehmet","avatar":"🐻"}

[2025-01-21T10:31:15.789Z] [ROOM ABC123] 🎯 GAME STARTED
Players: Ahmet (🦊) vs Mehmet (🐻) | {"mode":"duel"}

[2025-01-21T10:31:30.012Z] [ROOM ABC123] 💭 GUESS MADE
Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Ahmet","guess":"KADIN","correct":2,"present":1}

[2025-01-21T10:32:10.678Z] [ROOM ABC123] 🎉 WORD FOUND!
Players: Ahmet (🦊) vs Mehmet (🐻) | {"player":"Ahmet","word":"KALEM","attempts":3}

[2025-01-21T10:32:11.901Z] [ROOM ABC123] 🏁 GAME FINISHED
Players: Ahmet (🦊) vs Mehmet (🐻) | {"winner":"Ahmet","totalGuesses":5}
```

## Aktif Odaları Görme

Tarayıcıda veya API ile:
```
http://localhost:5001/api/rooms
```

Yanıt:
```json
{
  "rooms": [
    {
      "code": "ABC123",
      "players": [
        { "name": "Ahmet", "avatar": "🦊" },
        { "name": "Mehmet", "avatar": "🐻" }
      ],
      "status": "playing",
      "guesses": 5
    }
  ],
  "total": 1
}
```

## Hızlı Filtreleme

```bash
# Belirli bir odayı takip et
npm run dev | grep "ABC123"

# Sadece oyun başlangıçları
npm run dev | grep "GAME STARTED"

# Sadece kazananlar
npm run dev | grep "WORD FOUND"

# Belirli bir oyuncuyu takip et
npm run dev | grep "Ahmet"
```

## Log'ları Dosyaya Kaydet

```bash
# Linux/Mac
npm run dev > game-logs.txt 2>&1

# Windows PowerShell
npm run dev *> game-logs.txt
```

## Ne Görürsünüz?

✅ Oyuncu isimleri ve avatarları
✅ Oda kodları
✅ Oyun modu (duel/sequential)
✅ Tüm tahminler ve sonuçları
✅ Kazananlar
✅ Oyun süreleri
✅ Timestamp'ler

## Detaylı Bilgi

Daha fazla bilgi için `LOGGING_GUIDE.md` dosyasına bakın.

## Değişiklikler

Eklenen özellikler:
- ✅ Oyuncu isimlerini ve avatarlarını loglama
- ✅ Oda oluşturma logları
- ✅ Oyuncu katılma logları
- ✅ Oyun başlangıç/bitiş logları
- ✅ Tahmin logları (doğru/yanlış harf sayıları ile)
- ✅ Kazanan logları
- ✅ Aktif odaları görüntüleme endpoint'i (`/api/rooms`)
- ✅ Timestamp'li detaylı loglar
- ✅ Emoji ile görsel log'lar

## Dosyalar

- `server/simple-routes.ts` - Log implementasyonu
- `LOGGING_GUIDE.md` - Detaylı kullanım rehberi
- `LOGGING_SUMMARY.md` - Bu dosya
