import { listaDoPlano } from '../lib/planoVazio'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import { CheckRipple } from '../components/CheckRipple'

const CAT_LABELS = {
  acougue: 'Açougue',
  hortifruti: 'Hortifruti',
  mercearia: 'Mercearia',
  laticinios_e_ovos: 'Laticínios & Ovos',
  suplementos: 'Suplementos',
  do_seu_plano: 'Do seu plano',
}

export default function Compras({ plano, compras, onToggle }) {
  const lista = listaDoPlano(plano)
  const categorias = Object.entries(lista).filter(([, items]) => items?.length > 0)
  const [rippleKey, setRippleKey] = useState(null)

  const totalItens = categorias.reduce((s, [, items]) => s + items.length, 0)
  const totalChecked = Object.values(compras).filter(Boolean).length

  const handleToggle = (key, isChecked) => {
    if (!isChecked) {
      setRippleKey(key)
      setTimeout(() => setRippleKey(k => k === key ? null : k), 550)
    }
    onToggle(key)
  }

  return (
    <div style={{ padding: '0 20px 100px' }}>
      <div style={{ padding: '20px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Lista de compras</h1>
          <p className="mono" style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>{totalChecked}/{totalItens} no carrinho</p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E9F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={17} color="var(--accent)" />
        </div>
      </div>

      {categorias.map(([cat, items], ci) => (
        <motion.div key={cat}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--card)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
            <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{CAT_LABELS[cat] || cat}</p>
          </div>
          {items.map((item, i) => {
            const key = `${cat}__${i}`
            const isChecked = !!compras[key]
            return (
              <motion.div key={i} whileTap={{ scale: 0.99 }} onClick={() => handleToggle(key, isChecked)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', cursor: 'pointer', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckRipple show={rippleKey === key} />
                  <motion.div animate={{
                    borderColor: isChecked ? 'var(--lima)' : 'var(--border2)',
                    background: isChecked ? 'var(--lima)' : 'transparent'
                  }} transition={{ duration: 0.2 }}
                    style={{ width: 20, height: 20, borderRadius: 6, border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isChecked && <Check size={13} color="#2B2B2B" strokeWidth={3} />}
                  </motion.div>
                </div>
                <span style={{ flex: 1, fontSize: 14, color: isChecked ? 'var(--text-mute)' : 'var(--text)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                  {item}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      ))}
    </div>
  )
}
