import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Eye, EyeOff, LogIn, AlertCircle, Lock, Clock } from 'lucide-react'
import { loginSchema } from '../lib/validationSchema'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLocked, getRemainingLockSeconds } = useAuth()
  const { user } = useAuthStore()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/ogretmen', { replace: true })
  }, [user, navigate])

  // Countdown timer for lock
  useEffect(() => {
    if (!isLocked()) { setLockCountdown(0); return }
    setLockCountdown(getRemainingLockSeconds())
    const interval = setInterval(() => {
      const remaining = getRemainingLockSeconds()
      setLockCountdown(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  })

  async function onSubmit(values) {
    if (isLocked()) return
    setIsSubmitting(true)
    try {
      await login(values.tc_kimlik_no, values.sifre)
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...')
      navigate('/ogretmen', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-4 border border-white/20">
            <BookOpen className="text-gold-400" size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Kitap Değerlendirme</h1>
          <p className="text-navy-200 mt-1">Öğretmen Değerlendirme Sistemi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-display font-bold text-navy-700 mb-6">Giriş Yapın</h2>

          {lockCountdown > 0 && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <Clock className="text-red-500 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-red-700">Hesap Geçici Olarak Kilitlendi</p>
                <p className="text-xs text-red-600 mt-0.5">{lockCountdown} saniye içinde tekrar deneyebilirsiniz.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* TC Kimlik No */}
            <div>
              <label className="form-label" htmlFor="tc_kimlik_no">TC Kimlik No</label>
              <input
                id="tc_kimlik_no"
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="12345678901"
                className={`form-input ${errors.tc_kimlik_no ? 'form-input-error' : ''}`}
                {...register('tc_kimlik_no')}
              />
              {errors.tc_kimlik_no && (
                <p className="form-error">
                  <AlertCircle size={14} />
                  {errors.tc_kimlik_no.message}
                </p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label className="form-label" htmlFor="sifre">Şifre</label>
              <div className="relative">
                <input
                  id="sifre"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`form-input pr-12 ${errors.sifre ? 'form-input-error' : ''}`}
                  {...register('sifre')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Şifreyi göster/gizle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.sifre && (
                <p className="form-error">
                  <AlertCircle size={14} />
                  {errors.sifre.message}
                </p>
              )}
            </div>

            {/* Beni Hatırla */}
            <div className="flex items-center gap-2">
              <input
                id="beni_hatirla"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-navy-600 focus:ring-navy-600"
                {...register('beni_hatirla')}
              />
              <label htmlFor="beni_hatirla" className="text-sm text-gray-600 cursor-pointer">
                Beni Hatırla
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting || lockCountdown > 0}
            >
              {isSubmitting ? (
                <><Spinner size="sm" /> Giriş yapılıyor...</>
              ) : lockCountdown > 0 ? (
                <><Lock size={18} /> {lockCountdown} sn bekleyin</>
              ) : (
                <><LogIn size={18} /> Giriş Yap</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Hesabınız yok mu?{' '}
              <Link to="/kayit" className="font-semibold text-navy-600 hover:text-navy-700 transition-colors">
                Kayıt Olun
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-navy-300 text-xs mt-6">
          © 2026 Öğretmen Kitap Değerlendirme Sistemi
        </p>
      </div>
    </div>
  )
}
