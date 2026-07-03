const KEY = 'pace_sintomas'

export function getSintomas() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
export function saveSintomas(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function today() { return new Date().toISOString().split('T')[0] }

// Retorna true se o check-in de hoje ainda não foi respondido nem dispensado
export function precisaCheckinHoje() {
  const all = getSintomas()
  const hoje = all[today()]
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
