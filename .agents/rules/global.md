# Global Kurallar — Öğretmen Kitap Değerlendirme Sistemi

## Proje Bağlamı
Türk eğitim sistemine yönelik bir web uygulaması. Öğretmenler TC Kimlik No + şifre ile giriş yapar, ders kitaplarını değerlendirir, kendi yorumlarını yönetir. Admin tüm verileri görür ve dışa aktarır.

## Teknoloji Stacki
- React (Vite) + Tailwind CSS
- React Hook Form + Zod (form validasyon)
- Zustand (auth state)
- Supabase JS Client (`@supabase/supabase-js`)
- React Router v6
- TanStack Table + xlsx + jsPDF (admin panel)
- Lucide React (ikonlar)

## Kesin Kurallar

### Dil
- Tüm UI metinleri, hata mesajları, placeholder'lar, etiketler Türkçe olacak
- Kod içi yorum ve değişken isimleri İngilizce kalabilir

### Güvenlik
- `service_role` key ASLA client bundle'a dahil edilmez; yalnızca admin işlemlerinde kullanılır
- Admin şifresi ASLA kaynak koduna yazılmaz; `.env` dosyasından okunur
- TC Kimlik No hatalı giriş mesajı belirsiz olmalı: "TC Kimlik No veya şifre hatalı" (hangisinin yanlış olduğu belirtilmez)
- RLS politikaları her tabloda aktif olmalı

### Ortam Değişkenleri (.env)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=
VITE_ADMIN_PASSWORD=
```
`.env` dosyası `.gitignore`'a eklenmiş olmalı.

### Supabase Auth — TC Kimlik No
TC Kimlik No doğrudan e-posta alanına yazılamaz. Şu dönüşüm kullanılır:
```
TC: 12345678901  →  email: 12345678901@tcauth.local
```
Standart `supabase.auth.signUp()` ve `supabase.auth.signInWithPassword()` fonksiyonları bu formatla kullanılır.

### Kod Kalitesi
- Her bileşen tek sorumluluk prensibine uymalı
- Custom hook'lar `use` prefix'iyle adlandırılmalı
- Supabase hataları her zaman try/catch ile yakalanmalı ve Türkçe mesaj gösterilmeli
- Loading state'ler her async işlemde gösterilmeli
- Mobil uyumlu (responsive) tasarım zorunlu — minimum 320px genişlik desteklenmeli
