---
name: admin-panel
description: Admin paneli giriş koruması, tüm yorumları listeleme, filtreleme ve arama özelliklerini yönetir. /admin route'u veya admin bileşenleri yazılırken kullan.
---

# Admin Panel Skill

## Giriş Koruması
- `/admin` route'u şifre ile korunur (`VITE_ADMIN_PASSWORD`)
- Oturum `sessionStorage`'da tutulur (sekme kapanınca sıfırlanır)
- 3 hatalı denemede 30 saniye kilit

```typescript
// hooks/useAdminAuth.ts
export function useAdminAuth() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "true"
  )
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState<number | null>(null)

  function login(password: string) {
    if (lockUntil && Date.now() < lockUntil) return false
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true")
      setAuthenticated(true)
      setAttempts(0)
      return true
    }
    const next = attempts + 1
    setAttempts(next)
    if (next >= 3) setLockUntil(Date.now() + 30_000)
    return false
  }

  function logout() {
    sessionStorage.removeItem("admin_auth")
    setAuthenticated(false)
  }

  return { authenticated, login, logout, lockUntil }
}
```

## Veri Çekme (service_role)
Admin tüm yorumları `supabaseAdmin` client ile çeker — RLS bypass edilir.

```typescript
const { data } = await supabaseAdmin
  .from("kitap_yorumlari")
  .select(`
    *,
    kademeler(ad),
    sinif_seviyeleri(ad),
    dersler(ad),
    auth.users!ogretmen_id(raw_user_meta_data)
  `)
  .order("olusturma_tarihi", { ascending: false })
```

## Filtre Seçenekleri
- Kademe (dropdown)
- Sınıf seviyesi (dropdown, kademeye bağlı)
- Ders (dropdown)
- Tarih aralığı (başlangıç - bitiş)
- Metin arama: öğretmen adı veya kitap adında

## Tablo Sütunları
| Sütun | Açıklama |
|---|---|
| Tarih | `olusturma_tarihi` |
| Güncelleme | `guncelleme_tarihi` — varsa sarı badge |
| Öğretmen | `raw_user_meta_data.ad_soyad` |
| Kademe | `kademeler.ad` |
| Sınıf | `sinif_seviyeleri.ad` |
| Ders | `dersler.ad` |
| Yayınevi | `yayin_evi` |
| Kitap | `kitap_adi` |
| Yorum | İlk 80 karakter + "..." → tıklanınca modal'da tam metin |

## Sayfalama
- 50 kayıt/sayfa
- TanStack Table `useReactTable` ile pagination
