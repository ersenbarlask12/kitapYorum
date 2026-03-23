import { useState } from 'react'
import { Pencil, BookOpen, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

export function CommentCard({ comment, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = comment.yorum?.length > 200
  const isUpdated = !!comment.guncelleme_tarihi

  return (
    <div className="card card-hover flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="badge-navy">{comment.kademeler?.ad}</span>
          <span className="badge-navy">{comment.sinif_seviyeleri?.ad}</span>
          <span className="badge-gold">{comment.dersler?.ad}</span>
        </div>
        <button
          onClick={() => onEdit(comment)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-navy-600 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
          aria-label="Yorumu düzenle"
        >
          <Pencil size={14} />
          Düzenle
        </button>
      </div>

      {/* Kitap bilgisi */}
      <div className="flex items-start gap-3 p-3 bg-cream rounded-xl">
        <BookOpen className="text-gold-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{comment.kitap_adi}</p>
          <p className="text-gray-500 text-xs mt-0.5">{comment.yayin_evi}</p>
        </div>
      </div>

      {/* Yorum metni */}
      <div>
        <p className={`text-gray-700 text-sm leading-relaxed ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
          {comment.yorum}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 text-xs font-medium text-navy-600 hover:text-navy-700 transition-colors"
          >
            {expanded ? <><ChevronUp size={14} /> Daha az göster</> : <><ChevronDown size={14} /> Devamını gör</>}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={13} />
          {formatDate(comment.olusturma_tarihi)}
        </div>
        {isUpdated && (
          <span className="badge-updated">
            <Clock size={11} />
            ✏️ Güncellendi: {formatDate(comment.guncelleme_tarihi)}
          </span>
        )}
      </div>
    </div>
  )
}
