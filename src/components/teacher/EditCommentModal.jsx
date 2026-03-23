import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Save } from 'lucide-react'
import { updateCommentSchema } from '../../lib/validationSchema'
import { CharacterCounter } from '../form/CharacterCounter'
import { Spinner } from '../ui/Spinner'
import { Modal } from '../ui/Modal'

export function EditCommentModal({ comment, isOpen, onClose, onSave, isSaving }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(updateCommentSchema) })

  const yorumValue = watch('yorum', '')

  useEffect(() => {
    if (comment && isOpen) {
      reset({
        yayin_evi: comment.yayin_evi,
        kitap_adi: comment.kitap_adi,
        yorum: comment.yorum,
      })
    }
  }, [comment, isOpen, reset])

  if (!comment) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yorumu Düzenle" size="lg">
      {/* Readonly info */}
      <div className="mb-6 p-4 bg-navy-50/60 rounded-xl border border-navy-100 space-y-2">
        <p className="text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2">Sabit Bilgiler (Değiştirilemez)</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-500">Kademe</p>
            <p className="text-sm font-semibold text-navy-700">{comment.kademeler?.ad ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Sınıf</p>
            <p className="text-sm font-semibold text-navy-700">{comment.sinif_seviyeleri?.ad ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ders</p>
            <p className="text-sm font-semibold text-navy-700">{comment.dersler?.ad ?? '-'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-5" noValidate>
        {/* Yayınevi */}
        <div>
          <label className="form-label" htmlFor="edit_yayin_evi">Yayınevi *</label>
          <input
            id="edit_yayin_evi"
            type="text"
            className={`form-input ${errors.yayin_evi ? 'form-input-error' : ''}`}
            {...register('yayin_evi')}
          />
          {errors.yayin_evi && (
            <p className="form-error"><AlertCircle size={14} />{errors.yayin_evi.message}</p>
          )}
        </div>

        {/* Kitap Adı */}
        <div>
          <label className="form-label" htmlFor="edit_kitap_adi">Kitap Adı *</label>
          <input
            id="edit_kitap_adi"
            type="text"
            className={`form-input ${errors.kitap_adi ? 'form-input-error' : ''}`}
            {...register('kitap_adi')}
          />
          {errors.kitap_adi && (
            <p className="form-error"><AlertCircle size={14} />{errors.kitap_adi.message}</p>
          )}
        </div>

        {/* Yorum */}
        <div>
          <label className="form-label" htmlFor="edit_yorum">Değerlendirme Yorumu *</label>
          <textarea
            id="edit_yorum"
            rows={7}
            className={`form-input resize-none ${errors.yorum ? 'form-input-error' : ''}`}
            {...register('yorum')}
          />
          <CharacterCounter current={yorumValue.length} max={2000} />
          {errors.yorum && (
            <p className="form-error mt-2"><AlertCircle size={14} />{errors.yorum.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={isSaving}>
            İptal
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={isSaving}>
            {isSaving ? <><Spinner size="sm" />Kaydediliyor...</> : <><Save size={18} />Kaydet</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}
