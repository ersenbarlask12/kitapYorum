import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2, Link } from 'lucide-react'
import { useManagement } from '../../hooks/useManagement'

export function SinifManager() {
  const { loading, fetchData, createItem, updateItem, deleteItem } = useManagement()
  const [items, setItems] = useState([])
  const [kademeler, setKademeler] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editKademeId, setEditKademeId] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newKademeId, setNewKademeId] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const load = async () => {
    const [data, kData] = await Promise.all([
      fetchData('sinif_seviyeleri', '*, kademeler(ad)'),
      fetchData('kademeler')
    ])
    setItems(data)
    setKademeler(kData)
    if (kData.length > 0) setNewKademeId(kData[0].id)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newValue.trim() || !newKademeId) return
    const success = await createItem('sinif_seviyeleri', { 
      ad: newValue.trim(),
      kademe_id: Number(newKademeId)
    })
    if (success) {
      setNewValue('')
      setIsAdding(false)
      load()
    }
  }

  const handleUpdate = async (id) => {
    if (!editValue.trim() || !editKademeId) return
    const success = await updateItem('sinif_seviyeleri', id, { 
      ad: editValue.trim(),
      kademe_id: Number(editKademeId)
    })
    if (success) {
      setEditingId(null)
      load()
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Bu sınıf seviyesini silmek istediğinize emin misiniz?')) {
      const success = await deleteItem('sinif_seviyeleri', id)
      if (success) load()
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditValue(item.ad)
    setEditKademeId(item.kademe_id)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-navy-700">Sınıf Seviyeleri Listesi</h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-700 text-white rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors"
          >
            <Plus size={14} /> Yeni Ekle
          </button>
        )}
      </div>

      <div className="space-y-2">
        {isAdding && (
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-navy-50 rounded-xl border border-navy-100 animate-in fade-in slide-in-from-top-1">
            <select
              value={newKademeId}
              onChange={(e) => setNewKademeId(e.target.value)}
              className="w-full sm:w-48 bg-white border border-navy-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            >
              {kademeler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
            </select>
            <input
              autoFocus
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Sınıf adı (örn: 9. Sınıf)"
              className="flex-1 bg-white border border-navy-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            />
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

        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group hover:border-gray-300 transition-all">
            {editingId === item.id ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 flex-1">
                <select
                  value={editKademeId}
                  onChange={(e) => setEditKademeId(e.target.value)}
                  className="w-full sm:w-48 bg-white border border-navy-200 rounded-lg px-3 py-1 text-sm focus:outline-none"
                >
                  {kademeler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
                </select>
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
                <div className="flex items-center gap-4">
                  <span className="badge-navy text-[10px] w-24 text-center">
                    {item.kademeler?.ad}
                  </span>
                  <span className="font-semibold text-gray-700">{item.ad}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(item)} className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {items.length === 0 && !loading && !isAdding && (
          <div className="text-center py-12 text-gray-400">
            Kayıtlı sınıf seviyesi bulunamadı.
          </div>
        )}

        {loading && !isAdding && editingId === null && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-navy-600" />
          </div>
        )}
      </div>
    </div>
  )
}
