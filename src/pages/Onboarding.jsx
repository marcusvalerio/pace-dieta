import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Loader2, Info } from 'lucide-react'
import { planoVazio } from '../lib/planoVazio'

const OBJETIVOS = [
  'Perda de gordura',
  'Hipertrofia',
  'Definição muscular',
  'Manutenção',
  'Performance esportiva',
  'Saúde geral',
]

const REFEICOES_OPCOES = [
  { key: 'cafe_manha',    label: 'Café da manhã',    essencial: true },
  { key: 'lanche_manha',  label: 'Lanche da manhã',  essencial: false },
  { key: 'almoco',        label: 'Almoço',           essencial: true },
  { key: 'lanche_tarde',  label: 'Lanche da tarde',  essencial: false },
  { key: 'pre_treino',    label: 'Pré-treino',       essencial: false },
  { key: 'pos_treino',    label: 'Pós-treino',       essencial: false },
  { key: 'janta',         label: 'Janta',            essencial: true },
  { key: 'ceia',          label: 'Ceia',             essencial: false },
]

const RESTRICOES_COMUNS = [
  'Baixo custo',
  'Praticidade',
  'Vegetariano',
  'Sem lactose',
  'Sem glúten',
  'Cafeína até 14h',
  'Sem carne vermelha',
  'Low carb',
]

const ease = [0.16, 1, 0.3, 1]

const slide = {
  initial: { opacity: 0, y: 20, filter: 'blur(2px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, filter: 'blur(2px)' },
  transition: { duration: 0.55, ease }
}

function ProgressDots({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i}
          animate={{
            width: i === step ? 24 : 6,
            background: i <= step ? 'var(--accent)' : 'var(--border2)'
          }}
          transition={{ duration: 0.45, ease }}
          style={{ height: 6, borderRadius: 3 }}
        />
      ))}
    </div>
  )
}

function Label({ children }) {
  return (
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
      className="mono" style={{ fontSize: 11, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
      {children}
    </motion.p>
  )
}

function BigInput(props) {
  return (
    <input {...props} style={{
      background: 'transparent', border: 'none', borderBottom: '1px solid var(--border2)',
      borderRadius: 0, padding: '12px 0', fontSize: 28, fontFamily: 'Space Grotesk, sans-serif',
      color: 'var(--text)', minHeight: 'unset', transition: 'border-color 0.3s var(--ease)', ...props.style
    }} />
  )
}

function Chip({ selected, onClick, children }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      transition={{ duration: 0.1 }}
      style={{
        padding: '11px 18px', borderRadius: 6,
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
        background: selected ? 'var(--accent-glow)' : 'transparent',
        color: selected ? 'var(--accent)' : 'var(--text-sub)',
        fontSize: 13, fontWeight: selected ? 500 : 400,
        cursor: 'pointer', minHeight: 'unset',
        transition: 'background 0.3s var(--ease-soft), border-color 0.3s var(--ease-soft), color 0.3s var(--ease-soft)',
      }}>
      {children}
    </motion.button>
  )
}

function NextBtn({ onClick, disabled, label = 'Continuar' }) {
  return (
    <motion.button onClick={onClick} disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ opacity: disabled ? 1 : 0.85 }}
      transition={{ duration: 0.25, ease }}
      style={{
        width: '100%', padding: '17px', borderRadius: 6,
        background: disabled ? 'var(--card)' : 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
        color: disabled ? 'var(--text-mute)' : '#fff',
        border: 'none', fontWeight: 500, fontSize: 15,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      }}>
      {label} {!disabled && <ArrowRight size={17} />}
    </motion.button>
  )
}

export default function Onboarding({ userId, onComplete }) {
  const [step, setStep] = useState(0)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [data, setData] = useState({
    nome: '', peso: '', altura: '', idade: '',
    objetivos: [], percentualGordura: '', orcamento: '',
    refeicoes: ['cafe_manha', 'almoco', 'janta'],
    restricoes: [], restricaoLivre: ''
  })
  const setD = (k, v) => setData(d => ({ ...d, [k]: v }))

  const toggleObjetivo = (o) => setD('objetivos', data.objetivos.includes(o) ? data.objetivos.filter(x => x !== o) : [...data.objetivos, o])
  const toggleRestricao = (r) => setD('restricoes', data.restricoes.includes(r) ? data.restricoes.filter(x => x !== r) : [...data.restricoes, r])
  const toggleRefeicao = (key) => {
    const opcao = REFEICOES_OPCOES.find(r => r.key === key)
    if (opcao?.essencial && data.refeicoes.includes(key)) return // não deixa desmarcar essenciais
    setD('refeicoes', data.refeicoes.includes(key) ? data.refeicoes.filter(x => x !== key) : [...data.refeicoes, key])
  }

  const totalSteps = 4

  const concluir = async () => {
    setGerando(true)
    const usuario = {
      nome: data.nome,
      peso: parseFloat(data.peso),
      altura: parseFloat(data.altura),
      idade: parseInt(data.idade),
      objetivo: data.objetivos.join(', '),
      percentual_gordura: data.percentualGordura ? parseFloat(data.percentualGordura) : null,
    }
    const chaves = REFEICOES_OPCOES.filter(r => data.refeicoes.includes(r.key)).map(r => r.key)
    try {
      await onComplete(planoVazio(usuario, chaves))
    } catch {
      setErro('Não foi possível salvar. Tente novamente.')
      setGerando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', paddingTop: 'var(--safe-top)' }}>
      <div style={{ padding: '32px 28px 0', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em' }}>PACE</p>
          <div style={{ width: 14, height: 1, background: 'var(--border2)', transform: 'skewX(-20deg)' }} />
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em' }}>
            {String(step + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
          </p>
        </div>
        {step > 0 && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setStep(s => s - 1)}
            style={{ position: 'absolute', top: 32, right: 28, color: 'var(--text-mute)', fontSize: 13, minHeight: 'unset' }}>
            Voltar
          </motion.button>
        )}
      </div>

      <div style={{ flex: 1, padding: '28px 28px 40px', maxWidth: 480, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        <ProgressDots step={step} total={totalSteps} />

        <AnimatePresence mode="wait">
          <motion.div key={step} {...slide} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* STEP 0 — Identidade */}
            {step === 0 && (
              <>
                <Label>01 · Você</Label>
                <h2 style={{ fontSize: 32, fontWeight: 600, marginBottom: 36, lineHeight: 1.2 }}>Qual é o seu nome?</h2>
                <BigInput placeholder="Seu nome" value={data.nome} onChange={e => setD('nome', e.target.value)} autoFocus />
                <div style={{ flex: 1 }} />
                <NextBtn onClick={() => setStep(1)} disabled={!data.nome.trim()} />
              </>
            )}

            {/* STEP 1 — Medidas */}
            {step === 1 && (
              <>
                <Label>02 · Medidas</Label>
                <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 32, lineHeight: 1.25 }}>Seus números de hoje, para acompanhar a evolução.</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 6 }}>PESO (KG)</p>
                    <BigInput type="number" placeholder="0" value={data.peso} onChange={e => setD('peso', e.target.value)} style={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 6 }}>ALTURA (M)</p>
                    <BigInput type="number" step="0.01" placeholder="0.00" value={data.altura} onChange={e => setD('altura', e.target.value)} style={{ fontSize: 24 }} />
                  </div>
                </div>
                <div>
                  <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 6 }}>IDADE</p>
                  <BigInput type="number" placeholder="0" value={data.idade} onChange={e => setD('idade', e.target.value)} style={{ fontSize: 24 }} />
                </div>
                <div style={{ flex: 1 }} />
                <NextBtn onClick={() => setStep(2)} disabled={!data.peso || !data.altura || !data.idade} />
              </>
            )}

            {/* STEP 2 — Objetivos */}
            {step === 2 && (
              <>
                <Label>03 · Objetivo</Label>
                <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 10, lineHeight: 1.25 }}>O que você quer alcançar?</h2>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 28 }}>Pode selecionar mais de um.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                  {OBJETIVOS.map(o => (
                    <Chip key={o} selected={data.objetivos.includes(o)} onClick={() => toggleObjetivo(o)}>{o}</Chip>
                  ))}
                </div>
                <div>
                  <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 6 }}>% GORDURA CORPORAL (OPCIONAL)</p>
                  <BigInput type="number" step="0.1" placeholder="—" value={data.percentualGordura} onChange={e => setD('percentualGordura', e.target.value)} style={{ fontSize: 22 }} />
                </div>
                <div style={{ flex: 1 }} />
                <NextBtn onClick={() => setStep(3)} disabled={data.objetivos.length === 0} />
              </>
            )}

            {/* STEP 3 — Refeições */}
            {step === 3 && (
              <>
                <Label>04 · Rotina alimentar</Label>
                <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16, lineHeight: 1.25 }}>Quais refeições você faz no dia?</h2>

                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 22 }}>Depois você cadastra o que come em cada uma, do jeito que está no seu plano.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                  {REFEICOES_OPCOES.map(r => {
                    const selected = data.refeicoes.includes(r.key)
                    return (
                      <motion.button key={r.key} whileTap={{ scale: r.essencial ? 1 : 0.98 }}
                        onClick={() => toggleRefeicao(r.key)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '13px 16px', borderRadius: 8,
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
                          background: selected ? 'var(--accent-glow)' : 'transparent',
                          cursor: r.essencial ? 'default' : 'pointer',
                          opacity: r.essencial ? 0.9 : 1,
                          transition: 'all 0.25s var(--ease-soft)',
                        }}>
                        <span style={{ fontSize: 14, color: selected ? 'var(--accent)' : 'var(--text-sub)' }}>{r.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {r.essencial && <span className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', letterSpacing: '0.05em' }}>ESSENCIAL</span>}
                          <motion.div animate={{ borderColor: selected ? 'var(--accent)' : 'var(--border2)', background: selected ? 'var(--accent)' : 'transparent' }}
                            transition={{ duration: 0.2 }}
                            style={{ width: 18, height: 18, borderRadius: 5, border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selected && <Check size={11} color="#2B2B2B" strokeWidth={3} />}
                          </motion.div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                <div style={{ flex: 1 }} />
                {erro && <p style={{ fontSize: 13, color: '#e57373', marginBottom: 12 }}>{erro}</p>}
                <NextBtn onClick={concluir} disabled={data.refeicoes.length < 3} label="Montar meu plano" />
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
