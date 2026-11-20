import { motion } from 'framer-motion'
import { refeicoesDoDia, proximaRefeicao, saudacao, dataCurta } from '../lib/dia'

const rise = i => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] } })
const titulo = { fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }

export default function Hoje({ plano, checked, dietaPct, streak, pesoAtual, onMarcarRefeicao, onAbrir, onPerfil }) {
  const nome = plano?.usuario?.nome?.split(' ')[0] || ''
  const lista = refeicoesDoDia(plano, checked)
  const prox = proximaRefeicao(lista)
  const total = lista.reduce((s, r) => s + r.itens.length, 0)
  const feitos = lista.reduce((s, r) => s + r.feitos, 0)
  const sups = plano?.suplementos || []
  const supsFeitos = sups.filter((_, i) => checked[`sup__${i}`]).length

  return (
    <div style={{ padding: '24px 20px 130px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <motion.div {...rise(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>{dataCurta()}</p>
          <h1 style={{ ...titulo, fontSize: 28 }}>{saudacao()}{nome ? `, ${nome}` : ''}</h1>
        </div>
        <button onClick={onPerfil} aria-label="Sua conta"
          style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--lilas)', fontWeight: 700, fontSize: 16, color: '#2B2B2B' }}>
          {(nome[0] || 'P').toUpperCase()}
        </button>
      </motion.div>

      <motion.div {...rise(1)} style={{ background: 'var(--card)', borderRadius: 24, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ ...titulo, fontSize: 34 }}>{dietaPct}%</span>
          <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{total ? `${feitos} de ${total} itens do plano` : 'Seu plano ainda está vazio'}</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: '#F0EEF0', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${dietaPct}%` }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ height: 10, borderRadius: 999, background: 'var(--lima)' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 12, fontWeight: 600 }}>
          {lista.map((r, i) => (
            <span key={r.key} style={{ background: r.completa ? 'var(--lima)' : ['var(--lilas)', 'var(--ceu)', 'var(--rosa)'][i % 3], padding: '4px 10px', borderRadius: 999, opacity: r.itens.length ? 1 : 0.5 }}>
              {r.nome} {r.feitos}/{r.itens.length}
            </span>
          ))}
        </div>
      </motion.div>

      {!total && (
        <motion.div {...rise(2)} style={{ background: 'var(--card)', borderRadius: 24, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'inset 0 0 0 2px var(--lima)' }}>
          <span style={{ ...titulo, fontSize: 20 }}>Cadastre seu plano</span>
          <span style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5 }}>Coloque o que você come em cada refeição, do jeito que está no seu plano.</span>
          <button onClick={() => onAbrir('plano')} style={{ height: 46, borderRadius: 999, background: '#2B2B2B', color: '#fff', fontWeight: 600 }}>Abrir meu plano</button>
        </motion.div>
      )}

      {prox && (
        <motion.div {...rise(2)} style={{ background: 'var(--card)', borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: 'inset 0 0 0 2px var(--lima)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.04em' }}>PRÓXIMA{prox.horario ? ` · ${prox.horario}` : ''} · {prox.nome.toUpperCase()}</span>
          <span style={{ ...titulo, fontSize: 20, lineHeight: 1.25 }}>{prox.itens.map(a => a.item).filter(Boolean).slice(0, 3).join(', ')}{prox.itens.length > 3 ? '…' : ''}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => onMarcarRefeicao(prox.key)}
              style={{ flex: 1, height: 46, borderRadius: 999, background: '#2B2B2B', color: '#fff', fontWeight: 600, fontSize: 15 }}>Comi</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => onAbrir('plano')}
              style={{ flex: 1, height: 46, borderRadius: 999, background: '#fff', border: '1px solid var(--border2)', color: 'var(--text)', fontSize: 15 }}>Ver itens</motion.button>
          </div>
        </motion.div>
      )}

      <motion.div {...rise(3)} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--rosa)', borderRadius: 22, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Sequência</span>
          <span style={{ ...titulo, fontSize: 22 }}>{streak} {streak === 1 ? 'dia' : 'dias'}</span>
        </div>
        <button onClick={() => onAbrir('progresso')} style={{ textAlign: 'left', background: 'var(--ceu)', borderRadius: 22, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text)' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Peso</span>
          <span style={{ ...titulo, fontSize: 22 }}>{pesoAtual ? `${String(pesoAtual).replace('.', ',')} kg` : 'Registrar'}</span>
        </button>
      </motion.div>

      {sups.length > 0 && (
        <motion.button {...rise(4)} onClick={() => onAbrir('plano')}
          style={{ background: 'var(--card)', borderRadius: 20, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)', textAlign: 'left' }}>
          <img src="/brand/icones/suplementos/paleta/capsula.svg" alt="" width={24} height={24} />
          <span style={{ flex: 1 }}><b>Suplementos</b> · {supsFeitos} de {sups.length} hoje</span>
        </motion.button>
      )}
    </div>
  )
}
