import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Modal } from '../ui/Modal'

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function DataTable({ data }) {
  const [sorting, setSorting] = useState([{ id: 'olusturma_tarihi', desc: true }])
  const [viewComment, setViewComment] = useState(null)

  const columns = useMemo(() => [
    {
      accessorKey: 'olusturma_tarihi',
      header: 'Tarih',
      cell: ({ getValue }) => <span className="whitespace-nowrap text-xs">{formatDate(getValue())}</span>,
      size: 120,
    },
    {
      accessorKey: 'guncelleme_tarihi',
      header: 'Güncelleme',
      cell: ({ getValue }) => getValue() ? (
        <span className="badge-updated text-[10px] leading-none">
          ✏️ {formatDate(getValue())}
        </span>
      ) : <span className="text-gray-300 text-xs">—</span>,
      size: 130,
    },
    {
      accessorKey: 'ogretmen_adi',
      header: 'Öğretmen',
      cell: ({ getValue }) => <span className="font-medium text-xs whitespace-nowrap">{getValue() ?? '-'}</span>,
      size: 130,
    },
    {
      id: 'kademe',
      header: 'Kademe',
      accessorFn: (row) => row.kademeler?.ad ?? '-',
      cell: ({ getValue }) => <span className="badge-navy text-[10px]">{getValue()}</span>,
      size: 90,
    },
    {
      id: 'sinif',
      header: 'Sınıf',
      accessorFn: (row) => row.sinif_seviyeleri?.ad ?? '-',
      cell: ({ getValue }) => <span className="text-xs whitespace-nowrap">{getValue()}</span>,
      size: 90,
    },
    {
      id: 'ders',
      header: 'Ders',
      accessorFn: (row) => row.dersler?.ad ?? '-',
      cell: ({ getValue }) => <span className="badge-gold text-[10px]">{getValue()}</span>,
      size: 100,
    },
    {
      accessorKey: 'yayin_evi',
      header: 'Yayınevi',
      cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
      size: 120,
    },
    {
      accessorKey: 'kitap_adi',
      header: 'Kitap',
      cell: ({ getValue }) => <span className="text-xs font-medium">{getValue()}</span>,
      size: 150,
    },
    {
      accessorKey: 'yorum',
      header: 'Yorum',
      cell: ({ getValue, row }) => {
        const text = getValue() ?? ''
        return (
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-600 line-clamp-2">
              {text.length > 80 ? text.substring(0, 80) + '...' : text}
            </span>
            {text.length > 80 && (
              <button
                onClick={() => setViewComment(row.original)}
                className="flex-shrink-0 p-1 text-navy-600 hover:text-navy-800 hover:bg-navy-50 rounded transition-colors"
                title="Tam yorumu görüntüle"
              >
                <Eye size={14} />
              </button>
            )}
          </div>
        )
      },
      size: 260,
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  const SortIcon = ({ column }) => {
    if (!column.getCanSort()) return null
    if (column.getIsSorted() === 'asc') return <ChevronUp size={12} />
    if (column.getIsSorted() === 'desc') return <ChevronDown size={12} />
    return <ChevronsUpDown size={12} className="opacity-40" />
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.column.columnDef.size }}
                    className={header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-navy-700' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIcon column={header.column} />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                  Gösterilecek veri bulunamadı.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600 flex-wrap gap-3">
        <p>
          Toplam <strong>{data.length}</strong> kayıt |
          Sayfa <strong>{table.getState().pagination.pageIndex + 1}</strong> / <strong>{table.getPageCount()}</strong>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Önceki
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sonraki <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* View Full Comment Modal */}
      <Modal isOpen={!!viewComment} onClose={() => setViewComment(null)} title="Tam Yorum" size="md">
        {viewComment && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="badge-navy">{viewComment.kademeler?.ad}</span>
              <span className="badge-navy">{viewComment.sinif_seviyeleri?.ad}</span>
              <span className="badge-gold">{viewComment.dersler?.ad}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Kitap</p>
              <p className="font-semibold text-gray-800">{viewComment.kitap_adi} <span className="font-normal text-gray-500">— {viewComment.yayin_evi}</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Öğretmen</p>
              <p className="text-sm text-gray-700">{viewComment.ogretmen_adi}</p>
            </div>
            <div className="p-4 bg-cream rounded-xl">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{viewComment.yorum}</p>
            </div>
            {viewComment.guncelleme_tarihi && (
              <p className="badge-updated">✏️ Güncellendi: {formatDate(viewComment.guncelleme_tarihi)}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
