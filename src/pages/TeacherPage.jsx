import { BookOpen, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { TeacherDashboard } from '../components/teacher/TeacherDashboard'
import { useToast } from '../components/ui/Toast'
import { useNavigate } from 'react-router-dom'

export default function TeacherPage() {
  const { getAdSoyad, logout } = useAuthStore()
  const toast = useToast()
  const navigate = useNavigate()
  const adSoyad = getAdSoyad()

  async function handleLogout() {
    await logout()
    toast.success('Çıkış yapıldı.')
    navigate('/giris', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <header className="bg-navy-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gold-500 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <p className="text-white font-display font-bold text-sm leading-tight">Kitap Değerlendirme</p>
                <p className="text-navy-300 text-xs">Öğretmen Paneli</p>
              </div>
            </div>

            {/* User info + logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-navy-200 text-sm">
                <User size={16} />
                <span>{adSoyad}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-200 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeacherDashboard />
      </main>
    </div>
  )
}
