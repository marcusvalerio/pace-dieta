// Monta o plano alimentar por regras fixas, sem IA.
// Calorias: Mifflin-St Jeor (média entre os sexos) x fator de atividade moderado.
// Alimentos e valores por 100 g aproximados da Tabela TACO (NEPA/UNICAMP).

const A = {
  arroz:      { nome: 'Arroz branco cozido',   k: 128, p: 2.5, c: 28.1, g: 0.2, un: 'g', passo: 10, cat: 'mercearia', preco: 6, cru: 0.4, compra: 'Arroz branco' },
  feijao:     { nome: 'Feijão cozido',          k: 76,  p: 4.8, c: 13.6, g: 0.5, un: 'g', passo: 10, cat: 'mercearia', preco: 9, cru: 0.45, compra: 'Feijão' },
  batatadoce: { nome: 'Batata-doce cozida',     k: 77,  p: 0.6, c: 18.4, g: 0.1, un: 'g', passo: 10, cat: 'hortifruti', preco: 6 },
  mandioca:   { nome: 'Mandioca cozida',        k: 125, p: 0.6, c: 30.1, g: 0.3, un: 'g', passo: 10, cat: 'hortifruti', preco: 7 },
  pao:        { nome: 'Pão francês',            k: 300, p: 8,   c: 58.6, g: 3.1, un: 'un', gUn: 50, cat: 'mercearia', preco: 16 },
  tapioca:    { nome: 'Tapioca (goma)',         k: 340, p: 0,   c: 85,   g: 0,   un: 'g', passo: 10, cat: 'mercearia', preco: 12 },
  aveia:      { nome: 'Aveia em flocos',        k: 394, p: 13.9,c: 66.6, g: 8.5, un: 'g', passo: 5,  cat: 'mercearia', preco: 18 },
  banana:     { nome: 'Banana',                 k: 98,  p: 1.3, c: 26,   g: 0.1, un: 'un', gUn: 100, cat: 'hortifruti', preco: 7 },
  maca:       { nome: 'Maçã',                   k: 56,  p: 0.3, c: 15.2, g: 0,   un: 'un', gUn: 130, cat: 'hortifruti', preco: 10 },
  mamao:      { nome: 'Mamão',                  k: 40,  p: 0.5, c: 10.4, g: 0.1, un: 'g', passo: 50, cat: 'hortifruti', preco: 7 },
  ovo:        { nome: 'Ovo cozido ou mexido',   k: 146, p: 13.3,c: 0.6,  g: 9.5, un: 'un', gUn: 50, cat: 'laticinios_e_ovos', preco: 18 },
  frango:     { nome: 'Peito de frango grelhado', k: 159, p: 32, c: 0,   g: 2.5, un: 'g', passo: 10, cat: 'acougue', preco: 22, cru: 1.35 },
  carne:      { nome: 'Patinho moído refogado', k: 219, p: 35.9,c: 0,    g: 7.3, un: 'g', passo: 10, cat: 'acougue', preco: 42, cru: 1.4 },
  peixe:      { nome: 'Tilápia grelhada',       k: 128, p: 26,  c: 0,    g: 2.6, un: 'g', passo: 10, cat: 'acougue', preco: 40, cru: 1.3 },
  graobico:   { nome: 'Grão-de-bico cozido',    k: 164, p: 8.9, c: 27.4, g: 2.6, un: 'g', passo: 10, cat: 'mercearia', preco: 16, cru: 0.45 },
  tofu:       { nome: 'Tofu grelhado',          k: 90,  p: 9.5, c: 2,    g: 5,   un: 'g', passo: 10, cat: 'mercearia', preco: 35 },
  leite:      { nome: 'Leite desnatado',        k: 35,  p: 3.4, c: 5,    g: 0.1, un: 'ml', passo: 50, cat: 'laticinios_e_ovos', preco: 5 },
  iogurte:    { nome: 'Iogurte natural',        k: 51,  p: 4.1, c: 1.9,  g: 3,   un: 'g', passo: 10, cat: 'laticinios_e_ovos', preco: 14 },
  bebidaveg:  { nome: 'Bebida de soja sem açúcar', k: 40, p: 3.3, c: 2,  g: 2,   un: 'ml', passo: 50, cat: 'mercearia', preco: 10 },
  queijo:     { nome: 'Queijo minas frescal',   k: 264, p: 17.4,c: 3.2,  g: 20.2,un: 'g', passo: 10, cat: 'laticinios_e_ovos', preco: 45 },
  amendoim:   { nome: 'Pasta de amendoim',      k: 600, p: 25,  c: 20,   g: 50,  un: 'col', gUn: 15, cat: 'mercearia', preco: 40 },
  azeite:     { nome: 'Azeite de oliva',        k: 884, p: 0,   c: 0,    g: 100, un: 'col', gUn: 8, cat: 'mercearia', preco: 60, fixo: true },
  legumes:    { nome: 'Legumes cozidos (cenoura, abobrinha, brócolis)', compra: 'Legumes variados', k: 30, p: 1.5, c: 6, g: 0.3, un: 'g', passo: 10, cat: 'hortifruti', preco: 8, fixo: true },
  salada:     { nome: 'Salada de folhas e tomate à vontade', compra: 'Folhas e tomate', k: 15, p: 1, c: 3, g: 0.2, un: 'g', passo: 10, cat: 'hortifruti', preco: 10, fixo: true },
  cafe:       { nome: 'Café sem açúcar',        k: 0,   p: 0,   c: 0,    g: 0,   un: 'ml', passo: 50, cat: 'mercearia', preco: 0, fixo: true },
}

// Cardápio base de cada refeição: [alimento, quantidade base]
const BASE = {
  cafe_manha:   { h: '07:00', itens: [['pao', 2], ['ovo', 2], ['banana', 1], ['cafe', 150]] },
  lanche_manha: { h: '10:00', itens: [['iogurte', 170], ['aveia', 20], ['maca', 1]] },
  pre_treino:   { h: '16:30', itens: [['banana', 1], ['aveia', 30]] },
  almoco:       { h: '12:30', itens: [['arroz', 150], ['feijao', 100], ['frango', 120], ['legumes', 100], ['salada', 80], ['azeite', 1]] },
  lanche_tarde: { h: '15:30', itens: [['pao', 1], ['queijo', 30], ['mamao', 150]] },
  pos_treino:   { h: '18:30', itens: [['ovo', 2], ['tapioca', 30], ['banana', 1]] },
  janta:        { h: '20:00', itens: [['batatadoce', 120], ['carne', 110], ['legumes', 100], ['salada', 80], ['azeite', 1]] },
  ceia:         { h: '22:00', itens: [['leite', 200], ['aveia', 15]] },
}

// Parte das calorias do dia de cada refeição (carboidrato decrescente ao longo do dia)
const PESO = { cafe_manha: 22, lanche_manha: 8, pre_treino: 8, almoco: 32, lanche_tarde: 10, pos_treino: 9, janta: 21, ceia: 6 }

const tem = (restr, termo) => restr.some(r => r.toLowerCase().includes(termo))

function trocas(restr) {
  const t = {}
  if (tem(restr, 'vegetar')) Object.assign(t, { frango: 'graobico', carne: 'tofu', peixe: 'tofu' })
  else if (tem(restr, 'carne vermelha')) Object.assign(t, { carne: 'peixe' })
  if (tem(restr, 'lactose')) Object.assign(t, { leite: 'bebidaveg', iogurte: 'bebidaveg', queijo: 'ovo' })
  if (tem(restr, 'glúten') || tem(restr, 'gluten')) Object.assign(t, { pao: 'tapioca', aveia: 'tapioca' })
  return t
}

const QTD_TROCA = { tapioca: 30, ovo: 1, bebidaveg: 200, graobico: 150, tofu: 150, peixe: 130 }

function kcalDe(id, q) {
  const a = A[id]
  const gramas = a.gUn ? q * a.gUn : q
  return {
    gramas,
    k: a.k * gramas / 100, p: a.p * gramas / 100, c: a.c * gramas / 100, g: a.g * gramas / 100,
  }
}

function arred(id, q) {
  const a = A[id]
  if (a.gUn) return Math.max(a.un === 'col' ? 1 : 1, Math.round(q * 2) / 2)
  return Math.max(a.passo, Math.round(q / a.passo) * a.passo)
}

function textoQtd(id, q) {
  const a = A[id]
  const n = String(q).replace('.', ',')
  if (a.un === 'un') return `${n} ${q > 1 ? 'unidades' : 'unidade'}`
  if (a.un === 'col') return `${n} ${q > 1 ? 'colheres de sopa' : 'colher de sopa'}`
  return `${n} ${a.un}`
}

function objetivoAjuste(obj) {
  const o = obj.toLowerCase()
  if (o.includes('perda') || o.includes('defini')) return { fator: 0.8, prot: 2.0 }
  if (o.includes('hipertrofia')) return { fator: 1.1, prot: 2.0 }
  if (o.includes('performance')) return { fator: 1.05, prot: 1.8 }
  return { fator: 1, prot: 1.6 }
}

export function montarPlano(usuario) {
  const { peso, altura, idade } = usuario
  const restr = usuario.restricoes || []
  const lowCarb = tem(restr, 'low carb')
  const semCafeTarde = tem(restr, 'cafeína')
  const tmb = 10 * peso + 6.25 * altura - 5 * idade - 78
  const gasto = tmb * 1.5
  const { fator, prot } = objetivoAjuste(usuario.objetivo || '')
  const alvo = Math.round(gasto * fator / 10) * 10
  const tr = trocas(restr)

  const chaves = (usuario.refeicoes_selecionadas || []).map(r => r.key).filter(k => BASE[k])
  const refeicoes = chaves.length ? chaves : ['cafe_manha', 'almoco', 'janta']
  const somaPeso = refeicoes.reduce((s, k) => s + PESO[k], 0)

  const plano_diario = {}
  const total = { k: 0, p: 0, c: 0, g: 0 }
  const usoDiario = {}

  for (const chave of refeicoes) {
    const base = BASE[chave]
    const metaRef = alvo * PESO[chave] / somaPeso
    let itens = base.itens.map(([id, q]) => tr[id] ? [tr[id], QTD_TROCA[tr[id]] ?? q] : [id, q])
    if (semCafeTarde && chave !== 'cafe_manha') itens = itens.filter(([id]) => id !== 'cafe')
    // junta itens repetidos depois das trocas
    const junto = {}
    itens.forEach(([id, q]) => { junto[id] = (junto[id] || 0) + q })
    itens = Object.entries(junto)

    const ehCarbo = id => A[id].c > 15 && A[id].p < 10
    const pesoCarb = lowCarb ? 0.5 : 1
    const fixoK = itens.filter(([id]) => A[id].fixo).reduce((s, [id, q]) => s + kcalDe(id, q).k, 0)
    const variavelK = itens.filter(([id]) => !A[id].fixo).reduce((s, [id, q]) => s + kcalDe(id, q).k * (ehCarbo(id) ? pesoCarb : 1), 0)
    const escala = Math.max(0.4, Math.min(2.5, (metaRef - fixoK) / (variavelK || 1)))

    const alimentos = []
    let kRef = 0
    for (const [id, q] of itens) {
      const qtd = A[id].fixo ? q : arred(id, q * escala * (ehCarbo(id) ? pesoCarb : 1))
      const m = kcalDe(id, qtd)
      kRef += m.k; total.k += m.k; total.p += m.p; total.c += m.c; total.g += m.g
      usoDiario[id] = (usoDiario[id] || 0) + m.gramas
      alimentos.push({ item: A[id].nome, quantidade: textoQtd(id, qtd) })
    }
    plano_diario[chave] = { horario: base.h, alimentos, calorias: Math.round(kRef / 10) * 10 }
  }

  // Lista de compras do mês e custo
  const lista_compras = { acougue: [], hortifruti: [], mercearia: [], laticinios_e_ovos: [], suplementos: [] }
  let custo = 0
  for (const [id, gDia] of Object.entries(usoDiario)) {
    const a = A[id]
    if (id === 'cafe') { lista_compras.mercearia.push('Café em pó: 500 g'); custo += 25; continue }
    const gMes = gDia * 30 * (a.cru || 1)
    custo += gMes / 1000 * a.preco
    let qtd
    if (id === 'ovo') qtd = `${Math.ceil(gMes / 50 / 12)} dúzias`
    else if (id === 'pao') qtd = `${Math.ceil(gMes / 50)} unidades`
    else if (a.un === 'ml') qtd = `${Math.ceil(gMes / 1000)} litros`
    else if (gMes >= 1000) qtd = `${(Math.ceil(gMes / 500) / 2).toString().replace('.', ',')} kg`
    else qtd = `${Math.ceil(gMes / 50) * 50} g`
    const nomeCompra = a.compra ? a.compra + (a.cru ? ' (cru)' : '') : a.cru ? a.nome.replace(/ (grelhad[oa]|cozido|refogado)$/, '') + ' (cru)' : a.nome.replace(/ (cozid[oa]|grelhad[oa]|refogado|cozido ou mexido)$/, '')
    lista_compras[a.cat].push(`${nomeCompra}: ${qtd}`)
  }

  const kcal = Math.round(total.k / 10) * 10
  const deficit = gasto - kcal
  const variacao = deficit * 30 / 7700
  const pesoFinal = Math.round((peso - variacao) * 10) / 10

  return {
    usuario: {
      nome: usuario.nome, peso, altura, idade, objetivo: usuario.objetivo,
      percentual_gordura: usuario.percentual_gordura ?? null,
      orcamento_mensal: usuario.orcamento_mensal, restricoes: restr,
    },
    resumo_nutricional: {
      calorias_totais_dia: kcal,
      proteinas_g: Math.round(total.p),
      carboidratos_g: Math.round(total.c),
      gorduras_g: Math.round(total.g),
      explicacao_breve: `Seu gasto diário estimado é de ${Math.round(gasto)} kcal. O plano tem cerca de ${kcal} kcal, com mais carboidrato no café e no almoço e menos à noite. A meta de proteína parte de ${prot} g por kg de peso.`,
    },
    plano_diario,
    lista_compras,
    custo_estimado_mensal: Math.round(custo / 10) * 10,
    receitas: {
      receita_1: 'Frango na frigideira: tempere o frango com alho, limão e sal. Grelhe 5 minutos de cada lado em frigideira quente com um fio de azeite.',
      receita_2: 'Crepioca: bata 1 ovo com 2 colheres de goma de tapioca e uma pitada de sal. Doure dos dois lados numa frigideira antiaderente.',
      receita_3: 'Legumes no vapor: corte cenoura, abobrinha e brócolis em pedaços parecidos. Cozinhe no vapor por 8 a 10 minutos e finalize com azeite e sal.',
    },
    receitas_alternativas: {
      opcao_1: 'Overnight de aveia: misture aveia, iogurte e fruta picada num pote. Deixe na geladeira de um dia para o outro.',
      opcao_2: 'Patinho com legumes: refogue cebola e alho, junte o patinho moído, deixe dourar e acrescente cenoura ralada e abobrinha em cubos.',
    },
    dicas_gerais: [
      'Pese os alimentos nas primeiras semanas até pegar o olho para as porções.',
      'Cozinhe arroz, feijão e proteína para 3 dias de uma vez e guarde em potes.',
      'Beba água ao longo do dia: cerca de 35 ml por kg de peso.',
      'Pode trocar alimentos do mesmo grupo: arroz por mandioca, frango por peixe, banana por maçã.',
    ],
    projecao_30_dias: {
      peso_estimado: `${String(pesoFinal).replace('.', ',')} kg`,
      gordura_estimada: usuario.percentual_gordura
        ? `${String(Math.round((usuario.percentual_gordura - (variacao > 0 ? variacao * 0.8 / peso * 100 : 0)) * 10) / 10).replace('.', ',')}%`
        : 'Sem medida inicial',
      observacao: 'Estimativa feita a partir do gasto calórico. O resultado real varia com sono, treino e constância.',
    },
  }
}
