# Yorum Güncelleme Workflow'u

## Açıklama
Öğretmenin mevcut bir yorumu düzenleme akışını uygular. EditCommentModal veya inline edit bileşeni yazılırken çalıştır.

## Adımlar

### Adım 1 — Düzenleme Modalını Oluştur
`src/components/teacher/EditCommentModal.tsx` bileşenini oluştur.
Prop olarak mevcut yorum verisini al.

### Adım 2 — Readonly Alanları Göster
Şu alanlar düzenlenemez, sadece bilgi olarak gösterilir:
- Kademe adı
- Sınıf seviyesi adı
- Ders adı

```tsx
<div className="text-sm text-gray-500 bg-gray-50 rounded p-3">
  <span>{comment.kademeler.ad}</span> /
  <span>{comment.sinif_seviyeleri.ad}</span> /
  <span>{comment.dersler.ad}</span>
  <p className="text-xs mt-1 text-amber-600">Bu alanlar değiştirilemez.</p>
</div>
```

### Adım 3 — Düzenlenebilir Alanları Bağla
React Hook Form ile sadece şu alanları bağla:
- `yayin_evi` (mevcut değerle ön dolduralı)
- `kitap_adi` (mevcut değerle ön dolduralı)
- `yorum` (mevcut değerle ön dolduralı, karakter sayacı ile)

`@validation.md` kurallarını uygula.

### Adım 4 — Güncelleme İşlemini Bağla
`@comment-manager` skill'indeki `updateComment()` hook'unu kullan:
- Kaydet butonuna basılınca `updateComment(id, { yayin_evi, kitap_adi, yorum })` çağrılır
- Başarıda: modal kapanır, kart anında güncellenir (optimistic update)
- `guncelleme_tarihi` veritabanı trigger'ı tarafından otomatik set edilir
- Kart üzerinde `✏️ Güncellendi` badge'i görünür hale gelir
- Hata durumunda: modal açık kalır, kırmızı hata mesajı gösterilir
