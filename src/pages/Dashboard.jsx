import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { getWeights, saveWeights } from '../lib/storage'
import ReferenciasCard from '../components/ReferenciasCard'
import { IllustrationFlame, IllustrationScale } from '../components/Illustrations'

function WeightChart({ weights }) {
  if (weights.length < 2) {
    return (
      <div style={{ padding: '20px 0 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <IllustrationScale size={64} />
        </div>
        <p className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>Registre ao menos 2 pesagens para ver o gráfico</p>
      </div>
    )
  }
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-12)
  const vals = sorted.map(w => w.val)
  const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1
  const W = 320, H = 100, pad = 20
  const x = (i) => pad + (i / (sorted.length - 1)) * (W - pad * 2)
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2)
  const pts = sorted.map((w, i) => `${x(i)},${y(w.val)}`).join(' ')
  const area = `${pad},${H - pad} ` + pts + ` ${W - pad},${H - pad}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B8935F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#B8935F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#wg)" />
      <polyline points={pts} fill="none" stroke="#B8935F" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {sorted.map((w, i) => <circle key={i} cx={x(i)} cy={y(w.val)} r="3" fill="#B8935F" />)}
    </svg>
  )
}

export default function Dashboard({ plano, dietaPct, streak }) {
  const [weights, setWeights] = useState(getWeights())
  const [novoPeso, setNovoPeso] = useState('')

  const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0]
  const prev = sorted[1]
  const diff = latest && prev ? (latest.val - prev.val).toFixed(1) : null

  const addPeso = () => {
    if (!novoPeso) return
    const todayStr = new Date().toISOString().split('T')[0]
    const next = [...weights.filter(w => w.date !== todayStr), { date: todayStr, val: parseFloat(novoPeso) }]
    setWeights(next)
    saveWeights(next)
    setNovoPeso('')
  }

  const usuario = plano?.usuario || {}
  const nutri = plano?.resumo_nutricional || {}
  const projecao = plano?.projecao_30_dias || {}

  return (
    <div style={{ padding: '0 20px 100px' }}>
      <div style={{ padding: '20px 0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.15em' }}>OLÁ, {usuario.nome?.toUpperCase()}</p>
          <div style={{ width: 12, height: 1, background: 'var(--border2)', transform: 'skewX(-20deg)' }} />
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em' }}>
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
          </p>
        </div>
        <h2 style={{ fontSize: 28, marginTop: 6 }}>Seu progresso.</h2>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)', marginTop: 20, marginBottom: 4 }}>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IllustrationFlame size={28} />
          </motion.div>
          <div>
            <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>{streak} dia{streak !== 1 ? 's' : ''} seguidos</p>
            <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)' }}>dieta completa</p>
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: streak > 0 ? 12 : 20, marginBottom: 12 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px', background: 'var(--card)' }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: 8 }}>DIETA HOJE</p>
          <p style={{ fontSize: 24, fontFamily: 'Funnel Display, sans-serif', color: 'var(--accent)' }}>{dietaPct}%</p>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px', background: 'var(--card)' }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: 8 }}>PESO ATUAL</p>
          <p style={{ fontSize: 24, fontFamily: 'Funnel Display, sans-serif' }}>{latest ? `${latest.val}kg` : '—'}</p>
          {diff !== null && (
            <p className="mono" style={{ fontSize: 10, marginTop: 3, color: parseFloat(diff) <= 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 3 }}>
              {parseFloat(diff) <= 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
              {Math.abs(diff)}kg
            </p>
          )}
        </div>
      </div>

      {/* Calorias e macros resumidos */}
      {nutri.calorias_totais_dia && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: 12, background: 'var(--card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em' }}>META DIÁRIA</p>
            <p className="mono" style={{ fontSize: 16, color: 'var(--accent)' }}>{nutri.calorias_totais_dia} kcal</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div><span style={{ fontSize: 13, color: 'var(--text-sub)' }}>P {nutri.proteinas_g}g</span></div>
            <div><span style={{ fontSize: 13, color: 'var(--text-sub)' }}>C {nutri.carboidratos_g}g</span></div>
            <div><span style={{ fontSize: 13, color: 'var(--text-sub)' }}>G {nutri.gorduras_g}g</span></div>
          </div>
        </div>
      )}

      {/* Objetivo */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: 12, background: 'var(--card)' }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: 8 }}>SEU OBJETIVO</p>
        <p style={{ fontSize: 15, color: 'var(--text)' }}>{usuario.objetivo}</p>
      </div>

      {/* Projeção */}
      {projecao.peso_estimado && (
        <div style={{ border: '1px solid var(--accent-dim)', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: 12, background: 'var(--accent-glow)' }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: 10 }}>PROJEÇÃO 30 DIAS</p>
          <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 18, fontFamily: 'Funnel Display, sans-serif' }}>{projecao.peso_estimado}</p>
              <p className="mono" style={{ fontSize: 9, color: 'var(--text-mute)' }}>peso estimado</p>
            </div>
            <div>
              <p style={{ fontSize: 18, fontFamily: 'Funnel Display, sans-serif' }}>{projecao.gordura_estimada}</p>
              <p className="mono" style={{ fontSize: 9, color: 'var(--text-mute)' }}>% gordura</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.6 }}>{projecao.observacao}</p>
        </div>
      )}

      {/* Weight tracker */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', background: 'var(--card)' }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: 14 }}>REGISTRAR PESO</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input type="number" step="0.1" placeholder="0.0 kg" value={novoPeso} onChange={e => setNovoPeso(e.target.value)} style={{ flex: 1 }} />
          <motion.button whileTap={{ scale: 0.94 }} onClick={addPeso}
            style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Plus size={20} color="#0A0A0A" />
          </motion.button>
        </div>
        <WeightChart weights={weights} />
      </div>

      <ReferenciasCard />
    </div>
  )
}
