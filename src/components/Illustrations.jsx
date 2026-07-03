// Ilustrações line-art minimalistas, feitas sob medida — sem elementos cartoon,
// mantendo o silêncio visual das referências (Aesop, Nothing, Porsche)

export function IllustrationScale({ size = 88 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <circle cx="44" cy="44" r="43" stroke="var(--border2)" strokeWidth="1" />
      <path d="M44 22V66M28 30h32M28 30l-8 16a8 8 0 0016 0l-8-16zM60 30l-8 16a8 8 0 0016 0l-8-16z"
        stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="32" y="62" width="24" height="4" rx="2" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  )
}

export function IllustrationCheck({ size = 88 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <circle cx="44" cy="44" r="43" stroke="var(--accent-dim)" strokeWidth="1" />
      <circle cx="44" cy="44" r="30" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M32 44l8 8 16-16" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IllustrationFlame({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 8c4 8-4 12-4 20a8 8 0 0016 0c0-4-2-6-2-6s2 8-4 8a5 5 0 01-5-5c0-6 6-8 6-17-6 2-11 8-11 16a11 11 0 0022 0c0-14-10-18-10-26z"
        stroke="var(--accent)" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IllustrationLeaf({ size = 88 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <circle cx="44" cy="44" r="43" stroke="var(--border2)" strokeWidth="1" />
      <path d="M44 62c-14 0-22-10-22-24 0-10 8-16 22-18 14 2 22 8 22 18 0 14-8 24-22 24z"
        stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M44 20v42" stroke="var(--accent)" strokeWidth="1.2" />
      <path d="M44 30c-6 0-10 4-10 4M44 42c-8 0-13 5-13 5M44 30c6 0 10 4 10 4M44 42c8 0 13 5 13 5"
        stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
