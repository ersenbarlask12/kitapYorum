import { FileSpreadsheet, FileText } from 'lucide-react'
import { useExport } from '../../hooks/useExport'

export function ExportButtons({ data }) {
  const { exportToExcel, exportToPDF } = useExport()
  const disabled = !data || data.length === 0

  return (
    <div className="flex items-center gap-2" title={disabled ? 'Dışa aktarılacak veri yok' : ''}>
      <button
        onClick={() => exportToExcel(data)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        title="Excel olarak indir (.xlsx)"
      >
        <FileSpreadsheet size={16} />
        Excel
      </button>
      <button
        onClick={() => exportToPDF(data)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        title="PDF olarak indir (A4 yatay)"
      >
        <FileText size={16} />
        PDF
      </button>
    </div>
  )
}
