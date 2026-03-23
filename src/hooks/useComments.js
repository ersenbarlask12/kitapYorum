import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useComments() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('kitap_yorumlari')
        .select(`
          *,
          kademeler(ad),
          sinif_seviyeleri(ad),
          dersler(ad)
        `)
        .order('olusturma_tarihi', { ascending: false })
      if (error) throw error
      setComments(data ?? [])
    } catch {
      setError('Yorumlar yüklenemedi. Lütfen sayfayı yenileyin.')
    } finally {
      setLoading(false)
    }
  }, [])

  async function addComment(payload) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Oturum bulunamadı.')

    const { data, error } = await supabase
      .from('kitap_yorumlari')
      .insert({ ...payload, ogretmen_id: user.id })
      .select(`*, kademeler(ad), sinif_seviyeleri(ad), dersler(ad)`)
      .single()

    if (error) throw new Error('Yorum eklenemedi. Lütfen tekrar deneyin.')
    setComments((prev) => [data, ...prev])
    return data
  }

  async function updateComment(id, payload) {
    const { data, error } = await supabase
      .from('kitap_yorumlari')
      .update(payload)
      .eq('id', id)
      .select(`*, kademeler(ad), sinif_seviyeleri(ad), dersler(ad)`)
      .single()

    if (error) throw new Error('Yorum güncellenemedi. Lütfen tekrar deneyin.')
    setComments((prev) => prev.map((c) => (c.id === id ? data : c)))
    return data
  }

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return { comments, loading, error, addComment, updateComment, refetch: fetchComments }
}
