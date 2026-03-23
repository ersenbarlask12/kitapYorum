import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, LogIn, Clock, Shield, AlertCircle } from 'lucide-react'
import { Spinner } from '../ui/Spinner'

export function AdminLogin({ onLogin, isLocked, getRemainingSeconds }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!isLocked()) { setCountdown(0); return }
    setCountdown(getRemainingSeconds())
    const interval = setInterval(() => {
      const remaining = getRemainingSeconds()
      setCountdown(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (isLocked()) return
    setIsSubmitting(true)
    setError('')

    setTimeout(() => {
      const success = onLogin(password)
      if (!success) {
        setError(isLocked() ? `Çok fazla hatalı deneme. ${getRemainingSeconds()} saniye bekleyin.` : 'Admin şifresi hatalı.')
        setPassword('')
      }
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-700/80 rounded-2xl mb-4 border border-navy-600">
            <Shield className="text-gold-400" size={32} />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Admin Paneli</h1>
          <p className="text-gray-400 text-sm mt-1">Kitap Değerlendirme Sistemi</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Lock size={18} className="text-gold-400" />
            Yönetici Girişi
          </h2>

          {countdown > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/40 rounded-lg border border-red-800 text-red-300 text-sm">
              <Clock size={15} />
              <span>Hesap kilitli — {countdown} saniye kaldı</span>
            </div>
          )}

          {error && !countdown && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/40 rounded-lg border border-red-800 text-red-300 text-sm">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin Şifresi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={countdown > 0}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!password || countdown > 0 || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {isSubmitting ? (
                <><Spinner size="sm" /> Doğrulanıyor...</>
              ) : countdown > 0 ? (
                <><Clock size={16} /> {countdown} sn</>
              ) : (
                <><LogIn size={16} /> Giriş</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
