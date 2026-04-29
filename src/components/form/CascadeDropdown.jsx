import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { useCascadeData } from '../../hooks/useCascadeData'
import { Spinner } from '../ui/Spinner'

export function CascadeDropdown({ control, setValue, errors, disabled = false, onClassSelect }) {
  const {
    kademeler,
    siniflar,
    dersler,
    loadingKademe,
    loadingSinif,
    loadingDers,
    error: cascadeError,
    onKademeChange,
    onSinifChange,
  } = useCascadeData()

  return (
    <div className="space-y-4">
      {cascadeError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm border border-red-200">
          <AlertCircle size={16} />
          {cascadeError}
        </div>
      )}

      {/* Kademe */}
      <div>
        <label className="form-label">Kademe *</label>
        <div className="relative">
          <Controller
            name="kademe_id"
            control={control}
            render={({ field }) => (
              <select
                id="kademe_id"
                className={`form-select ${errors?.kademe_id ? 'form-input-error' : ''}`}
                disabled={disabled || loadingKademe}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val)
                  setValue('sinif_seviyesi_id', '')
                  setValue('ders_id', '')
                  if (val) onKademeChange(Number(val))
                }}
              >
                <option value="">{loadingKademe ? 'Yükleniyor...' : 'Kademe Seçin'}</option>
                {kademeler.map((k) => (
                  <option key={k.id} value={k.id}>{k.ad}</option>
                ))}
              </select>
            )}
          />
          {loadingKademe && <Spinner size="sm" className="absolute right-10 top-1/2 -translate-y-1/2" />}
        </div>
        {errors?.kademe_id && (
          <p className="form-error"><AlertCircle size={14} />{errors.kademe_id.message}</p>
        )}
      </div>

      {/* Sınıf Seviyesi */}
      <div>
        <label className="form-label">Sınıf Seviyesi *</label>
        <div className="relative">
          <Controller
            name="sinif_seviyesi_id"
            control={control}
            render={({ field }) => (
              <select
                id="sinif_seviyesi_id"
                className={`form-select ${errors?.sinif_seviyesi_id ? 'form-input-error' : ''}`}
                disabled={disabled || loadingSinif || siniflar.length === 0}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val)
                  setValue('ders_id', '')
                  if (val) {
                    onSinifChange(Number(val))
                    const selectedSinif = siniflar.find(s => s.id === Number(val))
                    if (onClassSelect) onClassSelect(selectedSinif)
                  } else {
                    if (onClassSelect) onClassSelect(null)
                  }
                }}
              >
                <option value="">
                  {loadingSinif ? 'Yükleniyor...' : siniflar.length === 0 ? 'Önce kademe seçin' : 'Sınıf Seviyesi Seçin'}
                </option>
                {siniflar.map((s) => (
                  <option key={s.id} value={s.id}>{s.ad}</option>
                ))}
              </select>
            )}
          />
          {loadingSinif && <Spinner size="sm" className="absolute right-10 top-1/2 -translate-y-1/2" />}
        </div>
        {errors?.sinif_seviyesi_id && (
          <p className="form-error"><AlertCircle size={14} />{errors.sinif_seviyesi_id.message}</p>
        )}
      </div>

      {/* Ders */}
      <div>
        <label className="form-label">Ders *</label>
        <div className="relative">
          <Controller
            name="ders_id"
            control={control}
            render={({ field }) => (
              <select
                id="ders_id"
                className={`form-select ${errors?.ders_id ? 'form-input-error' : ''}`}
                disabled={disabled || loadingDers || dersler.length === 0}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">
                  {loadingDers ? 'Yükleniyor...' : dersler.length === 0 ? 'Önce sınıf seviyesi seçin' : 'Ders Seçin'}
                </option>
                {dersler.map((d) => (
                  <option key={d.id} value={d.id}>{d.ad}</option>
                ))}
              </select>
            )}
          />
          {loadingDers && <Spinner size="sm" className="absolute right-10 top-1/2 -translate-y-1/2" />}
        </div>
        {errors?.ders_id && (
          <p className="form-error"><AlertCircle size={14} />{errors.ders_id.message}</p>
        )}
      </div>
    </div>
  )
}
