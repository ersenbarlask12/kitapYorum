import { useState, useEffect } from 'react'
import { supabaseAdmin } from '../lib/supabaseAdmin'

export function usePublishers() {
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPublishers() {
      try {
        // Option A: If using a dedicated yayin_evleri table
        // const { data, error } = await supabase.from('yayin_evleri').select('ad').order('ad');
        
        // Option B (No DB Schema change needed): 
        // We fetch distinct values via a Supabase RPC function.
        // If RPC is not created yet, we can try to get them directly from kitap_yorumlari
        // Note: For large tables RPC is better, but this works for now.
        const { data, error } = await supabaseAdmin
          .from('kitap_yorumlari')
          .select('yayin_evi')
          .neq('yayin_evi', null)

        if (error) throw error

        // Kullanım sıklığına göre grupla
        const counts = {}
        data.forEach(item => {
          const p = item.yayin_evi?.trim()
          if (p) {
            counts[p] = (counts[p] || 0) + 1
          }
        })

        // Sıklığa göre azalan, eşitse alfabetik sırala
        const sortedPublishers = Object.entries(counts)
          .filter(([name, count]) => count > 1) // SADECE BİRDEN FAZLA KULLANILANLARI AL
          .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1]
            return a[0].localeCompare(b[0], 'tr')
          })
          .map(([name, count]) => ({ 
            label: name, 
            value: name,
            count: count,
            isPopular: true
          }))

        setPublishers(sortedPublishers)
      } catch (err) {
        console.error("Yayınevleri çekilirken hata oluştu:", err)
        setPublishers([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchPublishers()
  }, [])

  return { publishers, loading }
}
