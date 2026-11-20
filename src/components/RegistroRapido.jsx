import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { refeicoesDoDia } from '../lib/dia'

// Abre pelo prato-folha da tab bar: marcar uma refeição ou registrar o peso
export default function RegistroRapido({ aberto, onFechar, plano, checked, onMarcarRefeicao, onSalvarPeso }) {
  const [aba, setAba] = useState('refeicao')
  const [peso, setPeso] = useState('')
  const lista = refeicoesDoDia(plano, checked).filter(r => r.itens.length)

  const salvarPeso = () => {
    const v = parseFloat(String(peso).replace(',', '.'))
    if (!v || v < 20 || v > 400) return
    onSalvarPeso(v); setPeso(''); onFechar()
  }

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onFechar}
            style={{ position: 'fixed', inset: 0, background: 'rgba(43,43,43,.35)', zIndex: 200 }} />
          <motion.div role="dialog" aria-label="Registro rápido" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201, background: '#fff', borderRadius: '32px 32px 0 0', padding: '14px 20px calc(24px + var(--safe-bottom))', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '80vh', overflowY: 'auto' }}>
            <span style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 9, background: '#DDDADD' }} />
            <h2 style={{ fontSize: 24 }}>{aba === 'refeicao' ? 'O que você comeu?' : 'Seu peso hoje'}</h2>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, fontWeight: 600 }}>
              {[['refeicao', 'Refeição'], ['peso', 'Peso']].map(([id, l]) => (
                <button key={id} onClick={() => setAba(id)} style={{ padding: '10px 16px', borderRadius: 999, background: aba === id ? '#2B2B2B' : '#F5F4F5', color: aba === id ? '#fff' : 'var(--text)' }}>{l}</button>
              ))}
            </div>
            {aba === 'refeicao' && (lista.length ? lista.map(r => (
              <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 18, background: r.completa ? '#E9F3DC' : '#F5F4F5' }}>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 15 }}>{r.nome}</b>
                  <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{r.itens.map(a => a.item).filter(Boolean).slice(0, 3).join(', ')}</p>
                </div>
                <button onClick={() => { onMarcarRefeicao(r.key); onFechar() }} disabled={r.completa}
                  style={{ padding: '10px 16px', borderRadius: 999, background: r.completa ? 'transparent' : '#2B2B2B', color: r.completa ? 'var(--accent)' : '#fff', fontWeight: 600, fontSize: 14 }}>
                  {r.completa ? 'Feito' : 'Comi'}
                </button>
              </div>
            )) : <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>Cadastre os alimentos do seu plano para marcar por aqui.</p>)}
            {aba === 'peso' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input autoFocus inputMode="decimal" placeholder="Ex.: 72,4" value={peso} onChange={e => setPeso(e.target.value)} aria-label="Peso em kg" style={{ flex: 1 }} />
                <button onClick={salvarPeso} style={{ padding: '0 20px', borderRadius: 999, background: '#2B2B2B', color: '#fff', fontWeight: 600 }}>Salvar</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
