import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check } from 'lucide-react'
import { getSintomas, saveSintomas, NIVEL_OPCOES, SONO_OPCOES } from '../lib/sintomas'

function MiniSelector({ label, icon, value, onChange, opcoes }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {opcoes.map(o => (
          <motion.button key={o.v} whileTap={{ scale: 0.95 }} onClick={() => onChange(o.v)}
            style={{
              padding: '9px 4px', borderRadius: 6, textAlign: 'center',
              border: `1px solid ${value === o.v ? 'var(--accent)' : 'var(--border2)'}`,
              background: value === o.v ? 'var(--accent-glow)' : 'transparent',
              color: value === o.v ? 'var(--accent)' : 'var(--text-mute)',
              fontSize: 10, cursor: 'pointer', minHeight: 'unset',
              transition: 'all 0.25s var(--ease-soft)'
            }}>
            {o.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function SintomasWidget() {
  const today = new Date().toISOString().split('T')[0]
  const [all, setAll] = useState(getSintomas())
  const [notas, setNotas] = useState('')
  const [enviado, setEnviado] = useState(false)

  const hoje = all[today] || { inchaco: null, energia: null, sono: null, notas: '' }
  const jaEnviouHoje = !!all[today]?.enviado

  const update = (field, value) => {
    const next = { ...all, [today]: { ...hoje, [field]: value } }
    setAll(next)
  }

  const enviar = () => {
    const next = { ...all, [today]: { ...hoje, notas, enviado: true, enviado_em: new Date().toISOString() } }
    setAll(next)
    saveSintomas(next)
    setEnviado(true)
    setTimeout(() => setEnviado(false), 2400)
  }

  const podeEnviar = hoje.inchaco !== null || hoje.energia !== null || hoje.sono !== null || notas.trim()

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 20px', background: 'var(--card)', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em' }}>COMO VOCÊ ESTÁ HOJE</p>
        {jaEnviouHoje && (
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={10} color="var(--accent)" /> ENVIADO
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 18, lineHeight: 1.55 }}>
        Registre como está se sentindo — ajuda a ajustar seu plano com o tempo.
      </p>

      <MiniSelector label="🩺 Inchaço ou digestão" value={hoje.inchaco} onChange={v => update('inchaco', v)} opcoes={NIVEL_OPCOES} />
      <MiniSelector label="🪫 Energia ou fadiga" value={hoje.energia} onChange={v => update('energia', v)} opcoes={NIVEL_OPCOES} />
      <MiniSelector label="😴 Qualidade do sono" value={hoje.sono} onChange={v => update('sono', v)} opcoes={SONO_OPCOES} />

      <textarea placeholder="📝 Notas adicionais (opcional)" value={notas || hoje.notas} onChange={e => setNotas(e.target.value)}
        rows={2} style={{ resize: 'none', fontSize: 13, marginBottom: 14 }} />

      <motion.button whileTap={{ scale: podeEnviar ? 0.97 : 1 }} onClick={enviar} disabled={!podeEnviar}
        style={{
          width: '100%', padding: '13px', borderRadius: 6, border: 'none',
          background: podeEnviar ? 'linear-gradient(135deg, var(--accent), var(--accent-dim))' : 'var(--card2)',
          color: podeEnviar ? '#fff' : 'var(--text-mute)',
          fontSize: 13, fontWeight: 500, cursor: podeEnviar ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
        <AnimatePresence mode="wait">
          {enviado
            ? <motion.span key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} /> Registro enviado
              </motion.span>
            : <motion.span key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Send size={13} /> Encaminhar registro
              </motion.span>
          }
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
