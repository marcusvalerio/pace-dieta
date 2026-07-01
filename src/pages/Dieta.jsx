import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const MEAL_LABELS = {
  cafe_manha: 'Café da manhã',
  pre_treino: 'Pré-treino',
  almoco: 'Almoço',
  janta: 'Janta',
}

const MEAL_ORDER = ['cafe_manha', 'pre_treino', 'almoco', 'janta']

export default function Dieta({ plano, checked, onToggle }) {
  const refeicoes = plano?.plano_diario || {}

  const totalItens = MEAL_ORDER.reduce((s, m) => s + (refeicoes[m]?.alimentos?.length || 0), 0)
  const totalChecked = Object.values(checked).filter(Boolean).length
  const pct = totalItens ? Math.round((totalChecked / totalItens) * 100) : 0

  return (
    <div style={{ padding: '0 20px 100px' }}>
      {/* Progress */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 24px' }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 600 }}>Hoje</h2>
          <p className="mono" style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>{totalChecked}/{totalItens} concluídos</p>
        </div>
        <div style={{ position: 'relative', width: 52, height: 52 }}>
          <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="var(--border)" strokeWidth="3" />
            <motion.circle cx="26" cy="26" r="22" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={138}
              initial={{ strokeDashoffset: 138 }}
              animate={{ strokeDashoffset: 138 - (138 * pct) / 100 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="mono" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--accent)' }}>
            {pct}%
          </div>
        </div>
      </motion.div>

      {/* Meals */}
      {MEAL_ORDER.map((mealKey, mi) => {
        const meal = refeicoes[mealKey]
        if (!meal) return null
        const items = meal.alimentos || []
        const doneCount = items.filter((_, i) => checked[`${mealKey}__${i}`]).length
        const allDone = doneCount === items.length && items.length > 0

        return (
          <motion.div key={mealKey}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mi * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginBottom: 12, borderRadius: 'var(--radius-md)',
              border: `1px solid ${allDone ? 'rgba(196,30,45,0.3)' : 'var(--border)'}`,
              background: allDone ? 'rgba(196,30,45,0.04)' : 'var(--card)',
              overflow: 'hidden', transition: 'border-color 0.3s, background 0.3s'
            }}>
            <div style={{ padding: '16px 18px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: allDone ? 'var(--accent)' : 'var(--text)' }}>{MEAL_LABELS[mealKey]}</p>
                <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>{meal.horario}</p>
              </div>
              <p className="mono" style={{ fontSize: 11, color: allDone ? 'var(--accent)' : 'var(--text-mute)' }}>{doneCount}/{items.length}</p>
            </div>
            {items.map((food, i) => {
              const key = `${mealKey}__${i}`
              const isChecked = !!checked[key]
              return (
                <motion.div key={i} whileTap={{ scale: 0.99 }} onClick={() => onToggle(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer', background: isChecked ? 'rgba(196,30,45,0.03)' : 'transparent' }}>
                  <motion.div animate={{
                    borderColor: isChecked ? 'var(--accent)' : 'var(--border2)',
                    background: isChecked ? 'var(--accent)' : 'transparent'
                  }} transition={{ duration: 0.2 }}
                    style={{ width: 20, height: 20, borderRadius: 6, border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isChecked && <Check size={13} color="#F5F3EE" strokeWidth={3} />}
                  </motion.div>
                  <span style={{ flex: 1, fontSize: 14, color: isChecked ? 'var(--text-mute)' : 'var(--text)', textDecoration: isChecked ? 'line-through' : 'none', transition: 'color 0.2s' }}>
                    {food.item}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>{food.quantidade}</span>
                </motion.div>
              )
            })}
          </motion.div>
        )
      })}

      {pct === 100 && totalItens > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '28px 20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(196,30,45,0.3)', background: 'rgba(196,30,45,0.05)', marginTop: 8 }}>
          <p style={{ fontSize: 18, fontFamily: 'Funnel Display, sans-serif', color: 'var(--accent)', marginBottom: 6 }}>Dieta completa hoje.</p>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.08em' }}>CONSISTÊNCIA É O CAMINHO</p>
        </motion.div>
      )}
    </div>
  )
}
