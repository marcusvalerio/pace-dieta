// Labels e ordem canônica das refeições — usado para exibir corretamente
// independente de quais o usuário selecionou no onboarding
export const REFEICAO_LABELS = {
  cafe_manha:   'Café da manhã',
  lanche_manha: 'Lanche da manhã',
  almoco:       'Almoço',
  lanche_tarde: 'Lanche da tarde',
  pre_treino:   'Pré-treino',
  pos_treino:   'Pós-treino',
  janta:        'Janta',
  ceia:         'Ceia',
}

export const REFEICAO_ORDEM = ['cafe_manha', 'lanche_manha', 'pre_treino', 'almoco', 'lanche_tarde', 'pos_treino', 'janta', 'ceia']

export function ordenarRefeicoes(planoDiario) {
  if (!planoDiario) return []
  const keys = Object.keys(planoDiario)
  return keys.sort((a, b) => {
    const ia = REFEICAO_ORDEM.indexOf(a)
    const ib = REFEICAO_ORDEM.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

export function labelRefeicao(key) {
  return REFEICAO_LABELS[key] || key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}
