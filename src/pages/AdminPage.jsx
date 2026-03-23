import { useState } from 'react'
import { BookOpen, LogOut, Shield, Database, MessageSquare } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { AdminLogin } from '../components/admin/AdminLogin'
import { AdminDashboard } from '../components/admin/AdminDashboard'
import { ManagementPanel } from '../components/admin/ManagementPanel'

export default function AdminPage() {
  const { authenticated, login, logout, isLocked, getRemainingSeconds } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('comments') // 'comments' or 'management'

  if (!authenticated) {
    return <AdminLogin onLogin={login} isLocked={isLocked} getRemainingSeconds={getRemainingSeconds} />
  }

  const tabs = [
    { id: 'comments', label: 'Yorumlar', icon: MessageSquare },
    { id: 'management', label: 'Veri Yönetimi', icon: Database },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Navbar */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Kitap Değerlendirme</p>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Yönetim</p>
                </div>
              </div>

              {/* Desktop Tabs */}
              <nav className="hidden md:flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-navy-700 text-gold-400 shadow-inner'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-[10px] text-gold-500 font-bold uppercase tracking-wider">
                <Shield size={12} />
                Yönetici
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-navy-900 flex border-b border-navy-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase transition-all ${
              activeTab === tab.id
                ? 'text-gold-400 border-b-2 border-gold-400 bg-navy-800'
                : 'text-gray-500'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {activeTab === 'comments' ? <AdminDashboard /> : <ManagementPanel />}
      </main>
    </div>
  )
}
