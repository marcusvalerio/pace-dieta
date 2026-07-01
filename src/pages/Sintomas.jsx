import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

const KEY = 'pace_sintomas'

function getSintomas() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
function saveSintomas(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

const NIVEL_OPCOES = [
  { v: 0, label: 'Nenhum' },
  { v: 1, label: 'Leve' },
  { v: 2, label: 'Moderado' },
  { v: 3, label: 'Intenso' },
]

const SONO_OPCOES = [
  { v: 0, label: 'Ruim' },
  { v: 1, label: 'Regular' },
  { v: 2, label: 'Boa' },
  { v: 3, label: 'Ótima' },
]

function NivelSelector({ label, icon, value, onChange, opcoes }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 14, color: 'var(--text)' }}>{label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {opcoes.map(o => (
          <motion.button key={o.v} whileTap={{ scale: 0.95 }} onClick={() => onChange(o.v)}
            style={{
              padding: '11px 6px', borderRadius: 6, textAlign: 'center',
              border: `1px solid ${value === o.v ? 'var(--accent)' : 'var(--border2)'}`,
              background: value === o.v ? 'var(--accent-glow)' : 'transparent',
              color: value === o.v ? 'var(--accent)' : 'var(--text-sub)',
              fontSize: 11, cursor: 'pointer', minHeight: 'unset',
              transition: 'all 0.25s var(--ease)'
            }}>
            {o.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function Sintomas() {
  const today = new Date().toISOString().split('T')[0]
  const [all, setAll] = useState(getSintomas())
  const [saved, setSaved] = useState(false)

  const hoje = all[today] || { inchaco: null, energia: null, sono: null, notas: '' }

  const update = (field, value) => {
    const next = { ...all, [today]: { ...hoje, [field]: value } }
    setAll(next)
    saveSintomas(next)
  }

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 1800)
    return () => clearTimeout(t)
  }, [saved])

  return (
    <div style={{ padding: '0 20px 100px' }}>
      <div style={{ padding: '20px 0 8px' }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.15em' }}>ACOMPANHAMENTO</p>
        <h2 style={{ fontSize: 26, marginTop: 6 }}>Como você está?</h2>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 8, lineHeight: 1.6 }}>
          Registre como está se sentindo hoje. Esses dados ajudam a ajustar seu plano com o tempo.
        </p>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 20px', marginTop: 20, background: 'var(--card)' }}>
        <NivelSelector label="Inchaço ou problemas digestivos" icon="🩺" value={hoje.inchaco} onChange={v => update('inchaco', v)} opcoes={NIVEL_OPCOES} />
        <NivelSelector label="Baixa energia ou fadiga" icon="🪫" value={hoje.energia} onChange={v => update('energia', v)} opcoes={NIVEL_OPCOES} />
        <NivelSelector label="Qualidade do sono" icon="😴" value={hoje.sono} onChange={v => update('sono', v)} opcoes={SONO_OPCOES} />

        <div>
          <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>📝 Notas adicionais</p>
          <textarea
            placeholder="Algo que queira registrar sobre hoje..."
            value={hoje.notas}
            onChange={e => update('notas', e.target.value)}
            rows={3}
            style={{ resize: 'none', fontSize: 14 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {(hoje.inchaco !== null || hoje.energia !== null || hoje.sono !== null) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)' }}>
            <Check size={14} color="var(--accent)" />
            <span style={{ fontSize: 12, color: 'var(--accent)' }}>Registro de hoje salvo automaticamente</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico simples dos últimos dias */}
      {Object.keys(all).length > 1 && (
        <div style={{ marginTop: 28 }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em', marginBottom: 12 }}>ÚLTIMOS REGISTROS</p>
          {Object.entries(all)
            .filter(([date]) => date !== today)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 5)
            .map(([date, d]) => (
              <div key={date} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-sub)' }}>
                  {d.inchaco !== null && <span>🩺 {NIVEL_OPCOES[d.inchaco]?.label}</span>}
                  {d.energia !== null && <span>🪫 {NIVEL_OPCOES[d.energia]?.label}</span>}
                  {d.sono !== null && <span>😴 {SONO_OPCOES[d.sono]?.label}</span>}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
