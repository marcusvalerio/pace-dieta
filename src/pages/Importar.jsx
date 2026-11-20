import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { labelRefeicao } from '../lib/refeicoes'
import { TIPOS_SUPLEMENTO } from '../components/Suplementos'

const titulo = { fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }
const campo = { minHeight: 38, padding: '6px 10px', fontSize: 14, borderRadius: 10 }
const tela = { position: 'fixed', inset: 0, zIndex: 400, background: 'var(--bg)', overflowY: 'auto', color: '#2B2B2B' }
const miolo = { maxWidth: 480, margin: '0 auto', padding: 'calc(28px + var(--safe-top)) 20px calc(32px + var(--safe-bottom))', display: 'flex', flexDirection: 'column', gap: 14, minHeight: '100%' }

export default function Importar({ plano, onSalvar, onFechar }) {
  const [etapa, setEtapa] = useState('enviar') // enviar | lendo | conferir | vazio
  const [erro, setErro] = useState('')
  const [res, setRes] = useState(null)
  const [arquivo, setArquivo] = useState(null)
  const [passos, setPassos] = useState([])
  const input = useRef(null)

  const escolher = async (f) => {
    if (!f) return
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) return setErro('Escolha um arquivo PDF.')
    if (f.size > 10 * 1024 * 1024) return setErro('O PDF tem mais de 10 MB. Tente uma versão menor.')
    setErro(''); setArquivo(f); setEtapa('lendo'); setPassos([])
    try {
      const [{ lerPdf }, { interpretarPlano }] = await Promise.all([import('../lib/lerPdf'), import('../lib/interpretarPlano')])
      const { linhas } = await lerPdf(f)
      const r = interpretarPlano(linhas)
      const etapas = [
        ['Modelo reconhecido', r.modelo ? `${r.modelo} ✓` : 'Genérico'],
        ['Refeições encontradas', String(r.refeicoes.length)],
        ['Itens', String(r.refeicoes.reduce((s, x) => s + x.alimentos.length, 0))],
        ['Suplementos', String(r.suplementos.length)],
      ]
      for (let i = 0; i < etapas.length; i++) { await new Promise(ok => setTimeout(ok, 380)); setPassos(etapas.slice(0, i + 1)) }
      await new Promise(ok => setTimeout(ok, 500))
      if (!linhas.length || !r.refeicoes.length) { setEtapa('vazio'); return }
      setRes(r); setEtapa('conferir')
    } catch (e) {
      console.error(e); setEtapa('vazio')
    }
  }

  const mudarItem = (ri, ii, campoNome, valor) => setRes(r => {
    const n = structuredClone(r); n.refeicoes[ri].alimentos[ii][campoNome] = valor
    if (campoNome === 'quantidade' && valor.trim()) delete n.refeicoes[ri].alimentos[ii].revisar
    return n
  })
  const tirarItem = (ri, ii) => setRes(r => { const n = structuredClone(r); n.refeicoes[ri].alimentos.splice(ii, 1); return n })
  const mudarRef = (ri, k, v) => setRes(r => { const n = structuredClone(r); n.refeicoes[ri][k] = v; return n })
  const tirarRef = (ri) => setRes(r => { const n = structuredClone(r); n.refeicoes.splice(ri, 1); return n })
  const mudarSup = (si, k, v) => setRes(r => { const n = structuredClone(r); n.suplementos[si][k] = v; if (k === 'dose' && v.trim()) delete n.suplementos[si].revisar; return n })
  const tirarSup = (si) => setRes(r => { const n = structuredClone(r); n.suplementos.splice(si, 1); return n })

  const pendentes = res ? res.refeicoes.reduce((s, r) => s + r.alimentos.filter(a => a.revisar).length, 0) + res.suplementos.filter(s => s.revisar).length : 0

  const salvar = () => {
    const plano_diario = {}
    res.refeicoes.forEach(r => {
      plano_diario[r.key] = {
        horario: r.horario, calorias: r.kcal || undefined,
        alimentos: r.alimentos.filter(a => a.item.trim()).map(a => ({ item: a.item.trim(), quantidade: a.quantidade.trim() })),
        substituicoes: r.substituicoes.filter(Boolean),
      }
    })
    const suplementos = res.suplementos.filter(s => s.nome.trim()).map(s => ({ nome: s.nome.trim(), dose: s.dose.trim(), tipo: s.tipo, quando: s.quando || '' }))
    onSalvar({ ...plano, origem: 'pdf', importado_em: new Date().toISOString(), arquivo_pdf: arquivo?.name, plano_diario, suplementos })
  }

  return (
    <div style={tela} role="dialog" aria-label="Importar plano em PDF">
      <AnimatePresence mode="wait">
        {etapa === 'enviar' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={miolo}>
            <button onClick={onFechar} style={{ alignSelf: 'flex-start', fontSize: 14, color: 'var(--text-sub)' }}>‹ Voltar</button>
            <h1 style={{ ...titulo, fontSize: 30, lineHeight: 1.1 }}>Traga sua dieta</h1>
            <p style={{ fontSize: 15, color: '#555255', lineHeight: 1.45, marginTop: -6 }}>Envie o PDF que seu nutricionista te passou. A gente organiza as refeições para você conferir.</p>
            <button onClick={() => input.current?.click()} style={{ border: '2px dashed #C9C6C9', borderRadius: 24, padding: '34px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: '#fff', color: '#2B2B2B' }}>
              <span style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--ceu)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="#fff" /><path d="M14 3v4h4M9 13h6M9 16.5h4" stroke="#0B1B2B" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
              </span>
              <b style={{ fontSize: 16 }}>Escolher PDF</b>
              <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>Arquivos, e-mail ou WhatsApp · até 10 MB</span>
            </button>
            <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={e => escolher(e.target.files?.[0])} />
            {erro && <p role="alert" style={{ fontSize: 13, color: 'var(--red)' }}>{erro}</p>}
            <div style={{ background: '#fff', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, lineHeight: 1.45 }}>
              <b style={{ fontSize: 13, color: 'var(--text-sub)' }}>FUNCIONA MELHOR COM</b>
              <span>• PDF gerado por sistemas de nutrição (ex.: Dietbox, WebDiet)</span>
              <span>• Texto selecionável, não foto do papel</span>
              <span style={{ color: 'var(--text-sub)' }}>Você confere tudo antes de salvar. O plano atual é substituído.</span>
            </div>
            <div style={{ flex: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--text-sub)', textAlign: 'center', lineHeight: 1.5 }}>O PDF é lido no seu aparelho e não é enviado para nenhum servidor.</p>
          </motion.div>
        )}

        {etapa === 'lendo' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...miolo, alignItems: 'center', gap: 22 }}>
            <div style={{ position: 'relative', width: 200, height: 260, marginTop: 30, borderRadius: 18, background: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,.1)', padding: 22, display: 'flex', flexDirection: 'column', gap: 9, overflow: 'hidden' }}>
              {[['60%', '#2B2B2B', 10], ['90%'], ['75%'], ['45%', '#9FCB66', 9, 6], ['85%'], ['70%'], ['50%', '#A9C0E2', 9, 6], ['88%'], ['64%']].map(([w, c = '#E3E0E3', h = 7, mt = 0], i) => (
                <span key={i} style={{ height: h, width: w, borderRadius: 4, background: c, marginTop: mt }} />
              ))}
              <motion.div animate={{ top: ['-20%', '100%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', left: 0, right: 0, height: 36, background: 'linear-gradient(180deg, rgba(194,226,151,0), rgba(194,226,151,.55), rgba(211,197,211,0))' }} />
            </div>
            <h1 style={{ ...titulo, fontSize: 24 }}>Lendo sua dieta…</h1>
            <div style={{ width: '100%', background: '#fff', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, minHeight: 150 }}>
              {passos.map(([a, b]) => (
                <motion.span key={a} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{a}</span><b>{b}</b></motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {etapa === 'vazio' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={miolo}>
            <h1 style={{ ...titulo, fontSize: 28, lineHeight: 1.1, marginTop: 40 }}>Não conseguimos ler esse PDF</h1>
            <p style={{ fontSize: 15, color: '#555255', lineHeight: 1.5 }}>Pode ser uma foto ou um scan, sem texto selecionável, ou um modelo que ainda não conhecemos. Você pode montar o plano à mão com o PDF aberto ao lado.</p>
            <div style={{ flex: 1 }} />
            <button onClick={() => setEtapa('enviar')} style={{ height: 54, borderRadius: 999, background: '#2B2B2B', color: '#fff', fontWeight: 600, fontSize: 16 }}>Tentar outro PDF</button>
            <button onClick={onFechar} style={{ height: 48, fontWeight: 600, color: 'var(--text)' }}>Montar à mão</button>
          </motion.div>
        )}

        {etapa === 'conferir' && res && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...miolo, gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setEtapa('enviar')} style={{ fontSize: 14, color: 'var(--text-sub)' }}>‹ Voltar</button>
              {arquivo && <a href={URL.createObjectURL(arquivo)} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: '#2B2B2B' }}>Ver PDF original</a>}
            </div>
            <h1 style={{ ...titulo, fontSize: 26 }}>Confira sua dieta</h1>
            <span style={{ fontSize: 13, color: '#555255', marginTop: -6 }}>Toque em qualquer item para corrigir.</span>

            {res.refeicoes.map((r, ri) => {
              const rev = r.alimentos.filter(a => a.revisar).length
              return (
                <div key={ri} style={{ background: '#fff', borderRadius: 20, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, boxShadow: rev ? 'inset 0 0 0 2px #F4B6B3' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <b style={{ flex: 1 }}>{labelRefeicao(r.key.replace(/_\d+$/, ''))}{/_\d+$/.test(r.key) ? ` ${r.key.split('_').pop()}` : ''}</b>
                    <input aria-label="Horário" type="time" value={r.horario} onChange={e => mudarRef(ri, 'horario', e.target.value)} style={{ ...campo, width: 104, minHeight: 32 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: rev ? 'var(--red)' : 'var(--accent)' }}>{rev ? `${rev} para revisar` : '✓ ok'}</span>
                  </div>
                  {r.alimentos.map((a, ii) => (
                    <div key={ii} style={{ display: 'flex', gap: 6, alignItems: 'center', ...(a.revisar ? { background: '#FFF4F3', borderRadius: 12, padding: 8 } : {}) }}>
                      <input aria-label="Alimento" value={a.item} onChange={e => mudarItem(ri, ii, 'item', e.target.value)} style={{ ...campo, flex: 2 }} />
                      <input aria-label="Quantidade" value={a.quantidade} placeholder={a.revisar ? 'Quanto?' : ''} onChange={e => mudarItem(ri, ii, 'quantidade', e.target.value)} style={{ ...campo, flex: 1, ...(a.revisar ? { borderColor: '#F4B6B3' } : {}) }} />
                      <button onClick={() => tirarItem(ri, ii)} aria-label="Remover item" style={{ color: 'var(--text-mute)', fontSize: 18, padding: 4 }}>×</button>
                    </div>
                  ))}
                  {r.substituicoes.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>Substitui: {r.substituicoes.join(' · ')}</span>}
                  <button onClick={() => tirarRef(ri)} style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--text-mute)' }}>Remover refeição</button>
                </div>
              )
            })}

            {res.suplementos.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <b>Suplementos</b>
                {res.suplementos.map((s, si) => (
                  <div key={si} style={{ display: 'flex', gap: 6, alignItems: 'center', ...(s.revisar ? { background: '#FFF4F3', borderRadius: 12, padding: 8 } : {}) }}>
                    <img src={`/brand/icones/suplementos/paleta/${s.tipo}.svg`} alt="" width={24} height={24} />
                    <input aria-label="Suplemento" value={s.nome} onChange={e => mudarSup(si, 'nome', e.target.value)} style={{ ...campo, flex: 2 }} />
                    <input aria-label="Dose" value={s.dose} placeholder="Dose" onChange={e => mudarSup(si, 'dose', e.target.value)} style={{ ...campo, flex: 1 }} />
                    <select aria-label="Tipo" value={s.tipo} onChange={e => mudarSup(si, 'tipo', e.target.value)} style={{ ...campo, width: 44, padding: 4 }}>
                      {TIPOS_SUPLEMENTO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <button onClick={() => tirarSup(si)} aria-label="Remover suplemento" style={{ color: 'var(--text-mute)', fontSize: 18, padding: 4 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ flex: 1 }} />
            <button onClick={salvar} style={{ height: 54, borderRadius: 999, background: '#2B2B2B', color: '#fff', fontWeight: 600, fontSize: 16, position: 'sticky', bottom: 'calc(12px + var(--safe-bottom))' }}>
              {pendentes ? `Salvar plano (${pendentes} sem quantidade)` : 'Salvar plano'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
