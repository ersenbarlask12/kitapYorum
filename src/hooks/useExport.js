import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function buildRows(data) {
  return data.map((c) => ({
    'Tarih': formatDate(c.olusturma_tarihi),
    'Güncelleme Tarihi': c.guncelleme_tarihi ? formatDate(c.guncelleme_tarihi) : '-',
    'Öğretmen': c.ogretmen_adi ?? '-',
    'Kademe': c.kademeler?.ad ?? '-',
    'Sınıf': c.sinif_seviyeleri?.ad ?? '-',
    'Ders': c.dersler?.ad ?? '-',
    'Yayınevi': c.yayin_evi ?? '-',
    'Kitap Adı': c.kitap_adi ?? '-',
    'Yorum': c.yorum ?? '-',
  }))
}

export function exportToExcel(data) {
  if (!data?.length) return

  const rows = buildRows(data)
  const ws = XLSX.utils.json_to_sheet(rows)

  // Auto column widths
  ws['!cols'] = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? '').length)) + 2,
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Yorumlar')
  XLSX.writeFile(wb, `kitap-yorumlari-${formatDateShort(new Date().toISOString())}.xlsx`)
}

export function exportToPDF(data) {
  if (!data?.length) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFontSize(14)
  doc.setTextColor(27, 46, 94)
  doc.text('Öğretmen Kitap Değerlendirme Raporu', 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Oluşturma Tarihi: ${formatDate(new Date().toISOString())}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [['Tarih', 'Öğretmen', 'Kademe', 'Sınıf', 'Ders', 'Yayınevi', 'Kitap', 'Yorum']],
    body: data.map((c) => [
      formatDate(c.olusturma_tarihi),
      c.ogretmen_adi ?? '-',
      c.kademeler?.ad ?? '-',
      c.sinif_seviyeleri?.ad ?? '-',
      c.dersler?.ad ?? '-',
      c.yayin_evi ?? '-',
      c.kitap_adi ?? '-',
      (c.yorum ?? '').substring(0, 120) + ((c.yorum ?? '').length > 120 ? '...' : ''),
    ]),
    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [27, 46, 94], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 247, 242] },
    columnStyles: { 7: { cellWidth: 60 } },
    didDrawPage: (d) => {
      const { pageNumber } = doc.getCurrentPageInfo()
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Sayfa ${pageNumber}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 8
      )
    },
  })

  doc.save(`kitap-yorumlari-${formatDateShort(new Date().toISOString())}.pdf`)
}

export function useExport() {
  return { exportToExcel, exportToPDF }
}
