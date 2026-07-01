import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { getWeights, saveWeights } from '../lib/storage'

function WeightChart({ weights }) {
  if (weights.length < 2) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center' }}>
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
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#wg)" />
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {sorted.map((w, i) => <circle key={i} cx={x(i)} cy={y(w.val)} r="3" fill="var(--accent)" />)}
    </svg>
  )
}

export default function Dashboard({ plano, dietaPct }) {
  const [weights, setWeights] = useState(getWeights())
  const [novoPeso, setNovoPeso] = useState('')

  const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0]
  const prev = sorted[1]
  const diff = latest && prev ? (latest.val - prev.val).toFixed(1) : null

  const addPeso = () => {
    if (!novoPeso) return
    const today = new Date().toISOString().split('T')[0]
    const next = [...weights.filter(w => w.date !== today), { date: today, val: parseFloat(novoPeso) }]
    setWeights(next)
    saveWeights(next)
    setNovoPeso('')
  }

  const usuario = plano?.usuario || {}
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
        <h2 style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}>Seu progresso.</h2>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24, marginBottom: 12 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px', background: 'var(--card)' }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: 8 }}>DIETA HOJE</p>
          <p style={{ fontSize: 24, fontFamily: 'Funnel Display, sans-serif', color: 'var(--accent)' }}>{dietaPct}%</p>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px', background: 'var(--card)' }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: 8 }}>PESO ATUAL</p>
          <p style={{ fontSize: 24, fontFamily: 'Funnel Display, sans-serif' }}>{latest ? `${latest.val}kg` : '—'}</p>
          {diff !== null && (
            <p className="mono" style={{ fontSize: 10, marginTop: 3, color: parseFloat(diff) <= 0 ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 3 }}>
              {parseFloat(diff) <= 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
              {Math.abs(diff)}kg
            </p>
          )}
        </div>
      </div>

      {/* Objetivo */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: 12, background: 'var(--card)' }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em', marginBottom: 8 }}>SEU OBJETIVO</p>
        <p style={{ fontSize: 15, color: 'var(--text)' }}>{usuario.objetivo}</p>
      </div>

      {/* Projeção */}
      {projecao.peso_estimado && (
        <div style={{ border: '1px solid rgba(196,30,45,0.25)', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: 12, background: 'rgba(196,30,45,0.04)' }}>
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
            <Plus size={20} color="#F5F3EE" />
          </motion.button>
        </div>
        <WeightChart weights={weights} />
      </div>
    </div>
  )
}
