import { useState } from 'react'
import { motion } from 'framer-motion'
import ReferenciasCard from '../components/ReferenciasCard'

const titulo = { fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }
const iso = d => d.toISOString().split('T')[0]
const num = v => String(v).replace('.', ',')

function GraficoPeso({ pesos }) {
  if (pesos.length < 2) return <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>Registre pelo menos 2 pesagens para ver a linha.</p>
  const s = pesos.slice(-12), v = s.map(p => p.val)
  const min = Math.min(...v) - 0.5, max = Math.max(...v) + 0.5
  const W = 320, H = 110, pad = 12
  const x = i => pad + (i / (s.length - 1)) * (W - pad * 2)
  const y = val => H - pad - ((val - min) / (max - min)) * (H - pad * 2)
  const pts = s.map((p, i) => `${x(i)},${y(p.val)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Peso de ${num(s[0].val)} a ${num(s.at(-1).val)} kg`}>
      <polygon points={`${pad},${H - pad} ${pts} ${W - pad},${H - pad}`} fill="#E9F3DC" />
      <polyline points={pts} fill="none" stroke="#4A6B1F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {s.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.val)} r="3.5" fill="#fff" stroke="#4A6B1F" strokeWidth="2" />)}
    </svg>
  )
}

export default function Progresso({ checkedPorDia, totalItens, pesos, onSalvarPeso }) {
  const [novo, setNovo] = useState('')
  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d })
  const pct = d => {
    const c = checkedPorDia[iso(d)] || {}
    return totalItens ? Math.min(100, Math.round(Object.values(c).filter(Boolean).length / totalItens * 100)) : 0
  }
  const media = Math.round(dias.reduce((s, d) => s + pct(d), 0) / 7)
  const ord = [...pesos].sort((a, b) => a.date.localeCompare(b.date))
  const atual = ord.at(-1), primeiro = ord[0]
  const dif = atual && primeiro && ord.length > 1 ? Math.round((atual.val - primeiro.val) * 10) / 10 : null

  const salvar = () => {
    const v = parseFloat(String(novo).replace(',', '.'))
    if (!v || v < 20 || v > 400) return
    onSalvarPeso(v); setNovo('')
  }

  return (
    <div style={{ padding: '24px 20px 130px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h1 style={{ ...titulo, fontSize: 28 }}>Progresso</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--lima)', borderRadius: 22, padding: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Seguiu o plano</span><br />
          <span style={{ ...titulo, fontSize: 30 }}>{media}%</span>
          <span style={{ fontSize: 12, display: 'block' }}>últimos 7 dias</span>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 22, padding: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Peso</span><br />
          <span style={{ ...titulo, fontSize: 30 }}>{atual ? num(atual.val) : '—'}</span>
          {dif !== null && <span style={{ fontSize: 12, fontWeight: 600, color: dif <= 0 ? 'var(--accent)' : 'var(--red)' }}> {dif > 0 ? '+' : '−'}{num(Math.abs(dif))} kg</span>}
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 22, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <b style={{ fontSize: 15 }}>Plano seguido por dia</b>
        <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          {dias.map((d, i) => {
            const p = pct(d)
            return <motion.div key={i} initial={{ height: 0 }} animate={{ height: Math.max(6, p * 1.2) }} transition={{ delay: i * 0.05, duration: 0.6 }}
              title={`${p}%`} style={{ flex: 1, borderRadius: 8, background: p === 100 ? 'var(--lima)' : p ? '#DCEBC6' : '#ECEAEC' }} />
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-sub)', textAlign: 'center' }}>
          {dias.map((d, i) => <span key={i} style={{ flex: 1, fontWeight: i === 6 ? 700 : 400, color: i === 6 ? 'var(--text)' : undefined }}>{d.toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase()}</span>)}
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 22, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <b style={{ fontSize: 15 }}>Peso</b>
        <GraficoPeso pesos={ord} />
        <div style={{ display: 'flex', gap: 8 }}>
          <input inputMode="decimal" placeholder="Peso de hoje (kg)" value={novo} onChange={e => setNovo(e.target.value)} aria-label="Peso de hoje em kg" style={{ flex: 1 }} />
          <motion.button whileTap={{ scale: 0.95 }} onClick={salvar} style={{ padding: '0 20px', borderRadius: 999, background: '#2B2B2B', color: '#fff', fontWeight: 600 }}>Salvar</motion.button>
        </div>
      </div>

      <ReferenciasCard />
    </div>
  )
}
