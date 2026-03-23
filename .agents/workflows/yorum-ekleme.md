# Yeni Yorum Ekleme Workflow'u

## Açıklama
Öğretmenin yeni bir kitap yorumu ekleme akışını uygular. Yorum formu veya TeacherDashboard bileşeni yazılırken çalıştır.

## Adımlar

### Adım 1 — Yorum Formu Bileşenini Oluştur
`src/components/form/CommentForm.tsx` bileşenini oluştur.
- `@cascade-dropdown` skill'ini kullanarak Kademe / Sınıf / Ders dropdown zincirini ekle
- React Hook Form + Zod ile bağla (`@validation.md` kurallarını uygula)

### Adım 2 — Metin Alanlarını Ekle
- Yayınevi: text input
- Kitap Adı: text input
- Yorum: textarea — sağ alt köşede karakter sayacı (`CharacterCounter` bileşeni)

### Adım 3 — Submit İşlemini Bağla
`@comment-manager` skill'indeki `addComment()` hook'unu kullan:
- Submit sırasında buton devre dışı + spinner
- Başarıda: yeşil toast + formu sıfırla
- Hata durumunda: kırmızı toast, form korunur

### Adım 4 — Öğretmen Dashboard'una Entegre Et
`src/components/teacher/TeacherDashboard.tsx` içinde:
- "＋ Yeni Yorum" FAB butonu forma yönlendirsin (veya modal açsın)
- Form gönderildikten sonra kart listesi otomatik güncellensin
