import { useState, useMemo } from 'react'
import { Check, Merge, AlertCircle } from 'lucide-react'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { useToast } from '../ui/Toast'
import { Spinner } from '../ui/Spinner'

export function PublisherMergePanel({ allComments, onMergeSuccess }) {
  const [selectedSources, setSelectedSources] = useState([])
  const [targetPublisher, setTargetPublisher] = useState('')
  const [isMerging, setIsMerging] = useState(false)
  const { showToast } = useToast()

  // Calculate publisher stats
  const publisherStats = useMemo(() => {
    const groups = {}
    allComments.forEach(c => {
      if (!c.yayin_evi) return
      const pub = c.yayin_evi.trim()
      if (!groups[pub]) groups[pub] = { count: 0, exactStrings: new Set() }
      groups[pub].count++
      groups[pub].exactStrings.add(c.yayin_evi)
    })
    return Object.entries(groups)
      .map(([name, data]) => ({ name, count: data.count, exactStrings: Array.from(data.exactStrings) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'))
  }, [allComments])

  function handleToggleSource(name) {
    if (selectedSources.includes(name)) {
      setSelectedSources(prev => prev.filter(p => p !== name))
    } else {
      setSelectedSources(prev => [...prev, name])
    }
  }

  async function handleMerge() {
    if (selectedSources.length === 0) {
      showToast('Lütfen birleştirilecek en az bir yayınevi seçin.', 'error')
      return
    }
    if (!targetPublisher.trim()) {
      showToast('Lütfen hedef yayınevi adını girin veya seçin.', 'error')
      return
    }

    setIsMerging(true)
    try {
      // Collect all exact strings from the selected trimmed names
      const exactStringsToUpdate = []
      selectedSources.forEach(src => {
        const group = publisherStats.find(g => g.name === src)
        if (group) exactStringsToUpdate.push(...group.exactStrings)
      })

      // Update the comments in DB using exact original strings
      const { error } = await supabaseAdmin
        .from('kitap_yorumlari')
        .update({ yayin_evi: targetPublisher.trim() })
        .in('yayin_evi', exactStringsToUpdate)

      if (error) throw error

      showToast(`${selectedSources.length} adet yayınevi "${targetPublisher}" olarak birleştirildi.`, 'success')
      setSelectedSources([])
      setTargetPublisher('')
      onMergeSuccess() // Refresh comments list
    } catch (err) {
      console.error(err)
      showToast('Birleştirme işlemi sırasında hata oluştu.', 'error')
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-navy-800 flex items-center gap-2">
          <Merge size={20} className="text-navy-600" />
          Yayınevi İsimlerini Birleştir
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Farklı yazılmış yayınevi isimlerini (örneğin "MEB", "meb", "MEB Yayınları") seçip tek bir doğru isme çevirebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Taraf: Kaynak Yayınevleri Seçimi */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3 flex justify-between items-center">
            <span>Mevcut Yayınevleri</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{publisherStats.length} farklı isim</span>
          </h4>
          <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto bg-gray-50 p-2 space-y-1">
            {publisherStats.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Yayınevi bulunamadı.</p>
            ) : (
              publisherStats.map(({ name, count }) => (
                <label 
                  key={name} 
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors border ${
                    selectedSources.includes(name) 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-white border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      checked={selectedSources.includes(name)}
                      onChange={() => handleToggleSource(name)}
                    />
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    {count} kayıt
                  </span>
                </label>
              ))
            )}
          </div>
          {selectedSources.length > 0 && (
            <p className="text-sm text-blue-600 mt-2 font-medium">
              {selectedSources.length} yayınevi seçildi.
            </p>
          )}
        </div>

        {/* Sağ Taraf: Hedef Yayınevi ve İşlem */}
        <div>
          <div className="bg-navy-50/50 p-5 rounded-xl border border-navy-100">
            <h4 className="font-semibold text-navy-800 mb-3">Hedef Yayınevi Adı</h4>
            <p className="text-xs text-gray-500 mb-4">
              Seçtiğiniz yayınevleri bu isme dönüştürülecektir. Listeden seçebilir veya yenisini yazabilirsiniz.
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Örn: Türkiye İş Bankası Kültür Yayınları"
                className="form-input w-full"
                value={targetPublisher}
                onChange={(e) => setTargetPublisher(e.target.value)}
              />
              
              <div className="flex flex-wrap gap-2">
                {selectedSources.slice(0, 5).map(src => (
                  <button 
                    key={src}
                    type="button"
                    onClick={() => setTargetPublisher(src)}
                    className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
                  >
                    "{src}" kullan
                  </button>
                ))}
              </div>

              <div className="pt-4 mt-2 border-t border-navy-100">
                <button
                  onClick={handleMerge}
                  disabled={isMerging || selectedSources.length === 0 || !targetPublisher.trim()}
                  className="btn-primary w-full justify-center"
                >
                  {isMerging ? (
                    <><Spinner size="sm" /> Birleştiriliyor...</>
                  ) : (
                    <><Check size={18} /> Seçilenleri Hedefe Çevir</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded-lg flex gap-3 text-amber-800 border border-amber-100">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-xs">
              <strong>Dikkat:</strong> Bu işlem seçili yayınevlerine ait tüm yorumları günceller. Geri alınması zordur.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
