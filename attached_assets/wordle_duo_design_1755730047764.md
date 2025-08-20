# 🎨 WORDLE DUO - TASARIM DOKÜMANI

## Genel Tema
- **Modern Dark Mode** ağırlıklı tasarım (açık mod seçeneği ile)
- **Minimalist** ama **etkileşimli** arayüz
- **Neon aksentler** ve **yumuşak animasyonlar**
- **Türkiye'ye özel** renk paleti (kırmızı-beyaz aksentler)

## Ana Renk Paleti
- **Arka Plan:** Koyu gri gradyan (`#0F172A` → `#1E293B`)
- **Kartlar:** Buzlu cam efekti (`rgba(255,255,255,0.1)`)
- **Aksentler:** 
  - Türk Kırmızısı (`#E11D48`) - Ana butonlar
  - Altın Sarısı (`#F59E0B`) - Sarı harfler
  - Yeşil (`#10B981`) - Doğru harfler
  - Neon Mavi (`#06B6D4`) - Hover efektleri

## Sayfa Akışı ve Düzenleri

### 1. Ana Menü Sayfası
- Merkezi logo (WORDLE DUO - Turkish flag renkleri)
- **Glassmorphism** kartlar:
  - "ODA OLUŞTUR" (büyük, kırmızı)
  - "ODAYA KATIL" (büyük, mavi)

### 2. Oda Oluşturma Akışı

#### 2a. Mod Seçimi (Oda oluşturanlar için)
İki büyük kart:
- **SIRAYLA MODU** - İkon: 🔄
  - *"Aynı panelde sırayla tahmin yapın"*
- **DÜELLO MODU** - İkon: ⚔️
  - *"Ayrı panellerde yarışın, sadece renkleri görün"*

#### 2b. Oda Kodu Ekranı
- Seçilen mod göstergesi üstte
- Büyük 6 haneli kod (kopyalama butonu ile)
- "Arkadaşınız bekleniyor..." animasyonu

### 3. Odaya Katılma
- Büyük oda kodu girişi (6 haneli, büyük fontlar)
- "KATIL" butonu
- Geçersiz kod uyarıları

### 4. Oyun Ekranları

#### SIRAYLA MODU
- **Tek Merkezi Panel:**
  - **Ortak tahmin tablosu** (başlangıçta 6x5, dinamik genişleyen)
  - Alt kısımda Türkçe klavye
  - **Sıra sistemi:**
    - Aktif oyuncunun ismi/avatarı parlak
    - Pasif oyuncunun ismi/avatarı soluk
  - **Dinamik satır ekleme:**
    - 6. satır tamamlandıktan sonra kelime bulunmadıysa
    - **Yumuşak animasyonla** yeni satır eklenir
    - Tablo **otomatik scroll** yapar
    - **Sınırsız** satır (kelime bulunana kadar)
  - **Her tahmin sonrası:**
    - Sıra otomatik değişir
    - Yeni aktif oyuncu vurgulanır

#### DÜELLO MODU
- **Bölünmüş Ekran (50-50)**
- **Sol Yarı:** Oyuncu 1
  - Kendi tahmin tablosu (6x5 sabit)
  - Kendi klavyesi
- **Sağ Yarı:** Oyuncu 2
  - Kendi tahmin tablosu (6x5 sabit)
  - Kendi klavyesi
- **Gizlilik Sistemi:**
  - Kendi tarafın: Harfler + renkler görünür
  - Karşı taraf: **Sadece renk kutuları**
    - 🟩 Yeşil kare (doğru konum)
    - 🟨 Sarı kare (yanlış konum)
    - ⬜ Gri kare (yok)

## UI Bileşenleri

### Sırayla Modu - Özel Özellikler
- **Aktif Oyuncu Göstergesi:**
  - Üst kısımda büyük isim/avatar
  - Parlak neon çerçeve
  - "Sıran!" yazısı
- **Tahmin Geçmişi:**
  - Tüm önceki tahminler görünür
  - Her satırın yanında hangi oyuncunun tahmini olduğu belirtilir
  - Renkli indikator: 🔵 Oyuncu 1, 🔴 Oyuncu 2
- **Dinamik Scroll:**
  - 6+ satır olduğunda otomatik scroll
  - Son tahmin her zaman görünür
  - Smooth scrolling animasyonu

### Düello Modu - Gizlilik Sistemi
- **Kendi tarafın:** Normal görünüm (harfler + renkler)
- **Karşı taraf:** Sadece renk kutuları
  - Yeşil kare: ✅ (doğru konum)
  - Sarı kare: 🟨 (yanlış konum)  
  - Gri kare: ⬜ (yok)
- **Real-time güncelleme:** Karşı oyuncu tahmin yaptığında anında renk kodları görünür

### Harf Kutuları
- **3D efekt** ile yükseltilmiş görünüm
- **Flip animasyonu** tahmin sonrası
- **Pulse efekti** aktif kutu için
- **Glow efekti** sıra sahibi için

### Klavye
- **Türkçe klavye** (Ç, Ğ, I, İ, Ö, Ş, Ü dahil)
- **Dinamik renk kodlaması:**
  - Yeşil: Doğru konumda kullanılan harfler
  - Sarı: Yanlış konumda kullanılan harfler
  - Gri: Kelimede olmayan harfler
- **Sıra tabanlı deaktivation:**
  - Sırası olmayan oyuncu klavyeyi kullanamaz

## Animasyonlar
- **Harf girişi:** Scale + fade in
- **Tahmin kontrolü:** Wave animasyonu (soldan sağa)
- **Yanlış tahmin:** Shake animasyonu
- **Kazanma:** Konfetti patlaması
- **Sıra değişimi:** Oyuncu vurgulama geçişi
- **Yeni satır ekleme:** Yukarıdan aşağı slide-in
- **Sayfa geçişleri:** Slide animasyonları
- **Düello modu sync:** Renk kutularının senkronize animasyonu

## Responsive Tasarım
- **Desktop:** Yan yana layout (optimum deneyim)
- **Tablet:** Dikey stack
- **Mobile:** Full screen, touch optimized, büyük klavye
- **PWA desteği:** Offline oynanabilir

## Özel Özellikler
- **Real-time cursör** - Diğer oyuncunun yazdığı harfleri anlık gösterme
- **Emoji reaksiyonları** - Hızlı tepki verme (😀, 😮, 🤔, 🎉)
- **Başarı animasyonları** - Perfect guess, son saniye kazanımları

## Tema Seçenekleri
1. **Klasik Dark** (varsayılan)
2. **Türk Bayrağı** (kırmızı-beyaz)
3. **Ocean Blue** (mavi tonları)
4. **Sunset** (turuncu-pembe gradyan)

## Teknik Özellikler
- **Framework:** Next.js
- **Database:** Firebase Realtime Database
- **Real-time Updates:** Firebase listeners
- **Oda Sistemi:** 6 haneli kod tabanlı
- **Kelime Havuzu:** 5 harfli Türkçe kelimeler
- **Responsive:** Mobile-first approach

## Oyun Akışı
1. Ana menü → Oda oluştur/katıl
2. Oda oluştur → Mod seçimi → Kod paylaşımı
3. İkinci oyuncu katılımı → Otomatik oyun başlangıcı
4. Sırayla mod: Ortak panel + sıra tabanlı
5. Düello mod: Ayrı paneller + gizli kelimeler
6. Kazanan belirleme → Tekrar oynama seçeneği