# 📚 Öğretmen Kitap Değerlendirme Sistemi — Antigravity Prompt
*Versiyon: 2.0 | Tarih: Mart 2026*

---

## 🎯 PROJE TANIMI

Öğretmenlerin ders kitapları hakkında yapılandırılmış yorum girebildiği, kendi yorumlarını güncelleyebildiği, admin panelinden tüm verilerin izlenip raporlanabildiği bir web uygulaması.

Kimlik doğrulama **TC Kimlik No + şifre** ile yapılır. Hesap açık kayıt ile oluşturulur. Yorumlar yalnızca admin tarafından görüntülenebilir; öğretmenler yalnızca kendi yorumlarını görebilir ve güncelleyebilir. Veriler Supabase üzerinde saklanır.

---

## 🏗️ MİMARİ & TEKNOLOJİ STACKİ

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Form yönetimi:** React Hook Form + Zod validasyon
- **Tablo & dışa aktarma:** TanStack Table + xlsx + jsPDF
- **Auth state:** Zustand (global oturum yönetimi)
- **HTTP istemcisi:** Supabase JS Client (`@supabase/supabase-js`)
- **Routing:** React Router v6 (korumalı route'lar ile)

### Backend & Veritabanı
- **Platform:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth — TC Kimlik No sahte e-posta formatına çevrilerek kullanılır
- **RLS (Row Level Security):** Aktif — öğretmen yalnızca kendi satırlarına erişir
- **Admin erişimi:** Özel şifre korumalı route + service_role key

---

## 🔐 AUTH AKIŞI (Önerilen Basit Yöntem)

Supabase Auth'u doğrudan kullanmak için TC Kimlik No e-posta formatına dönüştürülür:

```
TC: 12345678901  →  email: 12345678901@tcauth.local
```

Bu sayede Supabase'in standart `signUp` / `signInWithPassword` fonksiyonları kullanılır, custom JWT gerekmez.

```javascript
// Kayıt
const { data, error } = await supabase.auth.signUp({
  email: `${tcKimlikNo}@tcauth.local`,
  password: sifre,
  options: {
    data: { ad_soyad: adSoyad, tc_kimlik_no: tcKimlikNo }
  }
});

// Giriş
const { data, error } = await supabase.auth.signInWithPassword({
  email: `${tcKimlikNo}@tcauth.local`,
  password: sifre,
});
```

---

## 🗄️ VERİTABANI ŞEMASI (Supabase / PostgreSQL)

```sql
-- Kademe tablosu
CREATE TABLE kademeler (
  id SERIAL PRIMARY KEY,
  ad TEXT NOT NULL
);

-- Sınıf seviyeleri (kademeye bağlı)
CREATE TABLE sinif_seviyeleri (
  id SERIAL PRIMARY KEY,
  kademe_id INT REFERENCES kademeler(id),
  ad TEXT NOT NULL
);

-- Dersler (sınıf seviyesine bağlı)
CREATE TABLE dersler (
  id SERIAL PRIMARY KEY,
  sinif_seviyesi_id INT REFERENCES sinif_seviyeleri(id),
  ad TEXT NOT NULL
);

-- Ana yorumlar tablosu
CREATE TABLE kitap_yorumlari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ogretmen_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kademe_id INT REFERENCES kademeler(id),
  sinif_seviyesi_id INT REFERENCES sinif_seviyeleri(id),
  ders_id INT REFERENCES dersler(id),
  yayin_evi TEXT NOT NULL,
  kitap_adi TEXT NOT NULL,
  yorum TEXT NOT NULL,
  olusturma_tarihi TIMESTAMPTZ DEFAULT now(),
  guncelleme_tarihi TIMESTAMPTZ
);

-- Güncelleme zamanını otomatik tutan trigger
CREATE OR REPLACE FUNCTION set_guncelleme_tarihi()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guncelleme_tarihi = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kitap_yorumlari_guncelleme
  BEFORE UPDATE ON kitap_yorumlari
  FOR EACH ROW EXECUTE FUNCTION set_guncelleme_tarihi();

-- -----------------------------------------------
-- RLS POLİTİKALARI
-- -----------------------------------------------

ALTER TABLE kitap_yorumlari ENABLE ROW LEVEL SECURITY;

-- Öğretmen yalnızca kendi yorumunu ekleyebilir
CREATE POLICY "ogretmen_kendi_yorumunu_ekler" ON kitap_yorumlari
  FOR INSERT WITH CHECK (ogretmen_id = auth.uid());

-- Öğretmen yalnızca kendi yorumunu güncelleyebilir
CREATE POLICY "ogretmen_kendi_yorumunu_gunceller" ON kitap_yorumlari
  FOR UPDATE USING (ogretmen_id = auth.uid());

-- Öğretmen yalnızca kendi yorumlarını görebilir
CREATE POLICY "ogretmen_kendi_yorumlarini_gorur" ON kitap_yorumlari
  FOR SELECT USING (ogretmen_id = auth.uid());

-- Admin SELECT: service_role key RLS'yi otomatik bypass eder, ekstra politika gerekmez
```

### Seed Verisi

```sql
INSERT INTO kademeler (ad) VALUES
  ('Anasınıfı'), ('İlkokul'), ('Ortaokul'), ('Lise');

INSERT INTO sinif_seviyeleri (kademe_id, ad) VALUES
  (1, 'Anasınıfı'),
  (2, '1. Sınıf'), (2, '2. Sınıf'), (2, '3. Sınıf'), (2, '4. Sınıf'),
  (3, '5. Sınıf'), (3, '6. Sınıf'), (3, '7. Sınıf'), (3, '8. Sınıf'),
  (4, '9. Sınıf'), (4, '10. Sınıf'), (4, '11. Sınıf'), (4, '12. Sınıf');

INSERT INTO dersler (sinif_seviyesi_id, ad) VALUES
  (2, 'Türkçe'), (2, 'Matematik'), (2, 'Hayat Bilgisi'), (2, 'Müzik'),
  (6, 'Türkçe'), (6, 'Matematik'), (6, 'Fen Bilimleri'), (6, 'Sosyal Bilgiler'), (6, 'İngilizce'),
  (10, 'Türk Dili ve Edebiyatı'), (10, 'Matematik'), (10, 'Fizik'),
  (10, 'Kimya'), (10, 'Biyoloji'), (10, 'Tarih'), (10, 'Coğrafya'), (10, 'İngilizce');
```

---

## 👤 KULLANICI ROLLERİ & YETKİ TABLOSU

| Rol | Kayıt | Giriş | Yorum Ekleme | Kendi Yorumunu Güncelleme | Tüm Yorumları Görme |
|---|---|---|---|---|---|
| **Öğretmen** | ✅ Açık kayıt | TC + Şifre | ✅ | ✅ Süresiz | ❌ |
| **Admin** | ❌ Manuel | Özel şifre | ❌ | ❌ | ✅ |

---

## 📋 AGENT TANIMI

```
Sen bir web uygulama geliştirme agentısın. Türk eğitim sistemine yönelik,
öğretmenlerin ders kitaplarını değerlendirebildiği, TC Kimlik No ile oturum
açtığı ve kendi yorumlarını yönetebildiği bir uygulama geliştiriyorsun.
Veritabanı olarak Supabase kullanıyorsun. Aşağıdaki kurallara kesinlikle uymalısın.
```

---

## 📏 KURALLAR (Rules)

### Genel Kurallar
1. Uygulama tamamen **Türkçe** olmalıdır.
2. Kimlik doğrulama **TC Kimlik No + şifre** ile yapılır.
3. TC Kimlik No tam 11 haneli rakam olmalıdır, 0 ile başlayamaz.
4. Kayıt açıktır; herkes hesap oluşturabilir.
5. Oturum açılmadan hiçbir sayfaya erişilemez; `ProtectedRoute` zorunludur.
6. Öğretmen yalnızca **kendi yorumlarını** görebilir ve güncelleyebilir.
7. Başkasının yorumuna erişim denemesi RLS tarafından engellenir.
8. Form **sıralı ve bağımlı** çalışır: Kademe → Sınıf Seviyesi → Ders (cascade).
9. Tüm form alanları zorunludur.
10. Yorum metni **minimum 50, maksimum 2000 karakter** olmalıdır.
11. Admin şifresi `.env` dosyasında saklanır, kaynak koduna yazılmaz.
12. `service_role` key yalnızca admin işlemlerinde kullanılır.
13. Mobil uyumlu (responsive) tasarım zorunludur.

### Güncelleme Kuralları
- Güncelleme **süre sınırı yoktur**.
- Güncellenebilir alanlar: yalnızca `yorum`, `yayin_evi`, `kitap_adi`.
- `kademe`, `sinif_seviyesi`, `ders` alanları güncelleme formunda gösterilir ama **readonly** olur.
- `guncelleme_tarihi` trigger ile otomatik set edilir.
- Güncellenen yorumlarda "✏️ Güncellendi: [tarih]" etiketi gösterilir.

### Veri Doğrulama Kuralları
| Alan | Kural |
|---|---|
| `tc_kimlik_no` | 11 hane, yalnızca rakam, 0 ile başlayamaz |
| `ad_soyad` | min 5, max 100 karakter |
| `sifre` | min 8 karakter, en az 1 rakam |
| `yayin_evi` | min 2, max 150 karakter |
| `kitap_adi` | min 2, max 200 karakter |
| `yorum` | min 50, max 2000 karakter |

---

## 🔧 SKİLLER (Skills)

### Skill 1 — `AuthManager`
**Görev:** TC Kimlik No + şifre ile kayıt/giriş akışını yönetir.

**Davranış:**
- TC No `@tcauth.local` formatına çevrilerek Supabase Auth'a gönderilir
- "Beni hatırla" seçeneğiyle kalıcı oturum (localStorage)
- Hatalı girişte "TC Kimlik No veya şifre hatalı" (belirsiz mesaj — güvenlik)
- 3 hatalı denemede 30 saniyelik bekleme kilidi
- Çıkış `supabase.auth.signOut()` ile oturumu tamamen sonlandırır

### Skill 2 — `CascadeDropdown`
**Görev:** Kademe → Sınıf → Ders zincirini Supabase'den dinamik çeker.

**Davranış:**
- Her seçimde sonraki alan sıfırlanır
- Yükleme sırasında spinner gösterilir
- Hata durumunda "Veriler alınamadı, lütfen tekrar deneyin" mesajı

### Skill 3 — `FormValidator`
**Görev:** React Hook Form + Zod ile tüm alanları doğrular, Türkçe hata mesajları üretir.

### Skill 4 — `CommentManager`
**Görev:** Öğretmenin yorumlarını listeleme, ekleme ve güncelleme işlemlerini yönetir.

**Davranış:**
- Dashboard'da kart grid ile öğretmenin tüm yorumları listelenir
- "Yeni Yorum Ekle" butonu tam formu açar
- Her kart üzerinde "Düzenle" butonu; modal veya inline edit açar
- Güncelleme formunda kademe/sınıf/ders alanları readonly gösterilir
- Kayıt sonrası optimistic update ile liste anında güncellenir

### Skill 5 — `AdminAuth`
**Görev:** `/admin` route'unda `.env` şifresiyle koruma sağlar.

**Davranış:**
- sessionStorage'da oturum tutulur (sekme kapanınca sıfırlanır)
- 3 hatalı denemede 30 saniyelik kilit
- Her sayfada çıkış butonu görünür

### Skill 6 — `AdminDataTable`
**Görev:** Tüm yorumları service_role key ile çeker, filtrelenebilir tablo gösterir.

**Özellikler:**
- Kademe, sınıf, ders, tarih aralığı filtresi
- Öğretmen adı / kitap adına göre metin araması
- Sayfalama (50 kayıt/sayfa)
- Sütunlar: Tarih | Güncelleme | Öğretmen | Kademe | Sınıf | Ders | Yayınevi | Kitap | Yorum
- Güncellenmiş yorumlarda sarı "✏️ Güncellendi" badge'i

### Skill 7 — `ExportManager`
**Görev:** Filtrelenmiş veya tüm veriyi Excel (.xlsx) ve PDF olarak dışa aktarır.

- **Excel:** Tüm sütunlar, otomatik genişlik, başlık satırı kalın, güncelleme tarihi dahil
- **PDF:** A4 yatay, tablo formatı, başlık + oluşturma tarihi damgası, sayfa numarası

---

## 🔄 WORKFLOW

```
[KAYIT AKIŞI]
     |
     v
[Kayıt Ol sayfası]
  → TC Kimlik No (11 hane)
  → Ad Soyad
  → Şifre + Şifre Tekrar
     |
     +--> [Validasyon Hatası] → Hata mesajları gösterilir
     |
     +--> [Başarılı] → Supabase signUp → Giriş sayfasına yönlendir

[GİRİŞ AKIŞI]
     |
     v
[Giriş sayfası]
  → TC Kimlik No
  → Şifre
  → [Beni Hatırla]
     |
     +--> [Hatalı / 3 deneme] → Kilit (30 sn)
     |
     +--> [Başarılı] → JWT alınır → Öğretmen paneline yönlendir

[ÖĞRETMEN PANELİ]
     |
     v
[Yorumlarım → Kart grid]
     |
     +--> [Yeni Yorum Ekle]
     |         |
     |    [Kademe → Sınıf → Ders (cascade)]
     |    [Yayınevi & Kitap adı]
     |    [Yorum (karakter sayacı)]
     |    [Gönder] → INSERT → Liste güncellenir
     |
     +--> [Düzenle butonu]
               |
          [Yayınevi / Kitap adı / Yorum düzenlenebilir]
          [Kademe / Sınıf / Ders → READONLY]
               |
          [Kaydet] → UPDATE → guncelleme_tarihi otomatik set

[ADMIN AKIŞI]
     |
     v
[/admin → Şifre ekranı]
     |
     +--> [Doğru şifre] → Admin Dashboard
               |
          [service_role ile tüm yorumlar]
          [Filtrele / Ara / Sırala]
          [Excel veya PDF Export]
```

---

## 🎨 TASARIM KRİTERLERİ

- **Ton:** Kurumsal ama sıcak — eğitim teması
- **Renk paleti:** Koyu lacivert `#1B2E5E`, altın sarısı `#F0A500`, kırık beyaz `#F8F7F2`
- **Tipografi:** Başlıklar `Playfair Display`, gövde `Source Sans 3`
- **İkonlar:** Lucide React
- **Auth sayfaları:** Ortalanmış kart, üstte okul simgesi
- **Öğretmen paneli:** Kart grid, "Yeni Ekle" FAB butonu, her kartta düzenle ikonu
- **Admin:** Koyu sidebar, veri yoğun tablo, filtre paneli açılır/kapanır

---

## 📁 KLASÖR YAPISI

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── form/
│   │   ├── CommentForm.jsx
│   │   ├── CascadeDropdown.jsx
│   │   └── CharacterCounter.jsx
│   ├── teacher/
│   │   ├── TeacherDashboard.jsx
│   │   ├── CommentCard.jsx
│   │   └── EditCommentModal.jsx
│   ├── admin/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── DataTable.jsx
│   │   ├── FilterPanel.jsx
│   │   └── ExportButtons.jsx
│   └── ui/
│       ├── Toast.jsx
│       ├── Spinner.jsx
│       └── Modal.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCascadeData.js
│   ├── useComments.js
│   ├── useAdminAuth.js
│   └── useExport.js
├── lib/
│   ├── supabase.js              # anon key
│   ├── supabaseAdmin.js         # service_role key
│   └── validationSchema.js      # Zod şemaları
├── store/
│   └── authStore.js             # Zustand auth state
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── TeacherPage.jsx
│   └── AdminPage.jsx
└── App.jsx
```

---

## ⚙️ ORTAM DEĞİŞKENLERİ (.env)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Yalnızca admin paneli
VITE_ADMIN_PASSWORD=gizli_admin_sifresi
```

> ⚠️ `service_role` key ve `ADMIN_PASSWORD` asla public repo'ya yüklenmemeli. `.gitignore`'a ekle.

---

## ✅ KABUL KRİTERLERİ (Definition of Done)

### Auth
- [ ] TC Kimlik No 11 hane & 0 ile başlayamaz kuralı çalışıyor
- [ ] Şifre gücü kontrol ediliyor (min 8 karakter, 1 rakam)
- [ ] Kayıt başarılı → giriş sayfasına yönlendirme
- [ ] Hatalı girişte belirsiz hata mesajı
- [ ] 3 hatalı denemede geçici kilit
- [ ] `ProtectedRoute` oturumsuz erişimi engelliyor

### Öğretmen Paneli
- [ ] Yalnızca kendi yorumları listeleniyor (RLS doğrulandı)
- [ ] Cascade dropdown dinamik çalışıyor
- [ ] Yorum ekleme Supabase'e kaydediliyor
- [ ] Güncelleme formunda kademe/sınıf/ders readonly
- [ ] `guncelleme_tarihi` trigger çalışıyor
- [ ] Güncelleme badge'i görünüyor

### Admin
- [ ] Şifre koruması aktif, 3 denemede kilit
- [ ] Tüm yorumlar service_role ile listeleniyor
- [ ] Filtreleme ve arama çalışıyor
- [ ] Excel export doğru formatlı
- [ ] PDF export A4 yatay, başlıklı, sayfa numaralı

### Genel
- [ ] RLS politikaları test edildi
- [ ] Tüm metinler Türkçe
- [ ] Mobil uyumlu (320px+)
- [ ] .env dosyası dokümante edildi ve .gitignore'a eklendi

---

*Bu prompt Antigravity platformunda kullanılmak üzere hazırlanmıştır.*
*Versiyon: 2.0 | Tarih: Mart 2026*
