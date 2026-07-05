import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Download, Trash2, RefreshCw, ChevronRight } from 'lucide-react'
import { gerarDieta } from '../lib/groq'
import { savePlano, getWeights, getChecked, getCompras } from '../lib/storage'
import { getSintomasHistorico } from '../lib/sintomas'

const OBJETIVOS = ['Perda de gordura','Hipertrofia','Definição muscular','Manutenção','Performance esportiva','Saúde geral']
const REFEICOES_OPCOES = [
  { key: 'cafe_manha', label: 'Café da manhã', essencial: true },
  { key: 'lanche_manha', label: 'Lanche da manhã', essencial: false },
  { key: 'almoco', label: 'Almoço', essencial: true },
  { key: 'lanche_tarde', label: 'Lanche da tarde', essencial: false },
  { key: 'pre_treino', label: 'Pré-treino', essencial: false },
  { key: 'pos_treino', label: 'Pós-treino', essencial: false },
  { key: 'janta', label: 'Janta', essencial: true },
  { key: 'ceia', label: 'Ceia', essencial: false },
]
const RESTRICOES_COMUNS = ['Baixo custo','Praticidade','Vegetariano','Sem lactose','Sem glúten','Cafeína até 14h','Sem carne vermelha','Low carb']

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>{label}</p>
      {children}
    </div>
  )
}

function Chip({ selected, onClick, disabled, children }) {
  return (
    <motion.button whileTap={{ scale: disabled ? 1 : 0.95 }} onClick={disabled ? undefined : onClick}
      style={{
        padding: '9px 14px', borderRadius: 6,
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
        background: selected ? 'var(--accent-glow)' : 'transparent',
        color: selected ? 'var(--accent)' : 'var(--text-sub)',
        fontSize: 12, cursor: disabled ? 'default' : 'pointer', minHeight: 'unset',
        opacity: disabled ? 0.85 : 1,
        transition: 'all 0.25s var(--ease-soft)',
      }}>
      {children}
    </motion.button>
  )
}

export default function Perfil({ plano, userId, onPlanoAtualizado, onLogout, onApagarTudo }) {
  const u = plano?.usuario || {}
  const [form, setForm] = useState({
    nome: u.nome || '',
    peso: u.peso || '',
    altura: u.altura || '',
    idade: u.idade || '',
    objetivos: u.objetivo ? u.objetivo.split(', ') : [],
    percentualGordura: u.percentual_gordura || '',
    orcamento: u.orcamento_mensal || '',
    refeicoes: (plano?.plano_diario ? Object.keys(plano.plano_diario) : ['cafe_manha','almoco','janta']),
    restricoes: (u.restricoes || []).filter(r => RESTRICOES_COMUNS.includes(r)),
    restricaoLivre: (u.restricoes || []).filter(r => !RESTRICOES_COMUNS.includes(r)).join(', '),
  })
  const [regenerando, setRegenerando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [confirmarReset, setConfirmarReset] = useState(false)
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleObjetivo = (o) => setF('objetivos', form.objetivos.includes(o) ? form.objetivos.filter(x => x !== o) : [...form.objetivos, o])
  const toggleRefeicao = (key) => {
    const opcao = REFEICOES_OPCOES.find(r => r.key === key)
    if (opcao?.essencial && form.refeicoes.includes(key)) return
    setF('refeicoes', form.refeicoes.includes(key) ? form.refeicoes.filter(x => x !== key) : [...form.refeicoes, key])
  }
  const toggleRestricao = (r) => setF('restricoes', form.restricoes.includes(r) ? form.restricoes.filter(x => x !== r) : [...form.restricoes, r])

  const salvarSemGerar = () => {
    const next = {
      ...plano,
      usuario: {
        ...plano.usuario,
        nome: form.nome, peso: parseFloat(form.peso), altura: parseFloat(form.altura), idade: parseInt(form.idade),
        objetivo: form.objetivos.join(', '),
        percentual_gordura: form.percentualGordura ? parseFloat(form.percentualGordura) : null,
        orcamento_mensal: parseFloat(form.orcamento),
        restricoes: [...form.restricoes, ...(form.restricaoLivre.trim() ? [form.restricaoLivre.trim()] : [])],
      }
    }
    savePlano(userId, next)
    onPlanoAtualizado(next)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  const regenerarPlano = async () => {
    setRegenerando(true)
    const refeicoesOrdenadas = REFEICOES_OPCOES.filter(r => form.refeicoes.includes(r.key))
    const usuario = {
      nome: form.nome, peso: parseFloat(form.peso), altura: parseFloat(form.altura), idade: parseInt(form.idade),
      objetivo: form.objetivos.join(', '),
      percentual_gordura: form.percentualGordura ? parseFloat(form.percentualGordura) : null,
      orcamento_mensal: parseFloat(form.orcamento),
      refeicoes_selecionadas: refeicoesOrdenadas,
      restricoes: [...form.restricoes, ...(form.restricaoLivre.trim() ? [form.restricaoLivre.trim()] : [])],
    }
    try {
      const novoPlano = await gerarDieta(usuario)
      await savePlano(userId, novoPlano)
      onPlanoAtualizado(novoPlano, true) // true = mostrar resumo
    } catch (e) {
      setRegenerando(false)
      alert('Não foi possível gerar um novo plano. Tente novamente.')
    }
  }

  const exportarDados = async () => {
    const [pesos, checklist, comp, sintomas] = await Promise.all([
      getWeights(userId), getChecked(userId), getCompras(userId), getSintomasHistorico(userId, 90)
    ])
    const backup = { plano, pesos, checklist, compras: comp, sintomas, exportado_em: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pace-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const apagarTudo = async () => {
    await onApagarTudo()
  }

  if (regenerando) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }} style={{ marginBottom: 24 }}>
          <Loader2 size={28} color="var(--accent)" strokeWidth={1.5} />
        </motion.div>
        <p style={{ fontSize: 18, fontFamily: 'Funnel Display, sans-serif' }}>Gerando novo plano.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 20px 100px' }}>
      <div style={{ padding: '20px 0 24px' }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.15em' }}>SEU PERFIL</p>
        <h2 style={{ fontSize: 26, marginTop: 6 }}>Dados e preferências.</h2>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 20px', background: 'var(--card)', marginBottom: 12 }}>
        <Field label="Nome"><input value={form.nome} onChange={e => setF('nome', e.target.value)} /></Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Peso (kg)"><input type="number" value={form.peso} onChange={e => setF('peso', e.target.value)} /></Field>
          <Field label="Altura (m)"><input type="number" step="0.01" value={form.altura} onChange={e => setF('altura', e.target.value)} /></Field>
          <Field label="Idade"><input type="number" value={form.idade} onChange={e => setF('idade', e.target.value)} /></Field>
        </div>

        <Field label="% Gordura corporal (opcional)"><input type="number" step="0.1" value={form.percentualGordura} onChange={e => setF('percentualGordura', e.target.value)} /></Field>

        <Field label="Objetivos">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {OBJETIVOS.map(o => <Chip key={o} selected={form.objetivos.includes(o)} onClick={() => toggleObjetivo(o)}>{o}</Chip>)}
          </div>
        </Field>

        <Field label="Orçamento mensal (R$)"><input type="number" value={form.orcamento} onChange={e => setF('orcamento', e.target.value)} /></Field>

        <Field label="Refeições do dia">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {REFEICOES_OPCOES.map(r => (
              <Chip key={r.key} selected={form.refeicoes.includes(r.key)} disabled={r.essencial} onClick={() => toggleRefeicao(r.key)}>
                {r.label}{r.essencial ? ' ·' : ''}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Restrições">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {RESTRICOES_COMUNS.map(r => <Chip key={r} selected={form.restricoes.includes(r)} onClick={() => toggleRestricao(r)}>{r}</Chip>)}
          </div>
          <input placeholder="Outra restrição" value={form.restricaoLivre} onChange={e => setF('restricaoLivre', e.target.value)} />
        </Field>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={salvarSemGerar}
            style={{ flex: 1, padding: '13px', borderRadius: 6, background: 'var(--card2)', border: '1px solid var(--border2)', color: 'var(--text)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <AnimatePresence mode="wait">
              {salvo
                ? <motion.span key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}><Check size={14} /> Salvo</motion.span>
                : <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Salvar dados</motion.span>
              }
            </AnimatePresence>
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={regenerarPlano}
            style={{ flex: 1, padding: '13px', borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', border: 'none', color: '#fff', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <RefreshCw size={13} /> Gerar novo plano
          </motion.button>
        </div>
      </div>

      {/* Backup / dados */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 12 }}>
        <motion.button whileTap={{ scale: 0.99 }} onClick={exportarDados}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Download size={15} color="var(--text-sub)" />
            <span style={{ fontSize: 13, color: 'var(--text)' }}>Exportar meus dados</span>
          </div>
          <ChevronRight size={14} color="var(--text-mute)" />
        </motion.button>

        <motion.button whileTap={{ scale: 0.99 }} onClick={() => setConfirmarReset(true)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '15px 18px' }}>
          <Trash2 size={15} color="var(--red)" />
          <span style={{ fontSize: 13, color: 'var(--red)' }}>Apagar tudo e recomeçar</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {confirmarReset && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', border: '1px solid var(--red)', borderRadius: 'var(--radius-md)', padding: '16px 18px', background: 'rgba(196,30,45,0.06)' }}>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 14 }}>Isso apaga seu plano, histórico de peso, checklist e sintomas. Não pode ser desfeito.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirmarReset(false)}
                style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid var(--border2)', color: 'var(--text-sub)', fontSize: 13 }}>Cancelar</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={apagarTudo}
                style={{ flex: 1, padding: '10px', borderRadius: 6, background: 'var(--red)', color: '#fff', fontSize: 13, fontWeight: 500 }}>Apagar tudo</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.97 }} onClick={onLogout}
        style={{ width: '100%', padding: '13px', borderRadius: 6, border: '1px solid var(--border2)', color: 'var(--text-mute)', fontSize: 13, marginTop: 12, background: 'transparent' }}>
        Sair da conta
      </motion.button>
    </div>
  )
}
