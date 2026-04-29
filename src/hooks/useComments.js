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

    const {
      kademe_id, sinif_seviyesi_id, ders_id, yayin_evi, kitap_adi, yorum, kullanim_puani,
      ...ekstraFields
    } = payload

    const formattedPayload = {
      ogretmen_id: user.id,
      kademe_id,
      sinif_seviyesi_id,
      ders_id: ders_id ? Number(ders_id) : null,
      yayin_evi,
      kitap_adi,
      yorum,
      kullanim_puani: kullanim_puani || null,
    }

    if (Object.keys(ekstraFields).length > 0 && ekstraFields.toplam_kitap_sayisi) {
      formattedPayload.ekstra_form_verisi = ekstraFields
    }

    const { data, error } = await supabase
      .from('kitap_yorumlari')
      .insert(formattedPayload)
      .select(`*, kademeler(ad), sinif_seviyeleri(ad), dersler(ad)`)
      .single()

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw new Error('Yorum eklenemedi. Lütfen tekrar deneyin.')
    }
    setComments((prev) => [data, ...prev])
    return data
  }

  async function updateComment(id, payload) {
    const {
      yayin_evi, kitap_adi, yorum, kullanim_puani,
      ...ekstraFields
    } = payload

    const formattedPayload = {
      yayin_evi,
      kitap_adi,
      yorum,
      kullanim_puani: kullanim_puani || null,
    }

    if (Object.keys(ekstraFields).length > 0 && ekstraFields.toplam_kitap_sayisi) {
      formattedPayload.ekstra_form_verisi = ekstraFields
    }

    const { data, error } = await supabase
      .from('kitap_yorumlari')
      .update(formattedPayload)
      .eq('id', id)
      .select(`*, kademeler(ad), sinif_seviyeleri(ad), dersler(ad)`)
      .single()

    if (error) {
      console.error('Supabase Update Error:', error);
      throw new Error('Yorum güncellenemedi. Lütfen tekrar deneyin.')
    }
    setComments((prev) => prev.map((c) => (c.id === id ? data : c)))
    return data
  }

  async function deleteComment(id) {
    const { error } = await supabase
      .from('kitap_yorumlari')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase Delete Error:', error);
      throw new Error('Yorum silinemedi. Lütfen tekrar deneyin.')
    }
    setComments((prev) => prev.filter((c) => c.id !== id))
    return true
  }

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return { comments, loading, error, addComment, updateComment, deleteComment, refetch: fetchComments }
}
