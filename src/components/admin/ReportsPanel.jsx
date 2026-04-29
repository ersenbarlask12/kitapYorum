import { useMemo } from 'react'
import { Star, BookOpen, Building2 } from 'lucide-react'

export function ReportsPanel({ data }) {
  // We only care about data that has a star rating
  const ratedData = useMemo(() => data.filter(c => c.kullanim_puani && c.kullanim_puani > 0), [data])

  const stats = useMemo(() => {
    const totalVotes = ratedData.length
    const average = totalVotes > 0 
      ? (ratedData.reduce((acc, c) => acc + c.kullanim_puani, 0) / totalVotes).toFixed(1) 
      : 0

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    ratedData.forEach(c => {
      distribution[c.kullanim_puani] = (distribution[c.kullanim_puani] || 0) + 1
    })

    // Group by Publisher
    const byPublisher = {}
    ratedData.forEach(c => {
      const pub = (c.yayin_evi || 'Bilinmeyen').toUpperCase().trim()
      if (!byPublisher[pub]) byPublisher[pub] = { name: c.yayin_evi.trim(), sum: 0, count: 0 }
      byPublisher[pub].sum += c.kullanim_puani
      byPublisher[pub].count += 1
    })
    const publisherStats = Object.values(byPublisher)
      .map(p => ({ ...p, avg: (p.sum / p.count).toFixed(1) }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count)

    // Group by Book
    const byBook = {}
    ratedData.forEach(c => {
      const book = (c.kitap_adi || 'Bilinmeyen').toUpperCase().trim()
      if (!byBook[book]) byBook[book] = { name: c.kitap_adi.trim(), publisher: c.yayin_evi.trim(), sum: 0, count: 0 }
      byBook[book].sum += c.kullanim_puani
      byBook[book].count += 1
    })
    const bookStats = Object.values(byBook)
      .map(b => ({ ...b, avg: (b.sum / b.count).toFixed(1) }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count)

    return { totalVotes, average, distribution, publisherStats, bookStats }
  }, [ratedData])

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">Bu filtrelere uygun yorum bulunamadı.</p>
      </div>
    )
  }

  if (ratedData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">Bu yorumlarda henüz yıldız değerlendirmesi yapılmamış.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-6 shadow-sm">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Genel Ortalama</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-bold text-navy-800">{stats.average}</span>
              <span className="text-lg font-medium text-gray-400">/ 5.0</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Toplam {stats.totalVotes} değerlendirme</p>
          </div>
          <div className="w-24 h-24 bg-gold-50 rounded-full flex items-center justify-center shrink-0">
            <Star className="text-gold-500 fill-gold-500" size={48} />
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Puan Dağılımı</p>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.distribution[star]
              const percentage = stats.totalVotes > 0 ? (count / stats.totalVotes) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-16 text-gray-600 font-medium">
                    {star} <Star size={14} className="text-gold-400 fill-gold-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold-400 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-gray-500 text-xs font-medium">
                    {count} oy
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Book Stats */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm max-h-[500px]">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-navy-600" />
              <h3 className="font-semibold text-navy-800">Kitaplara Göre</h3>
            </div>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 text-xs border-b border-gray-200 sticky top-0 shadow-sm">
                <tr>
                  <th className="px-5 py-3 font-semibold">Kitap Adı</th>
                  <th className="px-5 py-3 font-semibold text-center w-24">Ortalama</th>
                  <th className="px-5 py-3 font-semibold text-center w-20">Oy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.bookStats.map((book, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy-700">{book.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{book.publisher}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center bg-gold-50 text-gold-700 font-bold px-2 py-1 rounded-lg w-14">
                        {book.avg}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-gray-500">{book.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Publisher Stats */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm max-h-[500px]">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50 sticky top-0 z-10">
            <Building2 size={18} className="text-navy-600" />
            <h3 className="font-semibold text-navy-800">Yayınevlerine Göre</h3>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 text-xs border-b border-gray-200 sticky top-0 shadow-sm">
                <tr>
                  <th className="px-5 py-3 font-semibold">Yayınevi</th>
                  <th className="px-5 py-3 font-semibold text-center w-24">Ortalama</th>
                  <th className="px-5 py-3 font-semibold text-center w-20">Oy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.publisherStats.map((pub, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-navy-700">{pub.name}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center bg-gold-50 text-gold-700 font-bold px-2 py-1 rounded-lg w-14">
                        {pub.avg}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-gray-500">{pub.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
