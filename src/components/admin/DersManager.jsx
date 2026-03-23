import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2, Search, Filter } from 'lucide-react'
import { useManagement } from '../../hooks/useManagement'

export function DersManager() {
  const { loading, fetchData, createItem, updateItem, deleteItem } = useManagement()
  const [items, setItems] = useState([])
  const [kademeler, setKademeler] = useState([])
  const [siniflar, setSiniflar] = useState([])
  
  const [selectedKademeId, setSelectedKademeId] = useState('')
  const [selectedSinifId, setSelectedSinifId] = useState('')
  
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editSinifId, setEditSinifId] = useState('')
  
  const [newValue, setNewValue] = useState('')
  const [newSinifId, setNewSinifId] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const loadInitial = async () => {
    const kData = await fetchData('kademeler')
    setKademeler(kData)
  }

  const loadSiniflar = async (kademeId) => {
    if (!kademeId) {
      setSiniflar([])
      return
    }
    const sData = await fetchData('sinif_seviyeleri', `*, kademeler(ad)`)
    const filtered = sData.filter(s => s.kademe_id === Number(kademeId))
    setSiniflar(filtered)
  }

  const loadDersler = async () => {
    const query = `*, sinif_seviyeleri(ad, kademe_id, kademeler(ad))`
    const dersData = await fetchData('dersler', query)
    
    // Filter locally based on selections
    const filtered = dersData.filter(d => {
      if (selectedSinifId) return d.sinif_seviyesi_id === Number(selectedSinifId)
      if (selectedKademeId) return d.sinif_seviyeleri?.kademe_id === Number(selectedKademeId)
      return true
    })
    
    setItems(filtered)
  }

  useEffect(() => { loadInitial() }, [])

  useEffect(() => {
    loadSiniflar(selectedKademeId)
    setSelectedSinifId('')
  }, [selectedKademeId])

  useEffect(() => {
    loadDersler()
  }, [selectedKademeId, selectedSinifId])

  const handleCreate = async (e) => {
    e.preventDefault()
    const targetSinif = newSinifId || selectedSinifId
    if (!newValue.trim() || !targetSinif) return
    
    const success = await createItem('dersler', { 
      ad: newValue.trim(),
      sinif_seviyesi_id: Number(targetSinif)
    })
    
    if (success) {
      setNewValue('')
      setIsAdding(false)
      loadDersler()
    }
  }

  const handleUpdate = async (id) => {
    if (!editValue.trim() || !editSinifId) return
    const success = await updateItem('dersler', id, { 
      ad: editValue.trim(),
      sinif_seviyesi_id: Number(editSinifId)
    })
    if (success) {
      setEditingId(null)
      loadDersler()
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Bu dersi silmek istediğinize emin misiniz?')) {
      const success = await deleteItem('dersler', id)
      if (success) loadDersler()
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditValue(item.ad)
    setEditSinifId(item.sinif_seviyesi_id)
  }

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h3 className="font-bold text-navy-700">Dersler Listesi</h3>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <Filter size={14} className="text-gray-400" />
            <select
              value={selectedKademeId}
              onChange={(e) => setSelectedKademeId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer"
            >
              <option value="">Tüm Kademeler</option>
              {kademeler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
            </select>
            <span className="text-gray-300">|</span>
            <select
              value={selectedSinifId}
              onChange={(e) => setSelectedSinifId(e.target.value)}
              disabled={!selectedKademeId}
              className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer disabled:opacity-50"
            >
              <option value="">Tüm Sınıflar</option>
              {siniflar.map(s => <option key={s.id} value={s.id}>{s.ad}</option>)}
            </select>
          </div>

          {!isAdding && (
            <button 
              onClick={() => {
                setIsAdding(true)
                setNewSinifId(selectedSinifId)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-700 text-white rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors"
            >
              <Plus size={14} /> Yeni Ekle
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {isAdding && (
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-navy-50 rounded-xl border border-navy-100 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 flex-1 w-full">
               <select
                value={newSinifId}
                onChange={(e) => setNewSinifId(e.target.value)}
                className="w-48 bg-white border border-navy-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              >
                <option value="">Sınıf Seçin...</option>
                {(selectedKademeId ? siniflar : []).map(s => <option key={s.id} value={s.id}>{s.ad}</option>)}
              </select>
              <input
                autoFocus
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Ders adı (örn: Matematik)"
                className="flex-1 bg-white border border-navy-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <button type="submit" disabled={loading} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                <Check size={18} />
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group hover:border-gray-300 transition-all">
              {editingId === item.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 bg-white border border-navy-200 rounded-lg px-3 py-1 text-sm focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleUpdate(item.id)} disabled={loading} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-1.5 rounded">
                        {item.sinif_seviyeleri?.ad}
                      </span>
                      <span className="font-semibold text-gray-700">{item.ad}</span>
                    </div>
                    <span className="text-[10px] text-navy-500 font-medium">
                      {item.sinif_seviyeleri?.kademeler?.ad}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(item)} className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && !loading && !isAdding && (
          <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            {selectedKademeId ? 'Bu seçim için kayıtlı ders bulunamadı.' : 'Dersleri listelemek için kademe seçimi yapın veya bir sınıf seviyesine odaklanın.'}
          </div>
        )}

        {loading && !isAdding && editingId === null && (
          <div className="flex justify-center py-12 text-gray-400">
            <Loader2 className="animate-spin text-navy-600 mr-2" />
            Yükleniyor...
          </div>
        )}
      </div>
    </div>
  )
}
