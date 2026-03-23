import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const LOCK_DURATION = 30_000 // 30 seconds
const MAX_ATTEMPTS = 3

export function useAuth() {
  const { setSession } = useAuthStore()
  const [loginAttempts, setLoginAttempts] = useState(
    () => parseInt(sessionStorage.getItem('login_attempts') ?? '0', 10)
  )
  const [lockUntil, setLockUntil] = useState(
    () => parseInt(sessionStorage.getItem('login_lock_until') ?? '0', 10)
  )

  const isLocked = () => lockUntil && Date.now() < lockUntil

  const getRemainingLockSeconds = () => {
    if (!lockUntil) return 0
    return Math.ceil(Math.max(0, lockUntil - Date.now()) / 1000)
  }

  async function register(tcKimlikNo, adSoyad, sifre) {
    const email = `${tcKimlikNo}@tcauth.local`
    const { data, error } = await supabase.auth.signUp({
      email,
      password: sifre,
      options: {
        data: { ad_soyad: adSoyad, tc_kimlik_no: tcKimlikNo },
      },
    })
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        throw new Error('Bu TC Kimlik No ile zaten bir hesap mevcut.')
      }
      throw new Error('Kayıt başarısız. Lütfen tekrar deneyin.')
    }
    return data
  }

  async function login(tcKimlikNo, sifre) {
    if (isLocked()) {
      throw new Error(`Çok fazla hatalı deneme. Lütfen ${getRemainingLockSeconds()} saniye bekleyin.`)
    }

    const email = `${tcKimlikNo}@tcauth.local`
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: sifre })

    if (error) {
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      sessionStorage.setItem('login_attempts', String(newAttempts))

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCK_DURATION
        setLockUntil(lockTime)
        sessionStorage.setItem('login_lock_until', String(lockTime))
        throw new Error('Çok fazla hatalı deneme. Hesabınız 30 saniye kilitlendi.')
      }

      throw new Error('TC Kimlik No veya şifre hatalı.')
    }

    // Reset attempts on success
    setLoginAttempts(0)
    setLockUntil(0)
    sessionStorage.removeItem('login_attempts')
    sessionStorage.removeItem('login_lock_until')

    setSession(data.session)
    return data
  }

  return { register, login, isLocked, getRemainingLockSeconds }
}
