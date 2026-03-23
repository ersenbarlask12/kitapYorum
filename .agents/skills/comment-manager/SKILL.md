---
name: comment-manager
description: Öğretmenin kendi kitap yorumlarını listeleme, ekleme ve güncelleme işlemlerini yönetir. Öğretmen dashboard'u veya yorum formu yazılırken kullan.
---

# Comment Manager Skill

## Yetki Sınırları
- Öğretmen yalnızca kendi (`ogretmen_id = auth.uid()`) yorumlarını görebilir, ekleyebilir ve güncelleyebilir
- RLS bu kısıtı otomatik uygular; ekstra client-side kontrol gereksizdir
- Güncelleme süre sınırı yoktur

## Güncellenebilir Alanlar
| Alan | Güncellenebilir |
|---|---|
| `yorum` | ✅ |
| `yayin_evi` | ✅ |
| `kitap_adi` | ✅ |
| `kademe_id` | ❌ readonly |
| `sinif_seviyesi_id` | ❌ readonly |
| `ders_id` | ❌ readonly |

## Custom Hook

```typescript
// hooks/useComments.ts
export function useComments() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchComments() {
    const { data, error } = await supabase
      .from("kitap_yorumlari")
      .select(`*, kademeler(ad), sinif_seviyeleri(ad), dersler(ad)`)
      .order("olusturma_tarihi", { ascending: false })
    if (!error) setComments(data ?? [])
    setLoading(false)
  }

  async function addComment(payload: CommentPayload) {
    const { data, error } = await supabase
      .from("kitap_yorumlari")
      .insert({ ...payload, ogretmen_id: supabase.auth.getUser().id })
      .select()
      .single()
    if (error) throw new Error("Yorum eklenemedi. Lütfen tekrar deneyin.")
    setComments((prev) => [data, ...prev]) // optimistic update
  }

  async function updateComment(id: string, payload: UpdatePayload) {
    const { data, error } = await supabase
      .from("kitap_yorumlari")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error("Yorum güncellenemedi. Lütfen tekrar deneyin.")
    setComments((prev) => prev.map((c) => (c.id === id ? data : c))) // optimistic update
  }

  useEffect(() => { fetchComments() }, [])
  return { comments, loading, addComment, updateComment }
}
```

## Yorum Kartı Yapısı
Her kart şu bilgileri gösterir:
- Kademe / Sınıf / Ders (readonly etiket)
- Yayınevi & Kitap adı
- Yorum metni (uzunsa "Devamını gör" ile genişler)
- Oluşturma tarihi
- Güncellendiyse `✏️ Güncellendi: [tarih]` badge'i
- "Düzenle" butonu → modal açar

## Düzenleme Modalı
- `yayin_evi`, `kitap_adi`, `yorum` alanları düzenlenebilir
- `kademe`, `sinif_seviyesi`, `ders` alanları readonly metin olarak gösterilir
- Kaydet butonuna basılınca `updateComment()` çağrılır
- Başarıda modal kapanır, kart anında güncellenir (optimistic)
