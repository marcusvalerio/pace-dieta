import { dados } from './api'

export function today() { return new Date().toISOString().split('T')[0] }

export async function getSintomasHoje(userId) {
  if (!userId) return null
  const r = await dados('sintomas', null, `&data=${today()}`).catch(() => [])
  return r?.[0] || null
}

export async function getSintomasHistorico(userId, limit = 6) {
  if (!userId) return []
  return dados('sintomas', null, `&limite=${limit}`).catch(() => [])
}

export async function salvarSintomas(userId, campos) {
  if (!userId) return
  const { data: _d, user_id: _u, ...resto } = campos || {}
  await dados('salvarSintomas', { data: today(), campos: resto }).catch(() => {})
}

export async function precisaCheckinHoje(userId) {
  const hoje = await getSintomasHoje(userId)
  return !hoje || (!hoje.enviado && !hoje.dismissed)
}

export const NIVEL_OPCOES = [
  { v: 0, label: 'Nenhum' },
  { v: 1, label: 'Leve' },
  { v: 2, label: 'Moderado' },
  { v: 3, label: 'Intenso' },
]

export const SONO_OPCOES = [
  { v: 0, label: 'Ruim' },
  { v: 1, label: 'Regular' },
  { v: 2, label: 'Boa' },
  { v: 3, label: 'Ótima' },
]
