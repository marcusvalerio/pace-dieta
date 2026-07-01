import { motion } from 'framer-motion'
import { LayoutGrid, UtensilsCrossed, ChefHat, ShoppingBag, HeartPulse } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Painel',   Icon: LayoutGrid },
  { id: 'dieta',     label: 'Dieta',    Icon: UtensilsCrossed },
  { id: 'receitas',  label: 'Receitas', Icon: ChefHat },
  { id: 'compras',   label: 'Compras',  Icon: ShoppingBag },
  { id: 'sintomas',  label: 'Como estou', Icon: HeartPulse },
]

export default function NavBar({ active, onChange }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(24px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
      borderTop: '1px solid var(--border)',
      paddingBottom: 'var(--safe-bottom)',
    }}>
      <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto', padding: '10px 4px' }}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <motion.button key={id} onClick={() => onChange(id)}
              whileTap={{ scale: 0.92 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '6px 2px', position: 'relative' }}>
              <motion.div animate={{ color: isActive ? 'var(--accent)' : 'var(--text-mute)' }} transition={{ duration: 0.25 }}>
                <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
              </motion.div>
              <span className="mono" style={{ fontSize: 8, letterSpacing: '0.02em', color: isActive ? 'var(--accent)' : 'var(--text-mute)', textAlign: 'center' }}>{label}</span>
              {isActive && (
                <motion.div layoutId="navIndicator"
                  style={{ position: 'absolute', bottom: -10, width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
