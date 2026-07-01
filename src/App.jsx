import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Dieta from './pages/Dieta'
import Receitas from './pages/Receitas'
import Compras from './pages/Compras'
import NavBar from './components/NavBar'
import { getPlano, getChecked, saveChecked, getCompras, saveCompras } from './lib/storage'

const ease = [0.16, 1, 0.3, 1]

export default function App() {
  const [plano, setPlano] = useState(() => getPlano())
  const [tab, setTab] = useState('dashboard')
  const [checked, setChecked] = useState(() => getChecked())
  const [compras, setCompras] = useState(() => getCompras())

  const toggleCheck = (key) => {
    const next = { ...checked, [key]: !checked[key] }
    setChecked(next)
    saveChecked(next)
  }

  const toggleCompra = (key) => {
    const next = { ...compras, [key]: !compras[key] }
    setCompras(next)
    saveCompras(next)
  }

  const totalItens = Object.values(plano?.plano_diario || {}).reduce((s, m) => s + (m.alimentos?.length || 0), 0)
  const totalChecked = Object.values(checked).filter(Boolean).length
  const dietaPct = totalItens ? Math.round((totalChecked / totalItens) * 100) : 0

  if (!plano) {
    return <Onboarding onComplete={(p) => setPlano(p)} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 'var(--safe-top)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease }}>
            {tab === 'dashboard' && <Dashboard plano={plano} dietaPct={dietaPct} />}
            {tab === 'dieta'     && <Dieta plano={plano} checked={checked} onToggle={toggleCheck} />}
            {tab === 'receitas'  && <Receitas plano={plano} />}
            {tab === 'compras'   && <Compras plano={plano} compras={compras} onToggle={toggleCompra} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <NavBar active={tab} onChange={setTab} />
    </div>
  )
}
