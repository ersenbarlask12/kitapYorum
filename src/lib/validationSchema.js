import { z } from 'zod'

// TC Kimlik No validation
const tcKimlikNo = z
  .string()
  .min(11, 'TC Kimlik No 11 haneli olmalıdır')
  .max(11, 'TC Kimlik No 11 haneli olmalıdır')
  .regex(/^[0-9]+$/, 'TC Kimlik No yalnızca rakamlardan oluşmalıdır')
  .refine((val) => !val.startsWith('0'), 'TC Kimlik No 0 ile başlayamaz')

// Kayıt şeması
export const registerSchema = z
  .object({
    tc_kimlik_no: tcKimlikNo,
    ad_soyad: z
      .string()
      .min(5, 'Ad Soyad en az 5 karakter olmalıdır')
      .max(100, 'Ad Soyad en fazla 100 karakter olabilir')
      .regex(/\S+\s+\S+/, 'Ad ve soyadı ayrı yazınız'),
    sifre: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/[0-9]/, 'Şifre en az 1 rakam içermelidir'),
    sifre_tekrar: z.string(),
  })
  .refine((data) => data.sifre === data.sifre_tekrar, {
    message: 'Şifreler eşleşmiyor',
    path: ['sifre_tekrar'],
  })

// Giriş şeması
export const loginSchema = z.object({
  tc_kimlik_no: tcKimlikNo,
  sifre: z.string().min(1, 'Şifre boş bırakılamaz'),
  beni_hatirla: z.boolean().optional().default(false),
})

// Yorum ekleme şeması
export const commentSchema = z.object({
  kademe_id: z.coerce.number().min(1, 'Kademe seçiniz'),
  sinif_seviyesi_id: z.coerce.number().min(1, 'Sınıf seviyesi seçiniz'),
  ders_id: z.coerce.number().min(1, 'Ders seçiniz'),
  yayin_evi: z
    .string()
    .min(2, 'Yayınevi en az 2 karakter olmalıdır')
    .max(150, 'Yayınevi en fazla 150 karakter olabilir'),
  kitap_adi: z
    .string()
    .min(2, 'Kitap adı en az 2 karakter olmalıdır')
    .max(200, 'Kitap adı en fazla 200 karakter olabilir'),
  yorum: z
    .string()
    .min(50, 'Yorum en az 50 karakter olmalıdır')
    .max(2000, 'Yorum en fazla 2000 karakter olabilir'),
  kullanim_puani: z
    .number()
    .min(1, 'Lütfen kitabı kullanma durumunuzu değerlendiriniz (1-5 yıldız)')
    .max(5, 'Geçersiz puan'),
})

// Yorum güncelleme şeması (sadece düzenlenebilir alanlar)
export const updateCommentSchema = z.object({
  yayin_evi: z
    .string()
    .min(2, 'Yayınevi en az 2 karakter olmalıdır')
    .max(150, 'Yayınevi en fazla 150 karakter olabilir'),
  kitap_adi: z
    .string()
    .min(2, 'Kitap adı en az 2 karakter olmalıdır')
    .max(200, 'Kitap adı en fazla 200 karakter olabilir'),
  yorum: z
    .string()
    .min(50, 'Yorum en az 50 karakter olmalıdır')
    .max(2000, 'Yorum en fazla 2000 karakter olabilir'),
  kullanim_puani: z
    .number()
    .min(1, 'Lütfen kitabı kullanma durumunuzu değerlendiriniz (1-5 yıldız)')
    .max(5, 'Geçersiz puan'),
})

// Hikaye Seti Değerlendirme Şeması
export const storyBookSchema = z.object({
  kademe_id: z.coerce.number().min(1, 'Kademe seçiniz'),
  sinif_seviyesi_id: z.coerce.number().min(1, 'Sınıf seviyesi seçiniz'),
  ders_id: z.coerce.number().optional().nullable(), // Hikaye setlerinde zorunlu değil
  yayin_evi: z
    .string()
    .min(2, 'Yayınevi en az 2 karakter olmalıdır')
    .max(150, 'Yayınevi en fazla 150 karakter olabilir'),
  kitap_adi: z
    .string()
    .min(2, 'Kitap seti adı en az 2 karakter olmalıdır')
    .max(200, 'Kitap seti adı en fazla 200 karakter olabilir'),
  toplam_kitap_sayisi: z.coerce.number().min(1, 'Toplam kitap sayısını giriniz'),
  kitap_basina_sayfa_sayisi: z.coerce.number().min(1, 'Kitap başına sayfa sayısını giriniz'),
  degerlendirme_kitapcigi_var_mi: z.string().min(1, 'Seçim yapınız'),
  onerilen_sinif_seviyesi: z.array(z.string()).min(1, 'En az bir sınıf seçiniz'),
  
  // Akademik Uygunluk
  akademik_sinif_seviyesine_uygun: z.string().min(1, 'Değerlendirme yapınız'),
  akademik_punto_sayfa_duzeni: z.string().min(1, 'Değerlendirme yapınız'),
  akademik_metin_yogunlugu: z.string().min(1, 'Değerlendirme yapınız'),
  akademik_sayfa_sayisi: z.string().min(1, 'Değerlendirme yapınız'),
  akademik_deger_aktarimi: z.string().min(1, 'Değerlendirme yapınız'),
  akademik_dil_sade: z.string().min(1, 'Değerlendirme yapınız'),
  akademik_gorsel_kalitesi: z.string().min(1, 'Değerlendirme yapınız'),

  // Değerlendirme Kitapçığı Kriterleri
  kitapcik_ayri_degerlendirme: z.string().min(1, 'Değerlendirme yapınız'),
  kitapcik_okudugunu_anlama: z.string().min(1, 'Değerlendirme yapınız'),
  kitapcik_acik_uclu: z.string().min(1, 'Değerlendirme yapınız'),
  kitapcik_cikarim_yorum: z.string().min(1, 'Değerlendirme yapınız'),
  kitapcik_kelime_calismasi: z.string().min(1, 'Değerlendirme yapınız'),
  kitapcik_cevap_anahtari: z.string().min(1, 'Değerlendirme yapınız'),
  kitapcik_ogrenci_seviyesine_uygun: z.string().min(1, 'Değerlendirme yapınız'),

  nihai_karar: z.string().min(1, 'Nihai kararınızı belirtiniz'),
  yorum: z
    .string()
    .min(50, 'Öğretmen görüşü en az 50 karakter olmalıdır')
    .max(2000, 'Öğretmen görüşü en fazla 2000 karakter olabilir'),
})

