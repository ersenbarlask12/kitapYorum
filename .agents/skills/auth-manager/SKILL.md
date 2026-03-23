---
name: auth-manager
description: TC Kimlik No ve şifre ile Supabase Auth üzerinden kayıt ve giriş işlemlerini yönetir. Öğretmen oturum akışı, korumalı route'lar ve Zustand auth store yazılırken kullan.
---

# Auth Manager Skill

## Genel Yaklaşım
Supabase'in standart Auth sistemi kullanılır. TC Kimlik No doğrudan e-posta olarak kullanılamayacağı için şu dönüşüm uygulanır:
```
TC: 12345678901  →  email: 12345678901@tcauth.local
```

## Kayıt (signUp)

```typescript
// hooks/useAuth.ts
export async function register(tcKimlikNo: string, adSoyad: string, sifre: string) {
  const email = `${tcKimlikNo}@tcauth.local`
  const { data, error } = await supabase.auth.signUp({
    email,
    password: sifre,
    options: {
      data: { ad_soyad: adSoyad, tc_kimlik_no: tcKimlikNo }
    }
  })
  if (error) throw new Error("Kayıt başarısız. Lütfen tekrar deneyin.")
  return data
}
```

## Giriş (signIn)

```typescript
export async function login(tcKimlikNo: string, sifre: string) {
  const email = `${tcKimlikNo}@tcauth.local`
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: sifre })
  if (error) throw new Error("TC Kimlik No veya şifre hatalı.")
  return data
}
```

## Zustand Auth Store

```typescript
// store/authStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },
    }),
    { name: "auth-storage" }
  )
)
```

## Korumalı Route

```tsx
// components/auth/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/giris" replace />
  return <>{children}</>
}
```

## Giriş Kilidi (3 Hatalı Deneme)
- Deneme sayısı `sessionStorage`'da tutulur
- 3 hatalı denemede 30 saniye bekleme gösterilir
- Geri sayım tamamlanınca form tekrar aktif olur
- Başarılı girişte sayaç sıfırlanır
