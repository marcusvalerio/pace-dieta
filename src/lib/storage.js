const KEY = 'pace_plano'
const CHECKED_KEY = 'pace_checked'
const WEIGHTS_KEY = 'pace_weights'
const COMPRAS_KEY = 'pace_compras'

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
