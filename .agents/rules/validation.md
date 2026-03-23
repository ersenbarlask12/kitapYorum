# Veri Doğrulama Kuralları

## Aktivasyon
Bu kural form bileşenleri, Zod şemaları veya Supabase INSERT/UPDATE işlemleri yazılırken her zaman uygulanır.

## Alan Kuralları

| Alan | Kural |
|---|---|
| `tc_kimlik_no` | Tam 11 haneli rakam; 0 ile başlayamaz; `^\[1-9\]\d{10}$` |
| `ad_soyad` | min 5, max 100 karakter |
| `sifre` | min 8 karakter, en az 1 rakam içermeli |
| `sifre_tekrar` | `sifre` alanıyla birebir eşleşmeli |
| `yayin_evi` | min 2, max 150 karakter |
| `kitap_adi` | min 2, max 200 karakter |
| `yorum` | min 50, max 2000 karakter |

## Türkçe Hata Mesajları

```typescript
const messages = {
  required: "Bu alan zorunludur",
  tcFormat: "TC Kimlik No 11 haneli olmalı ve 0 ile başlamamalıdır",
  passwordWeak: "Şifre en az 8 karakter ve 1 rakam içermelidir",
  passwordMismatch: "Şifreler eşleşmiyor",
  minLength: (n: number) => `En az ${n} karakter giriniz`,
  maxLength: (n: number) => `En fazla ${n} karakter giriniz`,
  selectRequired: "Lütfen bir seçim yapınız",
}
```

## Zod Şema Örneği

```typescript
import { z } from "zod"

export const registerSchema = z.object({
  tc_kimlik_no: z
    .string()
    .regex(/^[1-9]\d{10}$/, messages.tcFormat),
  ad_soyad: z
    .string()
    .min(5, messages.minLength(5))
    .max(100, messages.maxLength(100)),
  sifre: z
    .string()
    .min(8, messages.passwordWeak)
    .regex(/\d/, messages.passwordWeak),
  sifre_tekrar: z.string(),
}).refine((d) => d.sifre === d.sifre_tekrar, {
  message: messages.passwordMismatch,
  path: ["sifre_tekrar"],
})

export const commentSchema = z.object({
  yayin_evi: z.string().min(2, messages.minLength(2)).max(150, messages.maxLength(150)),
  kitap_adi: z.string().min(2, messages.minLength(2)).max(200, messages.maxLength(200)),
  yorum: z.string().min(50, messages.minLength(50)).max(2000, messages.maxLength(2000)),
})
```
