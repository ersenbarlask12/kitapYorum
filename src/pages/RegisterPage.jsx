import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { registerSchema } from '../lib/validationSchema'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/ui/Toast'
import { Spinner } from '../components/ui/Spinner'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const { user } = useAuthStore()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordTekrar, setShowPasswordTekrar] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  useEffect(() => {
    if (user) navigate('/ogretmen', { replace: true })
  }, [user, navigate])

  const sifre = watch('sifre', '')
  const hasMinLength = sifre.length >= 8
  const hasNumber = /[0-9]/.test(sifre)

  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      await registerUser(values.tc_kimlik_no, values.ad_soyad, values.sifre)
      setSuccess(true)
      toast.success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...')
      setTimeout(() => navigate('/giris'), 2500)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 flex items-center justify-center p-4">
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
          <p className="text-navy-200 mt-1">Yeni Hesap Oluşturun</p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h2 className="text-xl font-display font-bold text-navy-700 mb-2">Kayıt Başarılı!</h2>
            <p className="text-gray-600">Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-display font-bold text-navy-700 mb-6">Kayıt Olun</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* TC Kimlik No */}
              <div>
                <label className="form-label" htmlFor="reg_tc">TC Kimlik No</label>
                <input
                  id="reg_tc"
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="12345678901"
                  className={`form-input ${errors.tc_kimlik_no ? 'form-input-error' : ''}`}
                  {...register('tc_kimlik_no')}
                />
                {errors.tc_kimlik_no && (
                  <p className="form-error"><AlertCircle size={14} />{errors.tc_kimlik_no.message}</p>
                )}
              </div>

              {/* Ad Soyad */}
              <div>
                <label className="form-label" htmlFor="ad_soyad">Ad Soyad</label>
                <input
                  id="ad_soyad"
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  className={`form-input ${errors.ad_soyad ? 'form-input-error' : ''}`}
                  {...register('ad_soyad')}
                />
                {errors.ad_soyad && (
                  <p className="form-error"><AlertCircle size={14} />{errors.ad_soyad.message}</p>
                )}
              </div>

              {/* Şifre */}
              <div>
                <label className="form-label" htmlFor="reg_sifre">Şifre</label>
                <div className="relative">
                  <input
                    id="reg_sifre"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`form-input pr-12 ${errors.sifre ? 'form-input-error' : ''}`}
                    {...register('sifre')}
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.sifre && (
                  <p className="form-error"><AlertCircle size={14} />{errors.sifre.message}</p>
                )}
                {/* Password strength hints */}
                {sifre.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle size={12} /> En az 8 karakter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle size={12} /> En az 1 rakam
                    </div>
                  </div>
                )}
              </div>

              {/* Şifre Tekrar */}
              <div>
                <label className="form-label" htmlFor="sifre_tekrar">Şifre Tekrar</label>
                <div className="relative">
                  <input
                    id="sifre_tekrar"
                    type={showPasswordTekrar ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`form-input pr-12 ${errors.sifre_tekrar ? 'form-input-error' : ''}`}
                    {...register('sifre_tekrar')}
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPasswordTekrar(!showPasswordTekrar)}>
                    {showPasswordTekrar ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.sifre_tekrar && (
                  <p className="form-error"><AlertCircle size={14} />{errors.sifre_tekrar.message}</p>
                )}
              </div>

              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Spinner size="sm" /> Kayıt yapılıyor...</>
                ) : (
                  <><UserPlus size={18} /> Kayıt Ol</>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Zaten üye misiniz?{' '}
                <Link to="/giris" className="font-semibold text-navy-600 hover:text-navy-700 transition-colors">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-navy-300 text-xs mt-6">
          © 2026 Öğretmen Kitap Değerlendirme Sistemi
        </p>
      </div>
    </div>
  )
}
