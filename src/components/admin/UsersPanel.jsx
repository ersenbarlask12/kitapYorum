import { useState, useEffect } from 'react'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { Spinner } from '../ui/Spinner'
import { AlertCircle, Key, RefreshCw, CheckCircle, Bell, Trash2 } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { Modal } from '../ui/Modal'

export function UsersPanel() {
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [resettingUser, setResettingUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const { showToast } = useToast()

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch Users
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      if (authError) throw authError
      
      const formattedUsers = (authData?.users || []).map(u => ({
        id: u.id,
        email: u.email,
        tc: u.email?.replace('@tcauth.local', ''),
        ad_soyad: u.user_metadata?.ad_soyad || '-',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      setUsers(formattedUsers)

      // 2. Fetch Reset Requests (might fail if table doesn't exist yet)
      const { data: reqData, error: reqError } = await supabaseAdmin
        .from('sifre_sifirlama_talepleri')
        .select('*')
        .order('olusturma_tarihi', { ascending: false })
      
      if (!reqError) {
        setRequests(reqData || [])
      }
    } catch (err) {
      console.error(err)
      setError('Kullanıcılar veya talepler yüklenemedi. Yetkilerinizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleResetSubmit(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      showToast('Şifre en az 6 karakter olmalıdır.', 'error')
      return
    }

    setIsResetting(true)
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        resettingUser.id,
        { password: newPassword }
      )
      if (error) throw error

      showToast(`${resettingUser.ad_soyad} kullanıcısının şifresi başarıyla güncellendi.`, 'success')
      setResettingUser(null)
      setNewPassword('')
      
      // If there was a pending request for this TC, mark it as done
      const pendingReq = requests.find(r => r.tc_kimlik_no === resettingUser.tc && r.durum === 'bekliyor')
      if (pendingReq) {
        await supabaseAdmin.from('sifre_sifirlama_talepleri').update({ durum: 'tamamlandi' }).eq('id', pendingReq.id)
        fetchData()
      }
    } catch (err) {
      console.error(err)
      showToast('Şifre güncellenirken hata oluştu.', 'error')
    } finally {
      setIsResetting(false)
    }
  }

  async function handleCompleteRequest(id) {
    try {
      await supabaseAdmin.from('sifre_sifirlama_talepleri').update({ durum: 'tamamlandi' }).eq('id', id)
      showToast('Talep tamamlandı olarak işaretlendi.', 'success')
      fetchData()
    } catch (err) {
      showToast('İşlem başarısız.', 'error')
    }
  }

  async function handleDeleteRequest(id) {
    try {
      await supabaseAdmin.from('sifre_sifirlama_talepleri').delete().eq('id', id)
      showToast('Talep silindi.', 'success')
      fetchData()
    } catch (err) {
      showToast('İşlem başarısız.', 'error')
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>

  const pendingRequests = requests.filter(r => r.durum === 'bekliyor')

  return (
    <div className="space-y-6 animate-fade-in mt-6">
      {/* Şifre Sıfırlama Talepleri */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <Bell size={18} className="animate-pulse" />
              Bekleyen Şifre Sıfırlama Talepleri ({pendingRequests.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRequests.map(req => {
              const matchedUser = users.find(u => u.tc === req.tc_kimlik_no)
              return (
                <div key={req.id} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{req.tc_kimlik_no}</p>
                    <p className="text-xs text-gray-500">
                      Tarih: {new Date(req.olusturma_tarihi).toLocaleString('tr-TR')}
                      {matchedUser && ` • İsim: ${matchedUser.ad_soyad}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {matchedUser && (
                      <button 
                        onClick={() => setResettingUser(matchedUser)}
                        className="btn-primary py-1.5 px-3 text-xs"
                      >
                        <Key size={14} /> Şifreyi Yenile
                      </button>
                    )}
                    <button 
                      onClick={() => handleCompleteRequest(req.id)}
                      className="btn-secondary py-1.5 px-3 text-xs text-green-700 hover:bg-green-50"
                      title="Sıfırlandı olarak işaretle"
                    >
                      <CheckCircle size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteRequest(req.id)}
                      className="btn-secondary py-1.5 px-3 text-xs text-red-700 hover:bg-red-50"
                      title="Talebi sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-navy-800 flex items-center gap-2">
            Kayıtlı Öğretmenler ({users.length})
          </h3>
          <button onClick={fetchData} className="text-gray-500 hover:text-navy-600 transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-5 py-3">Ad Soyad</th>
                <th className="px-5 py-3">TC Kimlik No</th>
                <th className="px-5 py-3">Kayıt Tarihi</th>
                <th className="px-5 py-3">Son Giriş</th>
                <th className="px-5 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{user.ad_soyad}</td>
                  <td className="px-5 py-3 text-gray-600">{user.tc}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR') : 'Hiç girmedi'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setResettingUser(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-navy-600 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
                    >
                      <Key size={14} /> Şifre Sıfırla
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-gray-500">Kayıtlı kullanıcı bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Şifre Sıfırlama Modalı */}
      <Modal
        isOpen={!!resettingUser}
        onClose={() => setResettingUser(null)}
        title="Kullanıcı Şifresini Sıfırla"
        size="sm"
      >
        {resettingUser && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg text-sm mb-4">
              <span className="text-gray-500 block text-xs">Seçili Kullanıcı:</span>
              <strong className="text-navy-800 block">{resettingUser.ad_soyad}</strong>
              <span className="text-gray-600">{resettingUser.tc}</span>
            </div>
            
            <div>
              <label className="form-label" htmlFor="new_password">Yeni Şifre</label>
              <input
                id="new_password"
                type="text" // Type text so admin can easily see what they are setting
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="form-input"
              />
              <p className="text-xs text-gray-500 mt-1">Öğretmene bu şifreyi iletmeyi unutmayın.</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setResettingUser(null)} 
                className="btn-secondary flex-1"
                disabled={isResetting}
              >
                İptal
              </button>
              <button 
                type="submit" 
                className="btn-primary flex-1"
                disabled={isResetting || newPassword.length < 6}
              >
                {isResetting ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
