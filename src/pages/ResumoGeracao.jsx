import { motion } from 'framer-motion'
import { ArrowRight, Flame, Beef, Wheat, Droplet } from 'lucide-react'
import { IllustrationLeaf } from '../components/Illustrations'

const ease = [0.16, 1, 0.3, 1]

function MacroBar({ label, value, unit, color, Icon, max }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} color={color} />
          <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{label}</span>
        </div>
        <span className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>{value}{unit}</span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 999, height: 5, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease, delay: 0.2 }}
          style={{ height: 5, background: color, borderRadius: 999 }} />
      </div>
    </div>
  )
}

export default function ResumoGeracao({ plano, onContinue }) {
  const nutri = plano?.resumo_nutricional || {}
  const usuario = plano?.usuario || {}
  const custo = plano?.custo_estimado_mensal

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 'var(--safe-top)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '40px 28px 32px', maxWidth: 480, width: '100%', margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <IllustrationLeaf size={72} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 8 }}>SEU PLANO ESTÁ PRONTO</p>
          <h2 style={{ fontSize: 30, marginBottom: 10, lineHeight: 1.2 }}>
            {usuario.nome}, aqui está seu plano.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.65, marginBottom: 32 }}>
            {nutri.explicacao_breve}
          </p>
        </motion.div>

        {/* Calorias — número grande */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease }}
          style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', marginBottom: 16, background: 'var(--card)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            <Flame size={16} color="var(--accent)" />
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em' }}>CALORIAS DIÁRIAS</span>
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ fontSize: 52, fontFamily: 'Funnel Display, sans-serif', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
            {nutri.calorias_totais_dia || '—'}
          </motion.p>
          <p className="mono" style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 6 }}>kcal / dia</p>
        </motion.div>

        {/* Macros */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5, ease }}
          style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 22px', marginBottom: 16, background: 'var(--card)' }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em', marginBottom: 18 }}>MACRONUTRIENTES</p>
          <MacroBar label="Proteínas" value={nutri.proteinas_g || 0} unit="g" color="var(--accent)" Icon={Beef} max={250} />
          <MacroBar label="Carboidratos" value={nutri.carboidratos_g || 0} unit="g" color="var(--text-sub)" Icon={Wheat} max={400} />
          <MacroBar label="Gorduras" value={nutri.gorduras_g || 0} unit="g" color="var(--green)" Icon={Droplet} max={120} />
        </motion.div>

        {/* Custo estimado */}
        {custo && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5, ease }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>Custo estimado mensal</span>
            <span className="mono" style={{ fontSize: 15, color: 'var(--accent)' }}>
              R$ {custo} <span style={{ color: 'var(--text-mute)', fontSize: 11 }}>/ R$ {usuario.orcamento_mensal}</span>
            </span>
          </motion.div>
        )}

        <div style={{ flex: 1 }} />

        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
          whileTap={{ scale: 0.97 }} whileHover={{ opacity: 0.85 }}
          onClick={onContinue}
          style={{ width: '100%', padding: '17px', borderRadius: 6, background: 'var(--accent)', color: '#0A0A0A', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 24 }}>
          Ver meu plano completo <ArrowRight size={17} />
        </motion.button>
      </div>
    </div>
  )
}
