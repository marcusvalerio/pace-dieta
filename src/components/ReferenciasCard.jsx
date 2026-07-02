import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ChevronDown, BookOpen } from 'lucide-react'
import { REFERENCIAS } from '../lib/referencias'

export default function ReferenciasCard() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--card)', overflow: 'hidden', marginTop: 12 }}>
      <motion.button whileTap={{ scale: 0.99 }} onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={15} color="var(--accent)" />
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.08em' }}>BASE CIENTÍFICA</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          <ChevronDown size={15} color="var(--text-mute)" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 18px 18px' }}>
              {REFERENCIAS.map((ref, i) => (
                <motion.a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  style={{ display: 'block', padding: '12px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3, lineHeight: 1.4 }}>{ref.titulo}</p>
                      <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 6 }}>{ref.autor}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.55 }}>{ref.desc}</p>
                    </div>
                    <ExternalLink size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: 3 }} />
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
