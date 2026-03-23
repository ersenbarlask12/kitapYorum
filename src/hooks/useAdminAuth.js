import { useState } from 'react'

const ADMIN_LOCK_DURATION = 30_000
const ADMIN_MAX_ATTEMPTS = 3

export function useAdminAuth() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('admin_auth') === 'true'
  )
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState(null)

  const isLocked = () => lockUntil && Date.now() < lockUntil

  const getRemainingSeconds = () => {
    if (!lockUntil) return 0
    return Math.ceil(Math.max(0, lockUntil - Date.now()) / 1000)
  }

  function login(password) {
    if (isLocked()) return false

    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
      setAuthenticated(true)
      setAttempts(0)
      return true
    }

    const next = attempts + 1
    setAttempts(next)
    if (next >= ADMIN_MAX_ATTEMPTS) {
      setLockUntil(Date.now() + ADMIN_LOCK_DURATION)
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem('admin_auth')
    setAuthenticated(false)
    setAttempts(0)
    setLockUntil(null)
  }

  return { authenticated, login, logout, isLocked, getRemainingSeconds }
}
