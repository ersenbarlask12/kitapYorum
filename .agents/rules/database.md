# Veritabanı & RLS Kuralları

## Aktivasyon
Supabase tabloları, RLS politikaları veya veritabanı sorguları yazılırken uygulanır.

## Tablo Yapısı

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

-- Güncelleme trigger
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
```

## RLS Politikaları

```sql
ALTER TABLE kitap_yorumlari ENABLE ROW LEVEL SECURITY;

-- Öğretmen yalnızca kendi yorumunu ekleyebilir
CREATE POLICY "ogretmen_insert" ON kitap_yorumlari
  FOR INSERT WITH CHECK (ogretmen_id = auth.uid());

-- Öğretmen yalnızca kendi yorumlarını görebilir
CREATE POLICY "ogretmen_select" ON kitap_yorumlari
  FOR SELECT USING (ogretmen_id = auth.uid());

-- Öğretmen yalnızca kendi yorumunu güncelleyebilir
CREATE POLICY "ogretmen_update" ON kitap_yorumlari
  FOR UPDATE USING (ogretmen_id = auth.uid());

-- kademeler, sinif_seviyeleri, dersler: herkese SELECT açık
ALTER TABLE kademeler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON kademeler FOR SELECT USING (true);

ALTER TABLE sinif_seviyeleri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON sinif_seviyeleri FOR SELECT USING (true);

ALTER TABLE dersler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON dersler FOR SELECT USING (true);
```

## Güncelleme Kısıtlaması
- Güncellenebilir alanlar: `yayin_evi`, `kitap_adi`, `yorum`
- `kademe_id`, `sinif_seviyesi_id`, `ders_id` güncelleme formunda gösterilir ama değiştirilemez (readonly)
- Güncelleme süre sınırı yoktur

## Supabase Client Kullanımı

```typescript
// lib/supabase.ts — anon key (öğretmen işlemleri)
import { createClient } from "@supabase/supabase-js"
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// lib/supabaseAdmin.ts — service_role key (YALNIZCA admin paneli)
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)
```
