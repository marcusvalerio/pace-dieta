import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { planoVazio } from '../lib/planoVazio'
import { api } from '../lib/api'
import Simbolo from '../components/Simbolo'

const titulo = { fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }
const campo = { height: 52, borderRadius: 14, border: '1px solid #E0DDE0', background: '#fff', padding: '0 14px', fontSize: 16, color: '#2B2B2B', width: '100%', minWidth: 0 }
const rotulo = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#555255' }

const OBJETIVOS = [
  ['Perda de gordura', 'Perder peso', 'com leveza, sem passar fome'],
  ['Manutenção', 'Manter e comer melhor', 'mais energia e rotina'],
  ['Hipertrofia', 'Ganhar massa', 'acompanhando treino e proteína'],
  ['Saúde geral', 'Cuidar da saúde', 'seguir o que o nutri passou'],
]
const REFEICOES = [
  ['cafe_manha', 'Café da manhã'], ['lanche_manha', 'Lanche da manhã'], ['almoco', 'Almoço'], ['lanche_tarde', 'Lanche da tarde'],
  ['pre_treino', 'Pré-treino'], ['pos_treino', 'Pós-treino'], ['janta', 'Janta'], ['ceia', 'Ceia'],
]
const TOTAL = 4

function idadeDe(nasc) {
  if (!nasc) return null
  const d = new Date(nasc), h = new Date()
  let i = h.getFullYear() - d.getFullYear()
  if (h < new Date(h.getFullYear(), d.getMonth(), d.getDate())) i--
  return i
}

function Opcao({ ativo, onClick, children }) {
  return (
    <button onClick={onClick} aria-pressed={ativo}
      style={{ flex: 1, height: 48, borderRadius: 14, border: ativo ? 0 : '1px solid #E0DDE0', background: ativo ? '#2B2B2B' : '#fff', color: ativo ? '#fff' : '#2B2B2B', fontWeight: 600, fontSize: 15 }}>
      {children}
    </button>
  )
}

export default function Onboarding({ onComplete }) {
  const [passo, setPasso] = useState(1)
  const [d, setD] = useState({ nome: '', sexo: '', nascimento: '', altura: '', peso: '', objetivo: '', refeicoes: ['cafe_manha', 'almoco', 'janta'], saude: false, nutri: true, novidades: false })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const set = (k, v) => setD(x => ({ ...x, [k]: v }))
  const num = v => parseFloat(String(v).replace(',', '.'))

  const podeSeguir = {
    1: d.nome.trim() && d.sexo && d.nascimento && num(d.altura) > 80 && num(d.peso) > 20,
    2: !!d.objetivo,
    3: d.refeicoes.length >= 1,
    4: d.saude,
  }[passo]

  const concluir = async () => {
    setSalvando(true); setErro('')
    try {
      await api('dados?acao=consentir', { dados_saude: d.saude, compartilhar_nutri: d.nutri, novidades_email: d.novidades, versao: 'rascunho' }).catch(() => {})
      setPasso(5)
    } catch { setErro('Não foi possível salvar. Tente novamente.') }
    setSalvando(false)
  }

  const abrir = async () => {
    setSalvando(true)
    const usuario = {
      nome: d.nome.trim(), sexo: d.sexo, nascimento: d.nascimento, idade: idadeDe(d.nascimento),
      altura: num(d.altura) / 100, peso: num(d.peso), objetivo: d.objetivo, percentual_gordura: null,
    }
    const chaves = REFEICOES.map(r => r[0]).filter(k => d.refeicoes.includes(k))
    try { await onComplete(planoVazio(usuario, chaves)) } catch { setErro('Não foi possível salvar. Tente novamente.'); setSalvando(false) }
  }

  if (passo === 5) return (
    <div style={{ minHeight: '100dvh', background: '#0E0E0F', color: '#F3F1F3', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 24px calc(40px + var(--safe-bottom))' }}>
      <motion.div aria-hidden="true" animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', left: '50%', bottom: -230, width: 520, height: 520, marginLeft: -260, filter: 'blur(10px)' }}>
        {[['#C2E297', '6%', '8%'], ['#D3C5D3', '30%', '16%'], ['#FFE3E2', '22%', '34%'], ['#C5D5EC', '10%', '28%']].map(([c, l, t], i) => (
          <div key={i} style={{ position: 'absolute', left: l, top: t, width: '70%', height: '70%', borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, ${c}cc 25%, ${c}00 70%)`, opacity: 0.85 }} />
        ))}
      </motion.div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, maxWidth: 420, width: '100%', margin: '0 auto', paddingBottom: 120 }}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.3, 1.4, 0.5, 1] }}><Simbolo size={64} /></motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...titulo, fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.04em' }}>Tudo pronto,<br />{d.nome.trim().split(' ')[0]}.</motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ fontSize: 16, color: '#CFCBD2', lineHeight: 1.5 }}>
          Agora é só cadastrar o que você come em cada refeição, do jeito que está no seu plano.
        </motion.p>
        {erro && <p role="alert" style={{ fontSize: 13, color: '#FFB4AE' }}>{erro}</p>}
      </div>
      <button onClick={abrir} disabled={salvando} style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto', height: 54, borderRadius: 999, background: '#F3F1F3', color: '#0E0E0F', fontWeight: 700, fontSize: 16 }}>
        {salvando ? 'Um instante…' : 'Montar meu plano'}
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: '#2B2B2B', padding: 'calc(40px + var(--safe-top)) 24px calc(32px + var(--safe-bottom))', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL }, (_, i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 9, background: i < passo ? '#2B2B2B' : '#DDDADD', transition: 'background .3s' }} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-sub)' }}>
          <span>Passo {passo} de {TOTAL}</span>
          {passo > 1 && <button onClick={() => setPasso(p => p - 1)} style={{ fontSize: 13, color: 'var(--text-sub)' }}>‹ Voltar</button>}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={passo} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {passo === 1 && <>
              <h1 style={{ ...titulo, fontSize: 30 }}>Sobre você</h1>
              <p style={{ fontSize: 14, color: '#555255', marginTop: -6 }}>Para acompanhar sua evolução. Ninguém mais vê.</p>
              <label style={rotulo}>Como quer ser chamado
                <input value={d.nome} onChange={e => set('nome', e.target.value)} placeholder="Seu nome" autoComplete="given-name" style={campo} />
              </label>
              <div style={rotulo}>Sexo biológico
                <div style={{ display: 'flex', gap: 8 }}>
                  <Opcao ativo={d.sexo === 'feminino'} onClick={() => set('sexo', 'feminino')}>Feminino</Opcao>
                  <Opcao ativo={d.sexo === 'masculino'} onClick={() => set('sexo', 'masculino')}>Masculino</Opcao>
                </div>
              </div>
              <label style={rotulo}>Nascimento
                <input type="date" value={d.nascimento} onChange={e => set('nascimento', e.target.value)} style={campo} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <label style={rotulo}>Altura (cm)<input inputMode="numeric" value={d.altura} onChange={e => set('altura', e.target.value)} placeholder="165" style={campo} /></label>
                <label style={rotulo}>Peso (kg)<input inputMode="decimal" value={d.peso} onChange={e => set('peso', e.target.value)} placeholder="68,5" style={campo} /></label>
              </div>
            </>}

            {passo === 2 && <>
              <h1 style={{ ...titulo, fontSize: 30 }}>Qual seu objetivo?</h1>
              {OBJETIVOS.map(([v, t, s]) => {
                const on = d.objetivo === v
                return (
                  <button key={v} onClick={() => set('objetivo', v)} aria-pressed={on}
                    style={{ textAlign: 'left', background: '#fff', borderRadius: 20, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center', color: '#2B2B2B', boxShadow: on ? 'inset 0 0 0 2px #2B2B2B' : 'none' }}>
                    <span style={{ width: 14, height: 14, borderRadius: 99, flexShrink: 0, ...(on ? { background: '#2B2B2B', boxShadow: '0 0 0 4px #C2E297' } : { boxShadow: 'inset 0 0 0 2px #C9C6C9' }) }} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><b style={{ fontSize: 16 }}>{t}</b><span style={{ fontSize: 13, color: '#555255' }}>{s}</span></span>
                  </button>
                )
              })}
            </>}

            {passo === 3 && <>
              <h1 style={{ ...titulo, fontSize: 30 }}>Sua rotina</h1>
              <p style={{ fontSize: 14, color: '#555255', marginTop: -6 }}>Quais refeições você faz? Depois você coloca o que come em cada uma.</p>
              <div style={{ background: '#fff', borderRadius: 20, padding: 8 }}>
                {REFEICOES.map(([k, l]) => {
                  const on = d.refeicoes.includes(k)
                  return (
                    <button key={k} role="switch" aria-checked={on} onClick={() => set('refeicoes', on ? d.refeicoes.filter(x => x !== k) : [...d.refeicoes, k])}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px', fontSize: 15, color: '#2B2B2B' }}>
                      {l}
                      <span style={{ width: 44, height: 26, borderRadius: 99, background: on ? '#9FCB6B' : '#E0DDE0', position: 'relative', transition: 'background .2s' }}>
                        <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 99, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </>}

            {passo === 4 && <>
              <h1 style={{ ...titulo, fontSize: 30, lineHeight: 1.1 }}>Seus dados,<br />suas regras</h1>
              <div style={{ background: '#fff', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, lineHeight: 1.45 }}>
                {[['saude', <><b>Autorizo o uso dos meus dados de saúde</b> (peso, medidas, alimentação) para acompanhar meu plano. <span style={{ color: 'var(--text-sub)' }}>Obrigatório</span></>],
                  ['nutri', 'Compartilhar com meu nutricionista conectado'],
                  ['novidades', 'Receber novidades por e-mail']].map(([k, t]) => (
                  <label key={k} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <input type="checkbox" checked={d[k]} onChange={e => set(k, e.target.checked)} style={{ width: 22, height: 22, minHeight: 0, accentColor: '#2B2B2B', flexShrink: 0, margin: 0, padding: 0 }} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>Você pode mudar isso quando quiser em Sua conta.</p>
            </>}
          </motion.div>
        </AnimatePresence>

        <div style={{ flex: 1 }} />
        {erro && <p role="alert" style={{ fontSize: 13, color: 'var(--red)' }}>{erro}</p>}
        <button disabled={!podeSeguir || salvando} onClick={() => passo < TOTAL ? setPasso(p => p + 1) : concluir()}
          style={{ height: 54, borderRadius: 999, background: '#2B2B2B', color: '#fff', fontWeight: 600, fontSize: 16, opacity: podeSeguir ? 1 : 0.35, transition: 'opacity .2s' }}>
          {passo < TOTAL ? 'Continuar' : 'Concluir'}
        </button>
      </div>
    </div>
  )
}
