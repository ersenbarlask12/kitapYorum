import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCascadeData() {
  const [kademeler, setKademeler] = useState([])
  const [siniflar, setSiniflar] = useState([])
  const [dersler, setDersler] = useState([])
  const [loadingKademe, setLoadingKademe] = useState(true)
  const [loadingSinif, setLoadingSinif] = useState(false)
  const [loadingDers, setLoadingDers] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoadingKademe(true)
    supabase
      .from('kademeler')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (error) setError('Veriler alınamadı, lütfen tekrar deneyin.')
        else setKademeler(data ?? [])
        setLoadingKademe(false)
      })
  }, [])

  async function onKademeChange(kademeId) {
    setLoadingSinif(true)
    setSiniflar([])
    setDersler([])
    setError(null)
    try {
      const { data, error } = await supabase
        .from('sinif_seviyeleri')
        .select('*')
        .eq('kademe_id', kademeId)
        .order('id')
      if (error) throw error
      setSiniflar(data ?? [])
    } catch {
      setError('Veriler alınamadı, lütfen tekrar deneyin.')
    } finally {
      setLoadingSinif(false)
    }
  }

  async function onSinifChange(sinifId) {
    setLoadingDers(true)
    setDersler([])
    setError(null)
    try {
      const { data, error } = await supabase
        .from('dersler')
        .select('*')
        .eq('sinif_seviyesi_id', sinifId)
        .order('id')
      if (error) throw error
      setDersler(data ?? [])
    } catch {
      setError('Veriler alınamadı, lütfen tekrar deneyin.')
    } finally {
      setLoadingDers(false)
    }
  }

  return {
    kademeler,
    siniflar,
    dersler,
    loadingKademe,
    loadingSinif,
    loadingDers,
    error,
    onKademeChange,
    onSinifChange,
  }
}
