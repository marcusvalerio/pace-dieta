import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Pencil, X, Plus, Trash2 } from 'lucide-react'
import { labelRefeicao } from '../lib/refeicoes'

// Ícones em public/brand/icones/suplementos/paleta
export const TIPOS_SUPLEMENTO = [
  { id: 'capsula', label: 'Cápsula' }, { id: 'comprimido', label: 'Comprimido' }, { id: 'whey', label: 'Whey' },
  { id: 'creatina', label: 'Creatina' }, { id: 'omega3', label: 'Ômega 3' }, { id: 'vitaminas', label: 'Vitaminas' },
  { id: 'gotas', label: 'Gotas' }, { id: 'sache', label: 'Sachê' }, { id: 'pre-treino', label: 'Pré-treino' },
]
const icone = id => `/brand/icones/suplementos/paleta/${id || 'capsula'}.svg`

// O Pace não indica suplementos: só registra o que a pessoa ou o nutri dela cadastrou.
export default function Suplementos({ plano, checked, onToggle, onUpdatePlano }) {
  const lista = plano?.suplementos || []
  const doNutri = plano?.origem === 'nutri'
  const [editando, setEditando] = useState(false)
  const refeicoes = Object.keys(plano?.plano_diario || {})

  const mudar = fn => { const next = { ...plano, suplementos: [...lista.map(s => ({ ...s }))] }; fn(next.suplementos); onUpdatePlano(next) }
  const feitos = lista.filter((_, i) => checked[`sup__${i}`]).length
  if (!lista.length && doNutri) return null

  return (
    <div style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--card)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Suplementos</p>
          <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>{doNutri ? 'Definidos pelo seu nutri' : 'Os que você toma'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lista.length > 0 && <p className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>{feitos}/{lista.length}</p>}
          {!doNutri && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditando(e => !e)} aria-label={editando ? 'Fechar edição' : 'Editar suplementos'}
              style={{ display: 'flex', color: editando ? 'var(--accent)' : 'var(--text-mute)', minHeight: 'unset', padding: 4 }}>
              {editando ? <X size={15} /> : <Pencil size={14} />}
            </motion.button>
          )}
        </div>
      </div>

      {lista.map((s, i) => {
        const key = `sup__${i}`
        const ok = !!checked[key]
        if (editando) return (
          <div key={i} style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)', display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={s.nome} placeholder="Nome (ex.: Creatina)" onChange={e => mudar(l => { l[i].nome = e.target.value })} style={{ flex: 2, minHeight: 38, padding: '8px 10px', fontSize: 13 }} />
              <input value={s.dose} placeholder="Dose (ex.: 5 g)" onChange={e => mudar(l => { l[i].dose = e.target.value })} style={{ flex: 1, minHeight: 38, padding: '8px 10px', fontSize: 13 }} />
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => mudar(l => { l.splice(i, 1) })} aria-label="Remover" style={{ color: 'var(--red)', display: 'flex', minHeight: 'unset', padding: 4 }}><Trash2 size={14} /></motion.button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={s.tipo || 'capsula'} onChange={e => mudar(l => { l[i].tipo = e.target.value })} style={{ flex: 1, minHeight: 38, fontSize: 13 }}>
                {TIPOS_SUPLEMENTO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={s.quando || ''} onChange={e => mudar(l => { l[i].quando = e.target.value })} style={{ flex: 1, minHeight: 38, fontSize: 13 }}>
                <option value="">Qualquer hora</option>
                {refeicoes.map(r => <option key={r} value={r}>Com {labelRefeicao(r).toLowerCase()}</option>)}
                <option value="jejum">Em jejum</option>
                <option value="dormir">Antes de dormir</option>
              </select>
            </div>
            <input value={s.obs || ''} placeholder="Observação (opcional)" onChange={e => mudar(l => { l[i].obs = e.target.value })} style={{ minHeight: 38, padding: '8px 10px', fontSize: 13 }} />
          </div>
        )
        const quando = s.quando === 'jejum' ? 'Em jejum' : s.quando === 'dormir' ? 'Antes de dormir' : s.quando ? `Com ${labelRefeicao(s.quando).toLowerCase()}` : ''
        return (
          <motion.div key={i} whileTap={{ scale: 0.99 }} onClick={() => onToggle(key)} role="checkbox" aria-checked={ok}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer' }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, border: '1.5px solid', borderColor: ok ? 'var(--accent)' : 'var(--border2)', background: ok ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {ok && <Check size={13} color="#F5F3EE" strokeWidth={3} />}
            </div>
            <img src={icone(s.tipo)} alt="" width={24} height={24} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, color: ok ? 'var(--text-mute)' : 'var(--text)', textDecoration: ok ? 'line-through' : 'none' }}>{s.nome || 'Suplemento'}</p>
              {(quando || s.obs) && <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>{[quando, s.obs].filter(Boolean).join(' · ')}</p>}
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>{s.dose}</span>
          </motion.div>
        )
      })}

      {(editando || !lista.length) && !doNutri && (
        <div style={{ padding: '10px 18px' }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setEditando(true); mudar(l => { l.push({ nome: '', dose: '', tipo: 'capsula', quando: '' }) }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 12, minHeight: 'unset', padding: '6px 0' }}>
            <Plus size={13} /> Adicionar suplemento
          </motion.button>
        </div>
      )}
    </div>
  )
}
