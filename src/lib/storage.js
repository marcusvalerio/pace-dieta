const KEY = 'pace_plano'
const CHECKED_KEY = 'pace_checked'
const WEIGHTS_KEY = 'pace_weights'
const COMPRAS_KEY = 'pace_compras'
const STREAK_KEY = 'pace_streak'

export function getPlano() {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}
export function savePlano(plano) {
  localStorage.setItem(KEY, JSON.stringify(plano))
}
export function clearPlano() {
  localStorage.removeItem(KEY)
  localStorage.removeItem(CHECKED_KEY)
  localStorage.removeItem(COMPRAS_KEY)
}

// checked agora é por dia: { "2026-07-01": { "cafe_manha__0": true, ... } }
export function getChecked() {
  try { return JSON.parse(localStorage.getItem(CHECKED_KEY)) || {} } catch { return {} }
}
export function saveChecked(checked) {
  localStorage.setItem(CHECKED_KEY, JSON.stringify(checked))
}

export function getCompras() {
  try { return JSON.parse(localStorage.getItem(COMPRAS_KEY)) || {} } catch { return {} }
}
export function saveCompras(compras) {
  localStorage.setItem(COMPRAS_KEY, JSON.stringify(compras))
}

export function getWeights() {
  try { return JSON.parse(localStorage.getItem(WEIGHTS_KEY)) || [] } catch { return [] }
}
export function saveWeights(weights) {
  localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights))
}

// Streak: calcula quantos dias seguidos (terminando hoje ou ontem) a dieta foi 100% concluída
export function calcularStreak(checkedPorDia, totalItensDia) {
  if (!totalItensDia) return 0
  const dias = Object.keys(checkedPorDia).sort().reverse()
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
      // hoje ainda não completo — não quebra streak, só não conta ainda
      cursor.setDate(cursor.getDate() - 1)
      continue
    } else {
      break
    }
  }
  return streak
}
