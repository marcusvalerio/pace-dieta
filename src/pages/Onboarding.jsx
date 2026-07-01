import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { gerarDieta } from '../lib/groq'
import { savePlano } from '../lib/storage'

const OBJETIVOS = [
  'Perda de gordura',
  'Hipertrofia',
  'Definição muscular',
  'Manutenção',
  'Performance esportiva',
  'Saúde geral',
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
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.5, ease }
}

function ProgressDots({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 48 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i}
          animate={{
            width: i === step ? 24 : 6,
            background: i <= step ? 'var(--accent)' : 'var(--border2)'
          }}
          transition={{ duration: 0.4, ease }}
          style={{ height: 6, borderRadius: 3 }}
        />
      ))}
    </div>
  )
}

function Label({ children }) {
  return (
    <p className="mono" style={{ fontSize: 11, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
      {children}
    </p>
  )
}

function BigInput(props) {
  return (
    <input {...props} style={{
      background: 'transparent', border: 'none', borderBottom: '1px solid var(--border2)',
      borderRadius: 0, padding: '12px 0', fontSize: 28, fontFamily: 'Fraunces, serif',
      color: 'var(--text)', minHeight: 'unset', ...props.style
    }} />
  )
}

function Chip({ selected, onClick, children }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      style={{
        padding: '11px 18px', borderRadius: 999,
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
        background: selected ? 'rgba(0,180,216,0.1)' : 'transparent',
        color: selected ? 'var(--accent)' : 'var(--text-sub)',
        fontSize: 13, fontWeight: selected ? 500 : 400,
        cursor: 'pointer', minHeight: 'unset',
        transition: 'all 0.25s ' + 'cubic-bezier(0.16, 1, 0.3, 1)',
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
      style={{
        width: '100%', padding: '17px', borderRadius: 999,
        background: disabled ? 'var(--card)' : 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
        color: disabled ? 'var(--text-mute)' : '#fff',
        border: 'none', fontWeight: 500, fontSize: 15,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        transition: 'opacity 0.2s'
      }}>
      {label} {!disabled && <ArrowRight size={17} />}
    </motion.button>
  )
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [data, setData] = useState({
    nome: '', peso: '', altura: '', idade: '',
    objetivos: [], percentualGordura: '', orcamento: '',
    restricoes: [], restricaoLivre: ''
  })
  const setD = (k, v) => setData(d => ({ ...d, [k]: v }))

  const toggleObjetivo = (o) => setD('objetivos', data.objetivos.includes(o) ? data.objetivos.filter(x => x !== o) : [...data.objetivos, o])
  const toggleRestricao = (r) => setD('restricoes', data.restricoes.includes(r) ? data.restricoes.filter(x => x !== r) : [...data.restricoes, r])

  const totalSteps = 5

  const gerar = async () => {
    setGerando(true)
    setErro('')
    const restricoesFinal = [...data.restricoes]
    if (data.restricaoLivre.trim()) restricoesFinal.push(data.restricaoLivre.trim())

    const usuario = {
      nome: data.nome,
      peso: parseFloat(data.peso),
      altura: parseFloat(data.altura),
      idade: parseInt(data.idade),
      objetivo: data.objetivos.join(', '),
      percentual_gordura: data.percentualGordura ? parseFloat(data.percentualGordura) : null,
      orcamento_mensal: parseFloat(data.orcamento),
      restricoes: restricoesFinal,
    }

    try {
      const plano = await gerarDieta(usuario)
      savePlano(plano)
      onComplete(plano)
    } catch (e) {
      setErro(e.message || 'Não foi possível gerar sua dieta. Tente novamente.')
      setGerando(false)
    }
  }

  // Tela de loading enquanto a IA gera
  if (gerando) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ marginBottom: 28 }}>
          <Loader2 size={32} color="var(--accent)" strokeWidth={1.5} />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 24, fontWeight: 300, marginBottom: 10, textAlign: 'center' }}>
          Montando seu plano.
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mono" style={{ fontSize: 12, color: 'var(--text-mute)', letterSpacing: '0.06em', textAlign: 'center' }}>
          Calculando macros, receitas e lista de compras
        </motion.p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', paddingTop: 'var(--safe-top)' }}>
      {/* Header */}
      <div style={{ padding: '32px 28px 0' }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.16em', marginBottom: 4 }}>PACE</p>
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
                <h2 style={{ fontSize: 32, fontWeight: 300, marginBottom: 36, lineHeight: 1.2 }}>
                  Qual é o seu nome?
                </h2>
                <BigInput placeholder="Seu nome" value={data.nome} onChange={e => setD('nome', e.target.value)} autoFocus />
                <div style={{ flex: 1 }} />
                <NextBtn onClick={() => setStep(1)} disabled={!data.nome.trim()} />
              </>
            )}

            {/* STEP 1 — Medidas */}
            {step === 1 && (
              <>
                <Label>02 · Medidas</Label>
                <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 32, lineHeight: 1.25 }}>
                  Alguns números para calcular seus macros.
                </h2>
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
                <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 10, lineHeight: 1.25 }}>
                  O que você quer alcançar?
                </h2>
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

            {/* STEP 3 — Orçamento */}
            {step === 3 && (
              <>
                <Label>04 · Orçamento</Label>
                <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 32, lineHeight: 1.25 }}>
                  Quanto você pode investir em alimentação por mês?
                </h2>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontFamily: 'Fraunces, serif', color: 'var(--text-sub)' }}>R$</span>
                  <BigInput type="number" placeholder="0" value={data.orcamento} onChange={e => setD('orcamento', e.target.value)} style={{ fontSize: 40, flex: 1 }} />
                </div>
                <div style={{ flex: 1 }} />
                <NextBtn onClick={() => setStep(4)} disabled={!data.orcamento} />
              </>
            )}

            {/* STEP 4 — Restrições */}
            {step === 4 && (
              <>
                <Label>05 · Restrições</Label>
                <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 24, lineHeight: 1.25 }}>
                  Alguma preferência ou restrição?
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                  {RESTRICOES_COMUNS.map(r => (
                    <Chip key={r} selected={data.restricoes.includes(r)} onClick={() => toggleRestricao(r)}>{r}</Chip>
                  ))}
                </div>
                <input placeholder="Outra restrição (opcional)" value={data.restricaoLivre} onChange={e => setD('restricaoLivre', e.target.value)} style={{ marginBottom: 8 }} />

                {erro && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ fontSize: 13, color: '#e57373', marginTop: 12 }}>{erro}</motion.p>
                )}

                <div style={{ flex: 1 }} />
                <NextBtn onClick={gerar} label="Gerar meu plano" />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
