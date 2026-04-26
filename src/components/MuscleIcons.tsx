import { ReactNode } from 'react'

interface IconProps {
  size?: number
  color?: string
}

export function ChestIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9C3 6 6.5 4 12 4C17.5 4 21 6 21 9L19.5 17C19.5 18.5 16.5 19.5 12 19.5C7.5 19.5 4.5 18.5 4.5 17Z" />
      <line x1="12" y1="4" x2="12" y2="19.5" />
      <path d="M7.5 10.5C7.5 9.5 9.5 9 12 9" strokeOpacity="0.5" />
      <path d="M16.5 10.5C16.5 9.5 14.5 9 12 9" strokeOpacity="0.5" />
    </svg>
  )
}

export function BackIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6L12 3L20 6L20 14L12 21L4 14Z" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="4" y1="10" x2="20" y2="10" />
    </svg>
  )
}

export function LegsIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 4L8 12L6.5 21" />
      <path d="M14.5 4L16 12L17.5 21" />
      <path d="M9.5 4L14.5 4" />
      <path d="M8 12Q12 14.5 16 12" />
      <path d="M6.5 21Q7.5 20 8.5 21" />
      <path d="M17.5 21Q16.5 20 15.5 21" />
    </svg>
  )
}

export function ShoulderIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="9" rx="3" ry="4.5" />
      <ellipse cx="5.5" cy="11" rx="2.5" ry="3.5" transform="rotate(-15 5.5 11)" />
      <ellipse cx="18.5" cy="11" rx="2.5" ry="3.5" transform="rotate(15 18.5 11)" />
    </svg>
  )
}

export function ArmIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 19L8 13C8 8.5 10 5 12 4C14 5 16 8.5 16 13L18 19" />
      <path d="M6 19Q12 21.5 18 19" />
      <path d="M9.5 10.5Q12 7.5 14.5 10.5" />
    </svg>
  )
}

export function FullBodyIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="M9 8.5L15 8.5L16 14.5L14 21.5" />
      <path d="M9 8.5L8 14.5L10 21.5" />
      <path d="M9 8.5L5.5 12.5" />
      <path d="M15 8.5L18.5 12.5" />
    </svg>
  )
}

export function RestIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function CoreIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="5" width="10" height="14" rx="3" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="7" y1="10" x2="17" y2="10" />
      <line x1="7" y1="14" x2="17" y2="14" />
    </svg>
  )
}

export function getMuscleIcon(group: string, size = 24, color = 'currentColor'): ReactNode {
  switch (group) {
    case 'Brust':    return <ChestIcon size={size} color={color} />
    case 'Rücken':   return <BackIcon size={size} color={color} />
    case 'Beine':
    case 'Gesäß':    return <LegsIcon size={size} color={color} />
    case 'Schultern': return <ShoulderIcon size={size} color={color} />
    case 'Bizeps':
    case 'Trizeps':
    case 'Arme':     return <ArmIcon size={size} color={color} />
    case 'Core':     return <CoreIcon size={size} color={color} />
    case 'Ruhetag':  return <RestIcon size={size} color={color} />
    default:         return <FullBodyIcon size={size} color={color} />
  }
}

export function detectPrimaryMuscle(
  exercises: Array<{ muscle_group?: string | null; name: string }>,
  dayLabel?: string,
): string {
  const LABEL_MAP: Record<string, string> = {
    'Push': 'Brust',
    'Pull': 'Rücken',
    'Beine': 'Beine',
    'Schultern & Arme': 'Schultern',
    'Brust & Rücken': 'Brust',
    'Ganzkörper': 'Ganzkörper',
    'Ruhetag': 'Ruhetag',
  }

  if (dayLabel === 'Ruhetag') return 'Ruhetag'

  const groups: Record<string, number> = {}
  for (const ex of exercises) {
    if (ex.muscle_group) groups[ex.muscle_group] = (groups[ex.muscle_group] || 0) + 1
  }

  if (Object.keys(groups).length > 0) {
    return Object.entries(groups).sort((a, b) => b[1] - a[1])[0][0]
  }

  if (dayLabel) return LABEL_MAP[dayLabel] || 'Ganzkörper'
  return 'Ganzkörper'
}
