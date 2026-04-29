import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Send, Star, FileText } from 'lucide-react'
import { commentSchema, storyBookSchema } from '../../lib/validationSchema'
import { CascadeDropdown } from './CascadeDropdown'
import { CharacterCounter } from './CharacterCounter'
import { Spinner } from '../ui/Spinner'
import { StoryBookFormFields } from './StoryBookFormFields'

export function CommentForm({ onSubmit, isSubmitting }) {
  const [isStoryBook, setIsStoryBook] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: async (data, context, options) => {
      const schema = isStoryBook ? storyBookSchema : commentSchema
      return zodResolver(schema)(data, context, options)
    },
    defaultValues: {
      kademe_id: '',
      sinif_seviyesi_id: '',
      ders_id: '',
      yayin_evi: '',
      kitap_adi: '',
      yorum: '',
      kullanim_puani: 0,
      
      // StoryBook defaults
      toplam_kitap_sayisi: '',
      kitap_basina_sayfa_sayisi: '',
      degerlendirme_kitapcigi_var_mi: '',
      onerilen_sinif_seviyesi: [],
      akademik_sinif_seviyesine_uygun: '',
      akademik_punto_sayfa_duzeni: '',
      akademik_metin_yogunlugu: '',
      akademik_sayfa_sayisi: '',
      akademik_deger_aktarimi: '',
      akademik_dil_sade: '',
      akademik_gorsel_kalitesi: '',
      kitapcik_ayri_degerlendirme: '',
      kitapcik_okudugunu_anlama: '',
      kitapcik_acik_uclu: '',
      kitapcik_cikarim_yorum: '',
      kitapcik_kelime_calismasi: '',
      kitapcik_cevap_anahtari: '',
      kitapcik_ogrenci_seviyesine_uygun: '',
      nihai_karar: '',
    },
  })

  const yorumValue = watch('yorum', '')
  const kullanimPuani = watch('kullanim_puani', 0)
  const [hover, setHover] = useState(0)

  async function handleFormSubmit(values) {
    await onSubmit(values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      {/* Cascade: Kademe → Sınıf → Ders */}
      <div className="p-4 bg-navy-50/50 rounded-xl border border-navy-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-navy-600 uppercase tracking-wider">Sınıf Bilgileri</p>
          {isStoryBook && (
            <span className="badge-gold text-xs flex items-center gap-1">
              <FileText size={12} />
              Hikaye Seti Modu Aktif
            </span>
          )}
        </div>
        <CascadeDropdown 
          control={control} 
          setValue={setValue} 
          errors={errors} 
          disabled={false}
          onClassSelect={(cls) => {
            const ad = cls?.ad || '';
            const isHikaye = /hikaye/i.test(ad) || /hikâye/i.test(ad);
            setIsStoryBook(isHikaye)
            if (isHikaye) setValue('ders_id', '') // Clear ders
          }}
        />
        {isStoryBook && (
          <p className="text-xs text-amber-600 mt-2">
            * Hikaye kitapları için ders seçimi zorunlu değildir. Alt kısımdaki form hikaye setlerine özel olarak değişmiştir.
          </p>
        )}
      </div>

      {isStoryBook ? (
        <StoryBookFormFields register={register} errors={errors} watch={watch} setValue={setValue} />
      ) : (
        <>
          {/* Yayınevi */}
          <div>
            <label className="form-label" htmlFor="yayin_evi">Yayınevi *</label>
            <input
              id="yayin_evi"
              type="text"
              placeholder="Örn: MEB Yayınları"
              className={`form-input ${errors.yayin_evi ? 'form-input-error' : ''}`}
              {...register('yayin_evi')}
            />
            {errors.yayin_evi && (
              <p className="form-error"><AlertCircle size={14} />{errors.yayin_evi.message}</p>
            )}
          </div>

          {/* Kitap Adı */}
          <div>
            <label className="form-label" htmlFor="kitap_adi">Kitap Adı *</label>
            <input
              id="kitap_adi"
              type="text"
              placeholder="Örn: 5. Sınıf Matematik Ders Kitabı"
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
            <label className="form-label" htmlFor="yorum">Değerlendirme Yorumu * <span className="text-gray-400 font-normal">(min. 50 karakter)</span></label>
            <textarea
              id="yorum"
              rows={6}
              placeholder="Kitap hakkındaki düşüncelerinizi, güçlü ve geliştirilmesi gereken yönlerini detaylı olarak yazınız..."
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

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Spinner size="sm" /> Kaydediliyor...</>
        ) : (
          <><Send size={18} /> Yorumu Gönder</>
        )}
      </button>
    </form>
  )
}
