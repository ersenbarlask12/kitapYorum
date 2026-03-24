import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.join(__dirname, '../.env')
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'))
  return match ? match[1].trim() : null
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL veya Anon Key eksik. .env dosyasını kontrol edin.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Veritabanına bağlanılıyor...')
  try {
    const { data, error } = await supabase.from('kademeler').select('*').limit(1)
    
    if (error) {
      console.error('Veritabanı bağlantısı HATALI:', error.message)
    } else {
      console.log('Veritabanı bağlantısı BAŞARILI. Alınan veri:', data)
    }
  } catch (err) {
    console.error('Bilinmeyen bir HATA oluştu:', err.message)
  }
}

testConnection()
