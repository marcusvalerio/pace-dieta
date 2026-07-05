import { motion, AnimatePresence } from 'framer-motion'

// Pequeno anel que expande e desaparece ao marcar um item — feedback tátil visual
export function CheckRipple({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0.4, opacity: 0.5 }}
          animate={{ scale: 2.2, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute', width: 20, height: 20, borderRadius: 6,
            border: '1.5px solid var(--accent)', pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  )
}
