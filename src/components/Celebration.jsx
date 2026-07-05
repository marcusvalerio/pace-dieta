import { motion, AnimatePresence } from 'framer-motion'
import { CountUp } from './CountUp'

const ease = [0.16, 1, 0.3, 1]
const R = 78
const CIRC = 2 * Math.PI * R

export default function Celebration({ show, onDismiss, streak = 1 }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onDismiss}
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(10,10,10,0.86)', backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>

          {/* Glow suave atrás do anel */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.3, 1], opacity: [0, 0.35, 0.2] }}
            transition={{ duration: 1.3, ease }}
            style={{
              position: 'absolute', width: 240, height: 240, borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }} />

          {/* Anel que se desenha + número */}
          <div style={{ position: 'relative', width: 176, height: 176, marginBottom: 28 }}>
            <svg width="176" height="176" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="88" cy="88" r={R} fill="none" stroke="var(--border2)" strokeWidth="1.5" />
              <motion.circle cx="88" cy="88" r={R} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"
                strokeDasharray={CIRC}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.1, ease, delay: 0.15 }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, ease }}
                style={{ fontSize: 44, fontFamily: 'Funnel Display, sans-serif', color: 'var(--text)', lineHeight: 1 }}>
                <CountUp value={streak} duration={0.9} />
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', letterSpacing: '0.1em', marginTop: 4 }}>
                {streak === 1 ? 'DIA SEGUIDO' : 'DIAS SEGUIDOS'}
              </motion.p>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5, ease }}
            style={{ fontSize: 22, fontFamily: 'Funnel Display, sans-serif', color: 'var(--text)', textAlign: 'center' }}>
            Dieta completa.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em', marginTop: 10 }}>
            TOQUE PARA CONTINUAR
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
