import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Bell } from 'lucide-react'
import { getSintomas, saveSintomas, today, precisaCheckinHoje, NIVEL_OPCOES, SONO_OPCOES } from '../lib/sintomas'

const ease = [0.22, 1, 0.36, 1]

function MiniSelector({ label, icon, value, onChange, opcoes }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {opcoes.map(o => (
          <motion.button key={o.v} whileTap={{ scale: 0.95 }} onClick={() => onChange(o.v)}
            style={{
              padding: '8px 4px', borderRadius: 6, textAlign: 'center',
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

export default function DailyCheckin() {
  const [visivel, setVisivel] = useState(false)
  const [expandido, setExpandido] = useState(false)
  const [dados, setDados] = useState({ inchaco: null, energia: null, sono: null, notas: '' })
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    if (precisaCheckinHoje()) {
      const t = setTimeout(() => setVisivel(true), 700) // pequeno delay, sensação de "notificação chegando"
      return () => clearTimeout(t)
    }
  }, [])

  const dismissar = () => {
    const all = getSintomas()
    const next = { ...all, [today()]: { ...(all[today()] || {}), dismissed: true } }
    saveSintomas(next)
    setVisivel(false)
  }

  const enviar = () => {
    const all = getSintomas()
    const next = { ...all, [today()]: { ...dados, enviado: true, enviado_em: new Date().toISOString() } }
    saveSintomas(next)
    setEnviado(true)
    setTimeout(() => setVisivel(false), 1400)
  }

  const podeEnviar = dados.inchaco !== null || dados.energia !== null || dados.sono !== null || dados.notas.trim()

  return (
    <AnimatePresence>
      {visivel && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => !expandido && dismissar()}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.55)', backdropFilter: 'blur(3px)', zIndex: 300 }} />

          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={{ duration: 0.5, ease }}
            style={{
              position: 'fixed', top: 'calc(var(--safe-top) + 16px)', left: 16, right: 16, zIndex: 301,
              maxWidth: 448, margin: '0 auto',
              background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)',
              padding: '18px 18px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>

            {!expandido ? (
              <motion.div layout>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <motion.div animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={16} color="var(--accent)" />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>Como você está hoje?</p>
                    <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>Leva 10 segundos e ajuda a ajustar seu plano.</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={dismissar}
                    style={{ color: 'var(--text-mute)', display: 'flex', minHeight: 'unset', padding: 2 }}>
                    <X size={15} />
                  </motion.button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={dismissar}
                    style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid var(--border2)', color: 'var(--text-sub)', fontSize: 12 }}>
                    Agora não
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setExpandido(true)}
                    style={{ flex: 1.4, padding: '10px', borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', color: '#fff', fontSize: 12, fontWeight: 500 }}>
                    Preencher agora
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                {enviado ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ fontSize: 16, color: 'var(--accent)', fontFamily: 'Funnel Display, sans-serif' }}>Registro enviado.</p>
                  </motion.div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>Check-in de hoje</p>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={dismissar} style={{ color: 'var(--text-mute)', display: 'flex', minHeight: 'unset', padding: 2 }}>
                        <X size={15} />
                      </motion.button>
                    </div>
                    <MiniSelector label="🩺 Inchaço ou digestão" value={dados.inchaco} onChange={v => setDados(d => ({ ...d, inchaco: v }))} opcoes={NIVEL_OPCOES} />
                    <MiniSelector label="🪫 Energia ou fadiga" value={dados.energia} onChange={v => setDados(d => ({ ...d, energia: v }))} opcoes={NIVEL_OPCOES} />
                    <MiniSelector label="😴 Qualidade do sono" value={dados.sono} onChange={v => setDados(d => ({ ...d, sono: v }))} opcoes={SONO_OPCOES} />
                    <textarea placeholder="📝 Notas (opcional)" value={dados.notas} onChange={e => setDados(d => ({ ...d, notas: e.target.value }))}
                      rows={2} style={{ resize: 'none', fontSize: 13, marginBottom: 14 }} />
                    <motion.button whileTap={{ scale: podeEnviar ? 0.97 : 1 }} onClick={enviar} disabled={!podeEnviar}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 6, border: 'none',
                        background: podeEnviar ? 'linear-gradient(135deg, var(--accent), var(--accent-dim))' : 'var(--card)',
                        color: podeEnviar ? '#fff' : 'var(--text-mute)', fontSize: 13, fontWeight: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        cursor: podeEnviar ? 'pointer' : 'not-allowed',
                      }}>
                      <Send size={13} /> Enviar
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
