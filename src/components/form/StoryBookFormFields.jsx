import { AlertCircle } from 'lucide-react'
import { CharacterCounter } from './CharacterCounter'

export function StoryBookFormFields({ register, errors, watch }) {
  const yorumValue = watch('yorum', '')

  const akademikKriterler = [
    { id: 'akademik_sinif_seviyesine_uygun', label: 'Sınıf seviyesine uygun' },
    { id: 'akademik_punto_sayfa_duzeni', label: 'Punto ve sayfa düzeni uygun' },
    { id: 'akademik_metin_yogunlugu', label: 'Metin yoğunluğu uygun' },
    { id: 'akademik_sayfa_sayisi', label: 'Sayfa sayısı uygun' },
    { id: 'akademik_deger_aktarimi', label: 'Değer aktarımı olumlu' },
    { id: 'akademik_dil_sade', label: 'Dil sade ve anlaşılır' },
    { id: 'akademik_gorsel_kalitesi', label: 'Görsel kalitesi yeterli' },
  ]

  const kitapcikKriterleri = [
    { id: 'kitapcik_ayri_degerlendirme', label: 'Her kitap için ayrı değerlendirme var' },
    { id: 'kitapcik_okudugunu_anlama', label: 'Okuduğunu anlama soruları yeterli' },
    { id: 'kitapcik_acik_uclu', label: 'Açık uçlu sorular mevcut' },
    { id: 'kitapcik_cikarim_yorum', label: 'Çıkarım / yorum soruları var' },
    { id: 'kitapcik_kelime_calismasi', label: 'Kelime çalışması içeriyor' },
    { id: 'kitapcik_cevap_anahtari', label: 'Cevap anahtarı mevcut' },
    { id: 'kitapcik_ogrenci_seviyesine_uygun', label: 'Öğrenci seviyesine uygun zorlukta' },
  ]

  const sinifSeviyeleri = [
    '1. Sınıf (1. Dönem)',
    '1. Sınıf (2. Dönem)',
    '2. Sınıf',
    '3. Sınıf',
    '4. Sınıf'
  ]

  const nihaiKararlar = [
    'Set bütün olarak uygundur',
    'Değerlendirme kitabı yetersiz',
    'Sadece belirli sınıf için uygundur',
    'Uygun değildir'
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Kitap Seti Bilgileri */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-navy-800 border-b border-gray-100 pb-2 mb-4">Kitap Seti Bilgileri</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="kitap_adi">Set Adı *</label>
            <input
              id="kitap_adi"
              type="text"
              placeholder="Örn: Mucitler Serisi"
              className={`form-input ${errors.kitap_adi ? 'form-input-error' : ''}`}
              {...register('kitap_adi')}
            />
            {errors.kitap_adi && <p className="form-error"><AlertCircle size={14} />{errors.kitap_adi.message}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="yayin_evi">Yayınevi *</label>
            <input
              id="yayin_evi"
              type="text"
              placeholder="Örn: ABC Yayınları"
              className={`form-input ${errors.yayin_evi ? 'form-input-error' : ''}`}
              {...register('yayin_evi')}
            />
            {errors.yayin_evi && <p className="form-error"><AlertCircle size={14} />{errors.yayin_evi.message}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="toplam_kitap_sayisi">Toplam Kitap Sayısı *</label>
            <input
              id="toplam_kitap_sayisi"
              type="number"
              className={`form-input ${errors.toplam_kitap_sayisi ? 'form-input-error' : ''}`}
              {...register('toplam_kitap_sayisi')}
            />
            {errors.toplam_kitap_sayisi && <p className="form-error"><AlertCircle size={14} />{errors.toplam_kitap_sayisi.message}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="kitap_basina_sayfa_sayisi">Kitap Başına Sayfa Sayısı *</label>
            <input
              id="kitap_basina_sayfa_sayisi"
              type="number"
              className={`form-input ${errors.kitap_basina_sayfa_sayisi ? 'form-input-error' : ''}`}
              {...register('kitap_basina_sayfa_sayisi')}
            />
            {errors.kitap_basina_sayfa_sayisi && <p className="form-error"><AlertCircle size={14} />{errors.kitap_basina_sayfa_sayisi.message}</p>}
          </div>
        </div>

        <div className="pt-2">
          <label className="form-label mb-2">Değerlendirme Kitapçığı Var mı? *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Evet" {...register('degerlendirme_kitapcigi_var_mi')} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
              <span className="text-sm font-medium text-gray-700">Evet</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="Hayır" {...register('degerlendirme_kitapcigi_var_mi')} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
              <span className="text-sm font-medium text-gray-700">Hayır</span>
            </label>
          </div>
          {errors.degerlendirme_kitapcigi_var_mi && <p className="form-error"><AlertCircle size={14} />{errors.degerlendirme_kitapcigi_var_mi.message}</p>}
        </div>

        <div className="pt-2">
          <label className="form-label mb-2">Önerilen Sınıf Seviyesi *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sinifSeviyeleri.map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" value={s} {...register('onerilen_sinif_seviyesi')} className="w-4 h-4 text-navy-600 focus:ring-navy-500 rounded" />
                <span className="text-sm font-medium text-gray-700">{s}</span>
              </label>
            ))}
          </div>
          {errors.onerilen_sinif_seviyesi && <p className="form-error"><AlertCircle size={14} />{errors.onerilen_sinif_seviyesi.message}</p>}
        </div>
      </div>

      {/* 2. Akademik Uygunluk Değerlendirmesi */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-navy-800 border-b border-gray-100 pb-2 mb-4">Akademik Uygunluk Değerlendirmesi</h3>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Kriter</th>
              <th className="py-2 font-medium text-center w-24">Uygun</th>
              <th className="py-2 font-medium text-center w-24">Kısmen</th>
              <th className="py-2 font-medium text-center w-24">Uygun Değil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {akademikKriterler.map(kriter => (
              <tr key={kriter.id} className="hover:bg-gray-50">
                <td className="py-3 text-gray-700">
                  {kriter.label}
                  {errors[kriter.id] && <span className="text-red-500 ml-2">*</span>}
                </td>
                <td className="py-3 text-center">
                  <input type="radio" value="Uygun" {...register(kriter.id)} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
                </td>
                <td className="py-3 text-center">
                  <input type="radio" value="Kısmen" {...register(kriter.id)} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
                </td>
                <td className="py-3 text-center">
                  <input type="radio" value="Uygun Değil" {...register(kriter.id)} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Değerlendirme Kitapçığı Kriterleri */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-navy-800 border-b border-gray-100 pb-2 mb-4">Değerlendirme Kitapçığı Kriterleri</h3>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b border-gray-200">
              <th className="py-2 font-medium">Kriter</th>
              <th className="py-2 font-medium text-center w-24">Var</th>
              <th className="py-2 font-medium text-center w-24">Kısmen</th>
              <th className="py-2 font-medium text-center w-24">Yok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {kitapcikKriterleri.map(kriter => (
              <tr key={kriter.id} className="hover:bg-gray-50">
                <td className="py-3 text-gray-700">
                  {kriter.label}
                  {errors[kriter.id] && <span className="text-red-500 ml-2">*</span>}
                </td>
                <td className="py-3 text-center">
                  <input type="radio" value="Var" {...register(kriter.id)} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
                </td>
                <td className="py-3 text-center">
                  <input type="radio" value="Kısmen" {...register(kriter.id)} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
                </td>
                <td className="py-3 text-center">
                  <input type="radio" value="Yok" {...register(kriter.id)} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Nihai Karar */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-navy-800 border-b border-gray-100 pb-2 mb-4">Nihai Karar</h3>
        <div className="space-y-3">
          {nihaiKararlar.map(k => (
            <label key={k} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <input type="radio" value={k} {...register('nihai_karar')} className="w-4 h-4 text-navy-600 focus:ring-navy-500" />
              <span className="text-sm font-medium text-gray-800">{k}</span>
            </label>
          ))}
        </div>
        {errors.nihai_karar && <p className="form-error"><AlertCircle size={14} />{errors.nihai_karar.message}</p>}
      </div>

      {/* 5. Öğretmen Görüşü */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-navy-800 border-b border-gray-100 pb-2 mb-4">Öğretmen Görüşü</h3>
        <div>
          <label className="form-label" htmlFor="yorum">
            Kitap setinin pedagojik ve edebi açıdan detaylı analizi * 
            <span className="text-gray-400 font-normal ml-1">(min. 50 karakter)</span>
          </label>
          <textarea
            id="yorum"
            rows={6}
            placeholder="Görüşlerinizi detaylı bir şekilde yazınız..."
            className={`form-input resize-none ${errors.yorum ? 'form-input-error' : ''}`}
            {...register('yorum')}
          />
          <CharacterCounter current={yorumValue.length} max={2000} />
          {errors.yorum && <p className="form-error mt-2"><AlertCircle size={14} />{errors.yorum.message}</p>}
        </div>
      </div>
    </div>
  )
}
