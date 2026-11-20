// O Pace não prescreve dieta: o plano é o que a pessoa (ou o nutri dela) cadastra.
const HORARIOS = { cafe_manha: '07:00', lanche_manha: '10:00', pre_treino: '16:30', almoco: '12:30', lanche_tarde: '15:30', pos_treino: '18:30', janta: '20:00', ceia: '22:00' }

export function sincronizarRefeicoes(planoDiario = {}, chaves = []) {
  const novo = {}
  chaves.forEach(k => { novo[k] = planoDiario[k] || { horario: HORARIOS[k] || '', alimentos: [] } })
  return novo
}

export function planoVazio(usuario, chaves) {
  return { origem: 'proprio', usuario, plano_diario: sincronizarRefeicoes({}, chaves) }
}

// Lista de compras sai dos alimentos que a pessoa cadastrou
export function listaDoPlano(plano) {
  if (plano?.lista_compras) return plano.lista_compras
  const itens = new Set()
  Object.values(plano?.plano_diario || {}).forEach(r => (r.alimentos || []).forEach(a => a.item?.trim() && itens.add(a.item.trim())))
  return { do_seu_plano: [...itens].sort((a, b) => a.localeCompare(b, 'pt-BR')) }
}
