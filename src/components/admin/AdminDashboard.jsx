import { useState, useEffect, useMemo } from 'react'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { FilterPanel } from './FilterPanel'
import { DataTable } from './DataTable'
import { ExportButtons } from './ExportButtons'
import { Spinner } from '../ui/Spinner'
import { AlertCircle, RefreshCw, BarChart3, Trash2, List, FileText } from 'lucide-react'
import { EditCommentModal } from '../teacher/EditCommentModal'
import { useToast } from '../ui/Toast'
import { Modal } from '../ui/Modal'
import { ReportsPanel } from './ReportsPanel'

const DEFAULT_FILTERS = {
  search: '',
  kademe_id: '',
  sinif_seviyesi_id: '',
  ders_id: '',
  date_from: '',
  date_to: '',
  yayin_evi: '',
  kullanim_puani: '',
}

export function AdminDashboard() {
  const [allComments, setAllComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [editingComment, setEditingComment] = useState(null)
  const [deletingComment, setDeletingComment] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const { showToast } = useToast()

  async function fetchAllComments() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabaseAdmin
        .from('kitap_yorumlari')
        .select(`
          *,
          kademeler(ad),
          sinif_seviyeleri(ad),
          dersler(ad)
        `)
        .order('olusturma_tarihi', { ascending: false })

      if (error) throw error

      // Fetch teacher names via admin auth.users
      const userIds = [...new Set((data ?? []).map((c) => c.ogretmen_id).filter(Boolean))]
      let userMap = {}
      if (userIds.length > 0) {
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
        if (authData?.users) {
          authData.users.forEach((u) => {
            userMap[u.id] = u.user_metadata?.ad_soyad ?? u.email?.replace('@tcauth.local', '') ?? '-'
          })
        }
      }

      const enriched = (data ?? []).map((c) => ({
        ...c,
        ogretmen_adi: userMap[c.ogretmen_id] ?? '-',
      }))

      setAllComments(enriched)
    } catch (err) {
      setError('Veriler yüklenemedi. Supabase bağlantısını ve service_role key ayarını kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllComments()
  }, [])

  function handleFilterChange(update) {
    setFilters((prev) => ({ ...prev, ...update }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  async function handleEditSubmit(formData) {
    setIsSaving(true)
    try {
      const { error } = await supabaseAdmin
        .from('kitap_yorumlari')
        .update({
          ...formData,
          guncelleme_tarihi: new Date().toISOString(),
        })
        .eq('id', editingComment.id)

      if (error) throw error

      showToast('Yorum başarıyla güncellendi.', 'success')
      setEditingComment(null)
      fetchAllComments()
    } catch (err) {
      showToast('Yorum güncellenirken bir hata oluştu.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteConfirm() {
    setIsSaving(true)
    try {
      const { error } = await supabaseAdmin
        .from('kitap_yorumlari')
        .delete()
        .eq('id', deletingComment.id)

      if (error) throw error

      showToast('Yorum başarıyla silindi.', 'success')
      setDeletingComment(null)
      fetchAllComments()
    } catch (err) {
      showToast('Yorum silinirken bir hata oluştu.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredData = useMemo(() => {
    return allComments.filter((c) => {
      const searchLower = filters.search.toLowerCase()
      if (searchLower) {
        const matchName = (c.ogretmen_adi ?? '').toLowerCase().includes(searchLower)
        const matchBook = (c.kitap_adi ?? '').toLowerCase().includes(searchLower)
        const matchPublisher = (c.yayin_evi ?? '').toLowerCase().includes(searchLower)
        if (!matchName && !matchBook && !matchPublisher) return false
      }
      if (filters.kademe_id && c.kademe_id !== Number(filters.kademe_id)) return false
      if (filters.sinif_seviyesi_id && c.sinif_seviyesi_id !== Number(filters.sinif_seviyesi_id)) return false
      if (filters.ders_id && c.ders_id !== Number(filters.ders_id)) return false
      if (filters.date_from && new Date(c.olusturma_tarihi) < new Date(filters.date_from)) return false
      if (filters.date_to && new Date(c.olusturma_tarihi) > new Date(filters.date_to + 'T23:59:59')) return false
      if (filters.yayin_evi && (c.yayin_evi ?? '').toLowerCase() !== filters.yayin_evi.toLowerCase()) return false
      if (filters.kullanim_puani && c.kullanim_puani !== Number(filters.kullanim_puani)) return false
      return true
    })
  }, [allComments, filters])

  // Extract unique publishers
  const uniquePublishers = useMemo(() => {
    const pubs = allComments.map(c => c.yayin_evi).filter(Boolean)
    const uniquePubs = [...new Set(pubs.map(p => p.toLowerCase()))]
    // find original casing for display
    return uniquePubs.map(lower => pubs.find(p => p.toLowerCase() === lower)).sort((a, b) => a.localeCompare(b, 'tr-TR'))
  }, [allComments])

  // Stats
  const updatedCount = filteredData.filter((c) => !!c.guncelleme_tarihi).length
  const uniqueTeachers = new Set(filteredData.map((c) => c.ogretmen_id)).size

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="section-title">Tüm Yorumlar</h2>
          <p className="text-gray-500 text-sm mt-1">Filtreler uygulandığında: {filteredData.length} kayıt</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAllComments} className="btn-ghost text-sm" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Yenile
          </button>
          <ExportButtons data={filteredData} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Toplam Yorum', value: filteredData.length, icon: BarChart3 },
          { label: 'Güncellenen', value: updatedCount, icon: BarChart3 },
          { label: 'Öğretmen', value: uniqueTeachers, icon: BarChart3 },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-2xl font-display font-bold text-navy-700">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterPanel 
        filters={filters} 
        onChange={handleFilterChange} 
        onReset={resetFilters} 
        publishers={uniquePublishers}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'list'
              ? 'border-navy-600 text-navy-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <List size={18} />
          Yorum Listesi
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-navy-600 text-navy-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FileText size={18} />
          Raporlar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="spinner-wrapper">
          <Spinner size="lg" />
        </div>
      )}

      {/* Content based on Active Tab */}
      {!loading && !error && activeTab === 'list' && (
        <DataTable 
          data={filteredData} 
          onEdit={(c) => setEditingComment(c)} 
          onDelete={(c) => setDeletingComment(c)} 
        />
      )}

      {!loading && !error && activeTab === 'reports' && (
        <ReportsPanel data={filteredData} />
      )}

      {/* Edit Modal */}
      <EditCommentModal
        isOpen={!!editingComment}
        onClose={() => setEditingComment(null)}
        comment={editingComment}
        onSave={handleEditSubmit}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deletingComment} 
        onClose={() => setDeletingComment(null)} 
        title="Yorumu Sil" 
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 transition-all">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">Emin misiniz?</p>
              <p className="text-xs text-red-600">Bu işlem geri alınamaz.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setDeletingComment(null)} 
              className="btn-secondary flex-1"
              disabled={isSaving}
            >
              İptal
            </button>
            <button 
              onClick={handleDeleteConfirm} 
              className="btn-primary bg-red-600 hover:bg-red-700 border-red-600 flex-1"
              disabled={isSaving}
            >
              {isSaving ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
