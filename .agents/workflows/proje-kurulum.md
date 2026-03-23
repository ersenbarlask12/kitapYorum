# Proje Kurulum Workflow'u

## Açıklama
Projeyi sıfırdan kurmak için gerekli tüm adımları sırayla uygular. Yeni bir ortamda projeyi ilk kez ayağa kaldırırken çalıştır.

## Adımlar

### Adım 1 — Bağımlılıkları Yükle
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install @supabase/supabase-js
npm install react-router-dom
npm install react-hook-form @hookform/resolvers zod
npm install zustand
npm install @tanstack/react-table
npm install xlsx jspdf jspdf-autotable
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Adım 2 — Tailwind & Font Yapılandır
`index.css` dosyasına Tailwind direktiflerini ve Google Fonts import'unu ekle:
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Adım 3 — Ortam Değişkenlerini Oluştur
`.env` dosyası oluştur:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=
VITE_ADMIN_PASSWORD=
```
`.gitignore`'a `.env` ekle.

### Adım 4 — Supabase Veritabanını Kur
Supabase Dashboard > SQL Editor'da `@database.md` dosyasındaki şemayı çalıştır:
- Tabloları oluştur
- Trigger'ı ekle
- RLS politikalarını uygula
- Seed verisini ekle

### Adım 5 — Klasör Yapısını Oluştur
```
src/
├── components/auth/
├── components/form/
├── components/teacher/
├── components/admin/
├── components/ui/
├── hooks/
├── lib/
├── pages/
└── store/
```

### Adım 6 — Supabase Client'larını Oluştur
`src/lib/supabase.ts` ve `src/lib/supabaseAdmin.ts` dosyalarını `@database.md`'deki şablona göre oluştur.

### Adım 7 — Router Yapısını Kur
`App.tsx`'te route'ları tanımla:
```
/ → LoginPage
/kayit → RegisterPage
/ogretmen → TeacherPage (ProtectedRoute içinde)
/admin → AdminPage
```

### Adım 8 — Geliştirme Sunucusunu Başlat
```bash
npm run dev
```
Tarayıcıda `http://localhost:5173` aç ve giriş sayfasının yüklendiğini doğrula.
