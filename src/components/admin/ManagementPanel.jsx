import { useState } from 'react'
import { Layers, GraduationCap, BookOpen, AlertCircle } from 'lucide-react'
import { KademeManager } from './KademeManager'
import { SinifManager } from './SinifManager'
import { DersManager } from './DersManager'

export function ManagementPanel() {
  const [activeSubTab, setActiveSubTab] = useState('kademe')

  const subTabs = [
    { id: 'kademe', label: 'Kademeler', icon: Layers },
    { id: 'sinif', label: 'Sınıf Seviyeleri', icon: GraduationCap },
    { id: 'ders', label: 'Dersler', icon: BookOpen },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="section-title">Veri Yönetimi</h2>
        <p className="text-gray-500 text-sm mt-1">Sistemdeki kademe, sınıf ve ders tanımlarını düzenleyin.</p>
      </div>

      {/* Internal Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-200/50 rounded-xl w-fit">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === tab.id
                ? 'bg-white text-navy-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/30'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-amber-800 leading-relaxed">
          <p className="font-bold mb-1">Önemli Not:</p>
          <p>Bir dersi silmeden önce o dersle ilgili yorumları temizlemeniz önerilir. Silme işlemi sırasında yabancı anahtar kısıtlamaları (Foreign Key) nedeniyle sistem hata verebilir.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        {activeSubTab === 'kademe' && <KademeManager />}
        {activeSubTab === 'sinif' && <SinifManager />}
        {activeSubTab === 'ders' && <DersManager />}
      </div>
    </div>
  )
}
