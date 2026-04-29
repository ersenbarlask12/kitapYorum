import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Save, Star } from 'lucide-react'
import { updateCommentSchema, storyBookSchema } from '../../lib/validationSchema'
import { CharacterCounter } from '../form/CharacterCounter'
import { Spinner } from '../ui/Spinner'
import { Modal } from '../ui/Modal'
import { StoryBookFormFields } from '../form/StoryBookFormFields'
import { FileText } from 'lucide-react'

export function EditCommentModal({ comment, isOpen, onClose, onSave, isSaving }) {
  const isStoryBook = Boolean(comment?.ekstra_form_verisi)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ 
    resolver: async (data, context, options) => {
      const schema = isStoryBook 
        ? storyBookSchema.omit({ kademe_id: true, sinif_seviyesi_id: true, ders_id: true }) 
        : updateCommentSchema
      return zodResolver(schema)(data, context, options)
    }
  })

  const yorumValue = watch('yorum', '')
  const kullanimPuani = watch('kullanim_puani', 0)
  const [hover, setHover] = useState(0)

  useEffect(() => {
    if (comment && isOpen) {
      const baseValues = {
        yayin_evi: comment.yayin_evi,
        kitap_adi: comment.kitap_adi,
        yorum: comment.yorum,
        kullanim_puani: comment.kullanim_puani || 0,
      }
      
      if (comment.ekstra_form_verisi) {
        reset({ ...baseValues, ...comment.ekstra_form_verisi })
      } else {
        reset(baseValues)
      }
      setHover(0)
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
        {isStoryBook ? (
          <div className="mt-4 border-t border-gray-100 pt-4">
             <div className="flex items-center gap-2 mb-4">
                <FileText className="text-gold-500" size={18} />
                <span className="text-sm font-medium text-gold-600">Hikaye Seti Modu Aktif</span>
             </div>
            <StoryBookFormFields register={register} errors={errors} watch={watch} setValue={setValue} />
          </div>
        ) : (
          <>
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

            {/* Kitabı Kullanırım Değerlendirmesi */}
            <div>
              <label className="form-label mb-2">Bu kitabı derslerinizde kullanır mısınız? *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('kullanim_puani', star, { shouldValidate: true })}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={28} 
                      className={`transition-colors ${
                        (hover || kullanimPuani) >= star 
                          ? 'text-gold-500 fill-gold-500' 
                          : 'text-gray-200'
                      }`} 
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm font-medium text-gray-500">
                  {kullanimPuani > 0 ? `${kullanimPuani} Yıldız` : 'Puan Veriniz'}
                </span>
              </div>
              {errors.kullanim_puani && (
                <p className="form-error mt-2"><AlertCircle size={14} />{errors.kullanim_puani.message}</p>
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
          </>
        )}

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
