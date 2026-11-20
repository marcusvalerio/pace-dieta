import { dados } from './api'

// O usuário vem da sessão no servidor; userId só indica que há alguém logado.
const tenta = (fn, padrao) => fn().catch(() => padrao)

// ── Plano ──────────────────────────────────────────────
export async function getPlano(userId) {
  if (!userId) return null
  return tenta(() => dados('plano'), null)
}
export async function savePlano(userId, plano) {
  if (!userId) return
  await tenta(() => dados('salvarPlano', { plano }))
}
export async function clearPlano(userId) {
  if (!userId) return
  await tenta(() => dados('limparPlano', {}))
}

// ── Checklist diário ───────────────────────────────────
export async function getChecked(userId) {
  if (!userId) return {}
  return tenta(() => dados('checklist'), {})
}
export async function saveCheckedDia(userId, data, itens) {
  if (!userId) return
  await tenta(() => dados('salvarChecklist', { data, itens }))
}

// ── Lista de compras ───────────────────────────────────
export async function getCompras(userId) {
  if (!userId) return {}
  return tenta(() => dados('compras'), {})
}
export async function saveCompras(userId, itens) {
  if (!userId) return
  await tenta(() => dados('salvarCompras', { itens }))
}

// ── Peso ───────────────────────────────────────────────
export async function getWeights(userId) {
  if (!userId) return []
  return tenta(() => dados('pesos'), [])
}
export async function saveWeight(userId, date, val) {
  if (!userId) return
  await tenta(() => dados('salvarPeso', { data: date, valor: val }))
}

// ── Streak / celebração ────────────────────────────────
export async function getCelebracoes(userId) {
  if (!userId) return []
  return tenta(() => dados('celebracoes'), [])
}
export async function marcarCelebrado(userId, date) {
  if (!userId) return
  await tenta(() => dados('celebrar', { data: date }))
}

// Streak: dias seguidos (terminando hoje ou ontem) com dieta 100% completa
export function calcularStreak(checkedPorDia, totalItensDia) {
  if (!totalItensDia) return 0
  let streak = 0
  let cursor = new Date()
  for (let i = 0; i < 365; i++) {
    const dateStr = cursor.toISOString().split('T')[0]
    const diaChecked = checkedPorDia[dateStr] || {}
    const doneCount = Object.values(diaChecked).filter(Boolean).length
    const completo = doneCount >= totalItensDia && totalItensDia > 0
    if (completo) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (dateStr === new Date().toISOString().split('T')[0]) {
      cursor.setDate(cursor.getDate() - 1)
      continue
    } else {
      break
    }
  }
  return streak
}
