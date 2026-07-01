import { motion } from 'framer-motion'
import { ChefHat } from 'lucide-react'

const RECEITA_LABELS = {
  pre_treino: 'Shake pré-treino',
  frango_grelhado: 'Frango grelhado',
  legumes_no_vapor: 'Legumes no vapor',
}

export default function Receitas({ plano }) {
  const receitas = plano?.receitas || {}
  const alternativas = plano?.receitas_alternativas || {}

  const principais = Object.entries(receitas)
  const alts = Object.entries(alternativas)

  return (
    <div style={{ padding: '0 20px 100px' }}>
      <div style={{ padding: '20px 0 24px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 300 }}>Receitas</h2>
        <p className="mono" style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>{principais.length + alts.length} receitas geradas para você</p>
      </div>

      {principais.map(([key, texto], i) => (
        <motion.div key={key}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--card)', padding: '20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,180,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={15} color="var(--accent)" />
            </div>
            <p style={{ fontSize: 16, fontFamily: 'Fraunces, serif' }}>{RECEITA_LABELS[key] || key}</p>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7 }}>{texto}</p>
        </motion.div>
      ))}

      {alts.length > 0 && (
        <>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '24px 0 12px' }}>Alternativas</p>
          {alts.map(([key, texto], i) => (
            <motion.div key={key}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (principais.length + i) * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '18px 20px', opacity: 0.85 }}>
              <p style={{ fontSize: 15, fontFamily: 'Fraunces, serif', marginBottom: 8, color: 'var(--text-sub)' }}>
                {key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.65 }}>{texto}</p>
            </motion.div>
          ))}
        </>
      )}

      {plano?.dicas_gerais?.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Dicas gerais</p>
          {plano.dicas_gerais.map((dica, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < plano.dicas_gerais.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginTop: 8, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{dica}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
