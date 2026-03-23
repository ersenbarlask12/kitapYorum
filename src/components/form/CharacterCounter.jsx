export function CharacterCounter({ current, max }) {
  const remaining = max - current
  const pct = Math.min((current / max) * 100, 100)
  const color = current < 50 ? 'text-gray-400' : current > max ? 'text-red-500' : current >= max * 0.9 ? 'text-amber-500' : 'text-green-600'

  return (
    <div className="mt-1.5 flex items-center justify-between">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${pct >= 100 ? 'bg-red-400' : pct >= 90 ? 'bg-amber-400' : pct >= 10 ? 'bg-green-400' : 'bg-gray-300'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs ml-3 font-medium tabular-nums ${color}`}>
        {current}/{max}
      </span>
    </div>
  )
}
