// Símbolo Pace: prato com a folha vazada (a folha fica sempre dentro do círculo)
export const FOLHA = 'M24.4 75.6C30.8 43.6 56.4 26 75.6 24.4C69.2 56.4 43.6 74 24.4 75.6Z'

export default function Simbolo({ size = 24, cor = '#C2E297', titulo }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role={titulo ? 'img' : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true}>
      <path fillRule="evenodd" fill={cor} d={`M50 10a40 40 0 1 1 0 80a40 40 0 1 1 0-80Z${FOLHA}`} />
    </svg>
  )
}
