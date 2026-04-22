interface MacroRingProps {
  value: number
  max: number
  color: string
  label: string
  unit: string
}

export function MacroRing({ value, max, color, label, unit }: MacroRingProps) {
  const r = 28
  const circumference = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const dash = pct * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#2a2a2a" strokeWidth={6} />
        <circle
          cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round" transform="rotate(-90 35 35)"
        />
        <text x="35" y="39" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{value}</text>
      </svg>
      <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, marginTop: -4 }}>{value}/{max}{unit}</span>
    </div>
  )
}
