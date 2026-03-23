---
name: cascade-dropdown
description: Kademe → Sınıf Seviyesi → Ders zincirini Supabase'den dinamik olarak çeken bağımlı dropdown bileşeni. Yorum formu oluşturulurken kullan.
---

# Cascade Dropdown Skill

## Davranış Kuralları
1. Kademe seçildiğinde → sınıf seviyeleri yüklenir, ders sıfırlanır
2. Sınıf seviyesi seçildiğinde → dersler yüklenir
3. Her değişimde bir sonraki alanın değeri sıfırlanır
4. Yükleme sırasında "Yükleniyor..." gösterilir ve alan devre dışı bırakılır
5. Hata durumunda "Veriler alınamadı, lütfen tekrar deneyin" mesajı

## Custom Hook

```typescript
// hooks/useCascadeData.ts
export function useCascadeData() {
  const [kademeler, setKademeler] = useState([])
  const [siniflar, setSiniflar] = useState([])
  const [dersler, setDersler] = useState([])
  const [loadingSinif, setLoadingSinif] = useState(false)
  const [loadingDers, setLoadingDers] = useState(false)

  // İlk yükleme
  useEffect(() => {
    supabase.from("kademeler").select("*").then(({ data }) => setKademeler(data ?? []))
  }, [])

  async function onKademeChange(kademeId: number) {
    setLoadingSinif(true)
    setSiniflar([])
    setDersler([])
    const { data } = await supabase
      .from("sinif_seviyeleri")
      .select("*")
      .eq("kademe_id", kademeId)
    setSiniflar(data ?? [])
    setLoadingSinif(false)
  }

  async function onSinifChange(sinifId: number) {
    setLoadingDers(true)
    setDersler([])
    const { data } = await supabase
      .from("dersler")
      .select("*")
      .eq("sinif_seviyesi_id", sinifId)
    setDersler(data ?? [])
    setLoadingDers(false)
  }

  return { kademeler, siniflar, dersler, loadingSinif, loadingDers, onKademeChange, onSinifChange }
}
```

## Bileşen Kullanımı

```tsx
// components/form/CascadeDropdown.tsx
export function CascadeDropdown({ control, setValue }) {
  const { kademeler, siniflar, dersler, loadingSinif, loadingDers,
          onKademeChange, onSinifChange } = useCascadeData()

  return (
    <div className="space-y-4">
      <SelectField name="kademe_id" label="Kademe *" options={kademeler}
        onChange={(id) => { setValue("sinif_seviyesi_id", ""); setValue("ders_id", ""); onKademeChange(id) }} />

      <SelectField name="sinif_seviyesi_id" label="Sınıf Seviyesi *"
        options={siniflar} loading={loadingSinif}
        onChange={(id) => { setValue("ders_id", ""); onSinifChange(id) }} />

      <SelectField name="ders_id" label="Ders *" options={dersler} loading={loadingDers} />
    </div>
  )
}
```
