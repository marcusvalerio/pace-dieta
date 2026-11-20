import { ordenarRefeicoes, labelRefeicao } from './refeicoes'

export function refeicoesDoDia(plano, checked) {
  const pd = plano?.plano_diario || {}
  return ordenarRefeicoes(pd).map(k => {
    const itens = pd[k].alimentos || []
    const feitos = itens.filter((_, i) => checked[`${k}__${i}`]).length
    return { key: k, nome: labelRefeicao(k), horario: pd[k].horario, itens, feitos, completa: itens.length > 0 && feitos === itens.length }
  })
}

export function proximaRefeicao(lista) {
  const agora = new Date().toTimeString().slice(0, 5)
  const pendentes = lista.filter(r => r.itens.length && !r.completa)
  return pendentes.find(r => (r.horario || '') >= agora) || pendentes[0] || null
}

export function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export function dataCurta(d = new Date()) {
  const s = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
