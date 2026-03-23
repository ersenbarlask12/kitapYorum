# Admin Dışa Aktarma Workflow'u

## Açıklama
Admin panelinde filtrelenmiş yorum verilerini Excel veya PDF olarak dışa aktarma akışını uygular. Export butonları yazılırken çalıştır.

## Adımlar

### Adım 1 — Filtrelenmiş Veriyi Al
Admin tablosunda aktif filtreleri uygulayarak mevcut veri setini al.
Hiç filtre yoksa tüm veriler kullanılır.

### Adım 2 — Export Butonlarını Göster
`@export-manager` skill'indeki `ExportButtons` bileşenini kullan.
- Tablo üstünde sağ hizalı iki buton: "Excel İndir" ve "PDF İndir"
- Veri yoksa her iki buton devre dışı + tooltip: "Dışa aktarılacak veri yok"

### Adım 3 — Excel İçin
`exportToExcel(filteredData)` çağır:
- Tüm sütunlar dahil edilir (`guncelleme_tarihi` sütunu da)
- Dosya adı: `kitap-yorumlari-YYYY-MM-DD.xlsx`
- Tarayıcı otomatik indirme başlatır

### Adım 4 — PDF İçin
`exportToPDF(filteredData)` çağır:
- A4 yatay format
- Başlık + oluşturma tarihi damgası
- Her sayfanın altında sayfa numarası
- Yorum metni 120 karakterde kısaltılır
- Dosya adı: `kitap-yorumlari-YYYY-MM-DD.pdf`
- Tarayıcı otomatik indirme başlatır
