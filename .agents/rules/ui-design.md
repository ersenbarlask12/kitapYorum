# UI & Tasarım Kuralları

## Aktivasyon
Herhangi bir görsel bileşen, sayfa veya layout oluşturulurken uygulanır.

## Renk Paleti (CSS Variables)
```css
:root {
  --color-primary: #1B2E5E;      /* Koyu lacivert — ana renk */
  --color-accent: #F0A500;       /* Altın sarısı — vurgu */
  --color-bg: #F8F7F2;           /* Kırık beyaz — arka plan */
  --color-surface: #FFFFFF;      /* Kart yüzeyleri */
  --color-error: #DC2626;        /* Hata */
  --color-success: #16A34A;      /* Başarı */
  --color-warning: #D97706;      /* Uyarı / güncelleme badge */
  --color-text: #1A1A2E;         /* Ana metin */
  --color-muted: #6B7280;        /* İkincil metin */
}
```

## Tipografi
- Başlıklar: `Playfair Display` (Google Fonts)
- Gövde: `Source Sans 3` (Google Fonts)
- Monospace (kod): `JetBrains Mono`

## Bileşen Standartları

### Kartlar
```
- Beyaz arka plan, hafif gölge: shadow-md
- Yuvarlatılmış köşeler: rounded-xl
- Padding: p-6
- Hover: shadow-lg + hafif yukarı kayma (transform: translateY(-2px))
```

### Formlar
- Zorunlu alanlar `*` ile işaretlenir
- Hata mesajları alanın altında kırmızı küçük metin olarak gösterilir
- Yorum alanında sağ alt köşede karakter sayacı: `"123 / 2000"`
- Yüklenirken submit butonu devre dışı + spinner

### Toast Bildirimleri
- Başarı: yeşil, sağ üst köşe, 3 saniye
- Hata: kırmızı, sağ üst köşe, 5 saniye, kapatma butonu

### Güncelleme Badge'i
```jsx
<span className="inline-flex items-center gap-1 text-xs font-medium
  bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
  ✏️ Güncellendi: {tarih}
</span>
```

## Sayfa Layout'ları

### Auth Sayfaları (Login / Kayıt)
- Ekran ortasında tek kart
- Üstte okul ikonu (BookOpen — Lucide)
- Başlık: `Playfair Display`, lacivert

### Öğretmen Paneli
- Üstte navbar: logo + "Merhaba, [Ad Soyad]" + Çıkış butonu
- Yorumlar kart grid (2 sütun masaüstü, 1 sütun mobil)
- Sağ alt sabit FAB butonu: "＋ Yeni Yorum" (lacivert arka plan, altın ikon)

### Admin Paneli
- Sol koyu sidebar (lacivert): logo + menü linkleri
- Sağ içerik alanı: filtre paneli (açılır/kapanır) + veri tablosu
- Tablo satırları hover'da açık lacivert arka plan

## Responsive Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- Minimum desteklenen genişlik: 320px
