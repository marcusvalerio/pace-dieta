import { motion, AnimatePresence } from 'framer-motion'
import { IllustrationFlame } from './Illustrations'

const ease = [0.16, 1, 0.3, 1]

export default function Celebration({ show, onDismiss }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onDismiss}
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(10,10,10,0.82)', backdropFilter: 'blur(6px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>

          {/* Glow pulse atrás da chama */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.4, 1.1], opacity: [0, 0.5, 0.3] }}
            transition={{ duration: 1.2, ease }}
            style={{
              position: 'absolute', width: 260, height: 260, borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }} />

          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: [0, 1.25, 1], rotate: [0, 4, 0] }}
            transition={{ duration: 0.9, ease, times: [0, 0.6, 1] }}
            style={{ position: 'relative', marginBottom: 24 }}>
            <IllustrationFlame size={140} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease }}
            style={{ fontSize: 26, fontFamily: 'Funnel Display, sans-serif', color: 'var(--text)', textAlign: 'center' }}>
            Dieta completa.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mono" style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.1em', marginTop: 8 }}>
            TOQUE PARA CONTINUAR
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
