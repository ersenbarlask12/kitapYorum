import { useState, useCallback } from 'react'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { useToast } from '../components/ui/Toast'

export function useManagement() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (table, query = '*') => {
    setLoading(true)
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select(query)
        .order('id', { ascending: true })
      if (error) throw error
      return data
    } catch (err) {
      showToast(`${table} verileri yüklenemedi.`, 'error')
      return []
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const createItem = async (table, item) => {
    setLoading(true)
    try {
      const { error } = await supabaseAdmin.from(table).insert(item)
      if (error) throw error
      showToast('Başarıyla eklendi.', 'success')
      return true
    } catch (err) {
      showToast('Ekleme işlemi başarısız.', 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (table, id, update) => {
    setLoading(true)
    try {
      const { error } = await supabaseAdmin.from(table).update(update).eq('id', id)
      if (error) throw error
      showToast('Başarıyla güncellendi.', 'success')
      return true
    } catch (err) {
      showToast('Güncelleme işlemi başarısız.', 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (table, id) => {
    setLoading(true)
    try {
      const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
      if (error) throw error
      showToast('Başarıyla silindi.', 'success')
      return true
    } catch (err) {
      // Check for foreign key constraint errors
      if (err.code === '23503') {
        showToast('Bu kayıt başka veriler tarafından kullanıldığı için silinemez.', 'warning')
      } else {
        showToast('Silme işlemi başarısız.', 'error')
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    fetchData,
    createItem,
    updateItem,
    deleteItem
  }
}
