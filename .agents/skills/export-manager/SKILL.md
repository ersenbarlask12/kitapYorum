---
name: export-manager
description: Admin panelindeki yorum verilerini Excel (.xlsx) ve PDF formatında dışa aktarır. Export butonları veya indirme işlemleri yazılırken kullan.
---

# Export Manager Skill

## Kütüphaneler
```
xlsx       — Excel export
jsPDF      — PDF oluşturma
jspdf-autotable — PDF tablo formatı
```

## Excel Export

```typescript
// hooks/useExport.ts
import * as XLSX from "xlsx"

export function exportToExcel(data: Comment[]) {
  const rows = data.map((c) => ({
    "Tarih": formatDate(c.olusturma_tarihi),
    "Güncelleme Tarihi": c.guncelleme_tarihi ? formatDate(c.guncelleme_tarihi) : "-",
    "Öğretmen": c.ogretmen_adi,
    "Kademe": c.kademeler?.ad,
    "Sınıf": c.sinif_seviyeleri?.ad,
    "Ders": c.dersler?.ad,
    "Yayınevi": c.yayin_evi,
    "Kitap Adı": c.kitap_adi,
    "Yorum": c.yorum,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Otomatik sütun genişliği
  ws["!cols"] = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length)) + 2
  }))

  // Başlık satırı kalın
  const headerRange = XLSX.utils.decode_range(ws["!ref"]!)
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })]
    if (cell) cell.s = { font: { bold: true } }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Yorumlar")
  XLSX.writeFile(wb, `kitap-yorumlari-${formatDate(new Date())}.xlsx`)
}
```

## PDF Export

```typescript
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function exportToPDF(data: Comment[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

  // Başlık
  doc.setFontSize(14)
  doc.text("Öğretmen Kitap Değerlendirme Raporu", 14, 16)
  doc.setFontSize(9)
  doc.text(`Oluşturma Tarihi: ${formatDate(new Date())}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [["Tarih", "Öğretmen", "Kademe", "Sınıf", "Ders", "Yayınevi", "Kitap", "Yorum"]],
    body: data.map((c) => [
      formatDate(c.olusturma_tarihi),
      c.ogretmen_adi,
      c.kademeler?.ad,
      c.sinif_seviyeleri?.ad,
      c.dersler?.ad,
      c.yayin_evi,
      c.kitap_adi,
      c.yorum.substring(0, 120) + (c.yorum.length > 120 ? "..." : ""),
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [27, 46, 94], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 247, 242] },
    didDrawPage: (d) => {
      // Sayfa numarası
      doc.setFontSize(8)
      doc.text(`Sayfa ${doc.getCurrentPageInfo().pageNumber}`,
        doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 8)
    }
  })

  doc.save(`kitap-yorumlari-${formatDate(new Date())}.pdf`)
}
```

## UI — Export Butonları
```tsx
<div className="flex gap-2">
  <button onClick={() => exportToExcel(filteredData)}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
    <FileSpreadsheet size={16} /> Excel İndir
  </button>
  <button onClick={() => exportToPDF(filteredData)}
    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
    <FileText size={16} /> PDF İndir
  </button>
</div>
```

- Export işlemi filtrelenmiş veriyi kullanır
- Hiç veri yoksa butonlar devre dışı bırakılır ve "Dışa aktarılacak veri yok" tooltip'i gösterilir
