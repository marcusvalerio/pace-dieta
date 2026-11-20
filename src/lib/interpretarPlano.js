// Interpreta o texto de um plano alimentar em PDF por regras (sem IA).
// O resultado sempre passa pela conferência da pessoa antes de salvar.

const REFEICOES = [
  { key: 'lanche_tarde', re: /^caf[eé]\s+da\s+tarde(?![\p{L}])/iu },
  { key: 'cafe_manha', re: /^(caf[eé](\s+da\s+manh[ãa])?|desjejum|primeira\s+refei[cç][aã]o)(?![\p{L}])/iu },
  { key: 'lanche_manha', re: /^(lanche\s+da\s+manh[ãa]|cola[cç][aã]o|lanche\s+1)(?![\p{L}])/iu },
  { key: 'almoco', re: /^almo[cç]o(?![\p{L}])/iu },
  { key: 'lanche_tarde', re: /^(lanche\s+da\s+tarde|lanche\s+2|merenda)(?![\p{L}])/iu },
  { key: 'pre_treino', re: /^pr[eé][\s-]?treino(?![\p{L}])/iu },
  { key: 'pos_treino', re: /^p[oó]s[\s-]?treino(?![\p{L}])/iu },
  { key: 'janta', re: /^(jantar?|janta)(?![\p{L}])/iu },
  { key: 'ceia', re: /^ceia(?![\p{L}])/iu },
  { key: 'lanche', re: /^lanche(?![\p{L}])/iu },
]
const SUPLEMENTOS = /^suplementa[cç][aã]o|^suplementos?\b/i
const FIM = /^(orienta[cç][oõ]es|observa[cç][oõ]es|recomenda[cç][oõ]es|lista de compras|dicas|assinatura|nutricionista\b|crn)/i
const SUBST = /^(op[cç][aã]o\s*\d*|substitui[cç][oõ]es?|substitui(r|[cç][aã]o)?|pode\s+(trocar|substituir)|ou\s*:|trocas?)\b[:\s-]*/i
const IGNORAR = /(material educativo|p[aá]gina\s+\d+\s*$)|^(estimativa\b|p[aá]gina\s+\d+|\d+\s*\/\s*\d+|paciente\b|data\b|plano alimentar|dieta\b|total\b|valor\s+cal|kcal\s+totais|prescri[cç][aã]o)/i
const UNIDADE = '(ui|mcg|g|gr|gramas?|kg|mg|ml|l|litros?|un|und|unid(ade)?s?|col(her(es)?)?(\\s+de\\s+(sopa|ch[aá]|sobremesa))?|c\\.?\\s*(sopa|ch[aá])|cs|cc|x[ií]c(ara)?s?|fatias?|conchas?|copos?|scoops?|medidas?|c[aá]psulas?|comprimidos?|gotas?|por[cç](ão|ões)|peda[cç]os?|fil[eé]s?|potes?|ramos?|folhas?|punhados?|sach[eê]s?|xícaras?)'
const QTD = new RegExp(`(\\d+[\\d.,/]*\\s*((a|–|-)\\s*\\d+[\\d.,]*\\s*)?${UNIDADE}\\b\\.?|\\d+[\\d.,/]*\\s*\\(?\\d*\\s*g?\\)?|[½¼¾]\\s*${UNIDADE}|meia\\s+\\w+|uma?\\s+${UNIDADE}|à\\s+vontade|a\\s+gosto|livre)`, 'i')
const HORA = /(\d{1,2})\s*[:h]\s*(\d{2})?/
const FAIXA_HORA = /(?:\d{1,2}\s*[:h]\s*\d{0,2})(?:\s*(?:[–—-]|às|a|ate|até)\s*\d{1,2}\s*[:h]?\s*\d{0,2}h?)?/i

function limpar(l) { return l.replace(/^[\s•·\-–—*▪◦○●>]+|^\d+[.)]\s+/, '').replace(/\s+/g, ' ').trim() }

export function separarItem(texto) {
  let t = limpar(texto)
  const par = t.match(/^(\d.*?)\s*\(([^)]*)\)\s*$/)
  if (par) {
    const base = separarItem(par[1])
    if (!base.revisar) return { item: base.item, quantidade: `${base.quantidade} (${par[2]})` }
  }
  let m = t.match(/^(.+?)(?:\s+[-–—|]\s+|:\s*)(.+)$/)
  if (m && QTD.test(m[2])) return { item: m[1].trim(), quantidade: m[2].trim() }
  m = t.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (m && QTD.test(m[2])) return { item: m[1].trim(), quantidade: m[2].trim() }
  m = t.match(new RegExp(`^((?:\\d+[\\d.,/]*|[½¼¾]|meia|uma?)\\s*(a\\s*\\d+\\s*)?${UNIDADE}?\\.?)\\s+(de\\s+|do\\s+|da\\s+)?(.+)$`, 'i'))
  if (m && /\S/.test(m[m.length - 1])) return { item: m[m.length - 1].trim().replace(/^\w/, c => c.toUpperCase()), quantidade: m[1].trim() }
  m = t.match(/^(.+?)\s{1,}(à vontade|a gosto|livre)$/i)
  if (m) return { item: m[1].trim(), quantidade: m[2] }
  m = t.match(new RegExp(`^(.+?)\\s+(\\d+[\\d.,]*\\s*${UNIDADE})\\.?$`, 'i'))
  if (m) return { item: m[1].trim(), quantidade: m[2].trim() }
  const meio = t.match(new RegExp(`(\\d+[\\d.,]*(?:[–-]\\d+[\\d.,]*)?\\s*${UNIDADE})(?![\\p{L}])`, 'iu'))
  if (meio) {
    const item = (t.slice(0, meio.index) + t.slice(meio.index + meio[0].length)).replace(/\s+/g, ' ').replace(/\s+(de|com)\s*$/i, '').trim()
    if (item.length > 1) return { item, quantidade: meio[1].trim() }
  }
  return { item: t, quantidade: '', revisar: true }
}

export function interpretarPlano(linhas) {
  const refeicoes = []
  const suplementos = []
  let atual = null, modo = 'fora', ultimoItem = null
  const contagem = {}

  for (const bruta of linhas) {
    const l = limpar(bruta)
    if (!l || l.length < 2 || IGNORAR.test(l)) continue
    if (FIM.test(l)) { modo = 'fora'; atual = null; continue }

    let ref = REFEICOES.find(r => r.re.test(l))
    if (ref) {
      const sobra = l.replace(ref.re, '').replace(FAIXA_HORA, '').replace(/[•·|]/g, ' ').replace(/\(?\d{2,4}\s*kcal\)?/i, '').replace(/[\s:()–—-]+/g, ' ').trim()
      const pareceItem = /\p{L}{3,}/u.test(sobra) && !HORA.test(l) && /^(cafe_manha|lanche)$/.test(ref.key) && !/manh[ãa]|tarde/i.test(l)
      if (pareceItem || l.length >= 70) ref = null
    }
    if (ref) {
      let key = ref.key
      if (key === 'lanche') key = refeicoes.some(r => r.key === 'almoco') ? 'lanche_tarde' : 'lanche_manha'
      contagem[key] = (contagem[key] || 0) + 1
      if (contagem[key] > 1) key = `${key}_${contagem[key]}`
      const h = l.match(HORA)
      const kcal = l.match(/(\d{2,4})\s*kcal/i)
      atual = { key, horario: h ? `${h[1].padStart(2, '0')}:${h[2] || '00'}` : '', alimentos: [], substituicoes: [], kcal: kcal ? +kcal[1] : null }
      refeicoes.push(atual); modo = 'refeicao'; ultimoItem = null
      const resto = l.replace(ref.re, '').replace(FAIXA_HORA, '').replace(/[•·|]/g, ' ').replace(/\(?\d{2,4}\s*kcal\)?/i, '').replace(/^[\s:–—-]+/, '').trim()
      if (resto.length > 3 && QTD.test(resto)) { const it = separarItem(resto); atual.alimentos.push(it); ultimoItem = it }
      continue
    }
    if (SUPLEMENTOS.test(l)) { modo = 'suplementos'; atual = null; continue }

    if (modo === 'suplementos') {
      if (/opcional|n[aã]o (s[aã]o|[eé]) (essenc|necess)|^(dose|por[cç][aã]o|escolha|seguran[cç]a|no card[aá]pio|outros)\b/i.test(l)) continue
      const dq = l.match(new RegExp(`(\\d+[\\d.,]*(?:[–-]\\d+[\\d.,]*)?\\s*${UNIDADE})(?![\\p{L}])`, 'iu'))
      const nomeBruto = (dq ? l.slice(0, dq.index) : l).replace(/[:\-–—]\s*$/, '').trim()
      if (!dq || !nomeBruto || !/^\p{Lu}/u.test(nomeBruto) || /[:;.,]|[–-]$/.test(nomeBruto) || nomeBruto.split(/\s+/).length > 4) continue
      if (suplementos.some(x => x.nome.toLowerCase().split(' ')[0] === nomeBruto.toLowerCase().split(' ')[0])) continue
      const it = { item: nomeBruto, quantidade: dq[1].trim() }
      const quando = /jejum/i.test(l) ? 'jejum' : /dormir|noite/i.test(l) ? 'dormir' : ''
      suplementos.push({ nome: it.item.replace(/\s*[-–,]?\s*(em jejum|antes de dormir|ao dia|por dia|diariamente|1x ao dia).*$/i, '').trim(), dose: it.quantidade, tipo: tipoSuplemento(l), quando, revisar: !it.quantidade })
      continue
    }
    if (modo !== 'refeicao' || !atual) continue

    if (SUBST.test(l)) {
      const dp = l.indexOf(':')
      const txt = (dp > -1 && dp < 40 ? l.slice(dp + 1) : l.replace(SUBST, '')).trim()
      if (txt) atual.substituicoes.push(txt)
      continue
    }
    if (/^ou\s+/i.test(l) && ultimoItem) { atual.substituicoes.push(`${ultimoItem.item}: ${l.replace(/^ou\s+/i, '')}`); continue }

    const temMarcador = /^\s*[•·\-–*▪◦●]/.test(bruta)
    const it = separarItem(l)
    if (it.item.length > 90) continue
    if (it.revisar && (it.item.length > 45 || /[;.]$|;/.test(it.item) || (!temMarcador && it.item.split(/\s+/).length > 5))) { (atual.observacoes ||= []).push(l); continue }
    atual.alimentos.push(it); ultimoItem = it
  }

  const validas = refeicoes.filter(r => r.alimentos.length)
  const revisar = validas.reduce((s, r) => s + r.alimentos.filter(a => a.revisar).length, 0) + suplementos.filter(s => s.revisar).length
  return { refeicoes: validas, suplementos, revisar, modelo: detectarModelo(linhas) }
}

function tipoSuplemento(t) {
  if (/whey|prote[ií]na/i.test(t)) return 'whey'
  if (/creatina/i.test(t)) return 'creatina'
  if (/[oô]mega/i.test(t)) return 'omega3'
  if (/gota/i.test(t)) return 'gotas'
  if (/sach[eê]/i.test(t)) return 'sache'
  if (/pr[eé][- ]?treino/i.test(t)) return 'pre-treino'
  if (/comprimido/i.test(t)) return 'comprimido'
  if (/vitamina|multi|polivit/i.test(t)) return 'vitaminas'
  return 'capsula'
}

function detectarModelo(linhas) {
  const t = linhas.slice(0, 40).join(' ').toLowerCase()
  if (t.includes('dietbox')) return 'Dietbox'
  if (t.includes('webdiet')) return 'WebDiet'
  if (t.includes('dietpro')) return 'DietPro'
  if (t.includes('nutrium')) return 'Nutrium'
  return null
}
