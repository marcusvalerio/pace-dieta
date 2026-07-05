import { supabase } from './supabase'

// ── Plano ──────────────────────────────────────────────
export async function getPlano(userId) {
  if (!userId) return null
  const { data } = await supabase.from('pace_planos').select('plano').eq('user_id', userId).maybeSingle()
  return data?.plano || null
}
export async function savePlano(userId, plano) {
  if (!userId) return
  await supabase.from('pace_planos').upsert({ user_id: userId, plano, updated_at: new Date().toISOString() })
}
export async function clearPlano(userId) {
  if (!userId) return
  await supabase.from('pace_planos').delete().eq('user_id', userId)
  await supabase.from('pace_pesos').delete().eq('user_id', userId)
  await supabase.from('pace_checklist').delete().eq('user_id', userId)
  await supabase.from('pace_compras').delete().eq('user_id', userId)
  await supabase.from('pace_sintomas').delete().eq('user_id', userId)
  await supabase.from('pace_celebracoes').delete().eq('user_id', userId)
}

// ── Checklist diário ───────────────────────────────────
export async function getChecked(userId) {
  if (!userId) return {}
  const { data } = await supabase.from('pace_checklist').select('data, itens').eq('user_id', userId)
  const porDia = {}
  ;(data || []).forEach(row => { porDia[row.data] = row.itens || {} })
  return porDia
}
export async function saveCheckedDia(userId, data, itens) {
  if (!userId) return
  await supabase.from('pace_checklist').upsert({ user_id: userId, data, itens })
}

// ── Lista de compras ───────────────────────────────────
export async function getCompras(userId) {
  if (!userId) return {}
  const { data } = await supabase.from('pace_compras').select('itens').eq('user_id', userId).maybeSingle()
  return data?.itens || {}
}
export async function saveCompras(userId, itens) {
  if (!userId) return
  await supabase.from('pace_compras').upsert({ user_id: userId, itens, updated_at: new Date().toISOString() })
}

// ── Peso ───────────────────────────────────────────────
export async function getWeights(userId) {
  if (!userId) return []
  const { data } = await supabase.from('pace_pesos').select('data, valor').eq('user_id', userId).order('data')
  return (data || []).map(w => ({ date: w.data, val: Number(w.valor) }))
}
export async function saveWeight(userId, date, val) {
  if (!userId) return
  await supabase.from('pace_pesos').upsert({ user_id: userId, data: date, valor: val })
}

// ── Streak / celebração ────────────────────────────────
export async function getCelebracoes(userId) {
  if (!userId) return []
  const { data } = await supabase.from('pace_celebracoes').select('data').eq('user_id', userId)
  return (data || []).map(c => c.data)
}
export async function marcarCelebrado(userId, date) {
  if (!userId) return
  await supabase.from('pace_celebracoes').upsert({ user_id: userId, data: date })
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
