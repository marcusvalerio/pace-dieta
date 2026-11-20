import { motion } from 'framer-motion'
import Simbolo from './Simbolo'

const ic = { fill: 'none', stroke: '#2B2B2B', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
const TABS = [
  { id: 'hoje', label: 'Hoje', svg: <><path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" /><path d="M9.5 20.5V15h5v5.5" /></> },
  { id: 'plano', label: 'Plano', svg: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M7.5 12h9M7.5 16h5" /></> },
  { id: 'compras', label: 'Compras', svg: <><path d="M5 8h14l-1 11.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></> },
  { id: 'progresso', label: 'Progresso', svg: <><rect x="3.5" y="4" width="17" height="16" rx="3" /><path d="M8 16v-3M12 16V8.5M16 16v-5" /></> },
]

// Tab bar D2: cápsulas separadas, aba ativa com toque limão e o prato-folha como registro rápido
export default function NavBar({ active, onChange, onRegistrar }) {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100, pointerEvents: 'none', paddingBottom: 'calc(var(--safe-bottom) + 18px)', display: 'flex', justifyContent: 'center',
      background: 'linear-gradient(180deg, rgba(245,244,245,0), #F5F4F5 60%)', paddingTop: 30 }}>
      <nav aria-label="Navegação" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: 6, borderRadius: 999,
        background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 28px rgba(0,0,0,.08), inset 0 0 0 1px rgba(0,0,0,.04)' }}>
        {TABS.map(t => {
          const on = active === t.id
          return (
            <motion.button key={t.id} layout onClick={() => onChange(t.id)} aria-label={t.label} aria-current={on ? 'page' : undefined}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{ height: 50, minWidth: 50, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: on ? '0 18px 0 14px' : 0, fontSize: 15, fontWeight: 600, color: '#2B2B2B', whiteSpace: 'nowrap',
                background: on ? '#E9F3DC' : '#F3F2F3', boxShadow: on ? 'inset 0 0 0 1px #D6E9BD' : 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...ic}>{t.svg}</svg>
              {on && <span>{t.label}</span>}
            </motion.button>
          )
        })}
        <motion.button whileTap={{ scale: 0.9 }} onClick={onRegistrar} aria-label="Registro rápido"
          style={{ width: 50, height: 50, borderRadius: 999, background: '#151516', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2 }}>
          <Simbolo size={24} />
        </motion.button>
      </nav>
    </div>
  )
}
