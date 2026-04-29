import { useState, useEffect } from 'react'
import { Filter, X, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function FilterPanel({ filters, onChange, onReset, publishers = [] }) {
  const [kademeler, setKademeler] = useState([])
  const [siniflar, setSiniflar] = useState([])
  const [dersler, setDersler] = useState([])

  useEffect(() => {
    supabase.from('kademeler').select('*').order('id').then(({ data }) => setKademeler(data ?? []))
  }, [])

  useEffect(() => {
    if (filters.kademe_id) {
      supabase.from('sinif_seviyeleri').select('*').eq('kademe_id', filters.kademe_id).order('id')
        .then(({ data }) => setSiniflar(data ?? []))
    } else {
      setSiniflar([])
    }
  }, [filters.kademe_id])

  useEffect(() => {
    if (filters.sinif_seviyesi_id) {
      supabase.from('dersler').select('*').eq('sinif_seviyesi_id', filters.sinif_seviyesi_id).order('id')
        .then(({ data }) => setDersler(data ?? []))
    } else {
      setDersler([])
    }
  }, [filters.sinif_seviyesi_id])

  function handleChange(key, value) {
    const update = { [key]: value }
    if (key === 'kademe_id') { update.sinif_seviyesi_id = ''; update.ders_id = '' }
    if (key === 'sinif_seviyesi_id') { update.ders_id = '' }
    onChange(update)
  }

  const hasActive = Object.values(filters).some(v => v !== '')

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy-700 flex items-center gap-2 text-sm">
          <Filter size={16} />
          Filtrele & Ara
        </h3>
        {hasActive && (
          <button onClick={onReset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
            <X size={14} /> Filtreleri Temizle
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Metin arama */}
        <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Öğretmen veya kitap adı ara..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="form-input pl-9 text-sm py-2.5"
          />
        </div>

        {/* Kademe */}
        <select
          value={filters.kademe_id}
          onChange={(e) => handleChange('kademe_id', e.target.value)}
          className="form-select text-sm py-2.5"
        >
          <option value="">Tüm Kademeler</option>
          {kademeler.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
        </select>

        {/* Sınıf */}
        <select
          value={filters.sinif_seviyesi_id}
          onChange={(e) => handleChange('sinif_seviyesi_id', e.target.value)}
          disabled={!filters.kademe_id}
          className="form-select text-sm py-2.5"
        >
          <option value="">{filters.kademe_id ? 'Tüm Sınıflar' : 'Önce kademe seçin'}</option>
          {siniflar.map((s) => <option key={s.id} value={s.id}>{s.ad}</option>)}
        </select>

        {/* Ders */}
        <select
          value={filters.ders_id}
          onChange={(e) => handleChange('ders_id', e.target.value)}
          disabled={!filters.sinif_seviyesi_id}
          className="form-select text-sm py-2.5"
        >
          <option value="">{filters.sinif_seviyesi_id ? 'Tüm Dersler' : 'Önce sınıf seçin'}</option>
          {dersler.map((d) => <option key={d.id} value={d.id}>{d.ad}</option>)}
        </select>

        {/* Yayınevi */}
        <select
          value={filters.yayin_evi || ''}
          onChange={(e) => handleChange('yayin_evi', e.target.value)}
          className="form-select text-sm py-2.5"
        >
          <option value="">Tüm Yayınevleri</option>
          {publishers.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
        </select>

        {/* Yıldız Puanı */}
        <select
          value={filters.kullanim_puani || ''}
          onChange={(e) => handleChange('kullanim_puani', e.target.value)}
          className="form-select text-sm py-2.5"
        >
          <option value="">Tüm Yıldızlar</option>
          {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} Yıldız</option>)}
        </select>

        {/* Tarih */}
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleChange('date_from', e.target.value)}
            className="form-input text-sm py-2.5 flex-1 min-w-0"
            title="Başlangıç tarihi"
          />
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleChange('date_to', e.target.value)}
            className="form-input text-sm py-2.5 flex-1 min-w-0"
            title="Bitiş tarihi"
          />
        </div>
      </div>
    </div>
  )
}
