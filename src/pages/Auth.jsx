import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import Simbolo from '../components/Simbolo'

const titulo = { fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }
const campo = { height: 52, borderRadius: 14, border: '1px solid #E0DDE0', background: '#fff', padding: '0 14px', fontSize: 16, color: '#2B2B2B', width: '100%' }

export default function Auth() {
  const [tela, setTela] = useState('boasvindas') // boasvindas | cadastrar | entrar
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    if (!email || !senha) return setErro('Preencha e-mail e senha.')
    if (tela === 'cadastrar' && senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')
    setEnviando(true); setErro('')
    try {
      await api(`auth?acao=${tela}`, { email, senha })
      window.dispatchEvent(new Event('pace-auth'))
    } catch (err) { setErro(err.message); setEnviando(false) }
  }

  if (tela === 'boasvindas') return (
    <div style={{ minHeight: '100dvh', background: '#0E0E0F', color: '#F3F1F3', padding: '0 24px calc(40px + var(--safe-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center', maxWidth: 360 }}>
        <motion.div initial={{ scale: 0.6, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.3, 1.4, 0.5, 1] }}>
          <Simbolo size={96} titulo="Pace" />
        </motion.div>
        <h1 style={{ ...titulo, fontSize: 34, lineHeight: 1.1 }}>Comer bem,<br />no seu ritmo.</h1>
        <p style={{ fontSize: 15, color: '#B9B5BC', lineHeight: 1.5 }}>Seu plano, sua lista de compras e seu progresso, com ou sem nutricionista.</p>
      </div>
      <button onClick={() => setTela('cadastrar')} style={{ width: '100%', maxWidth: 420, height: 54, borderRadius: 999, background: '#F3F1F3', color: '#0E0E0F', fontWeight: 700, fontSize: 16 }}>Começar</button>
      <button onClick={() => setTela('entrar')} style={{ marginTop: 14, color: '#CFCBD2', fontSize: 14, fontWeight: 600 }}>Já tenho conta</button>
    </div>
  )

  const cadastro = tela === 'cadastrar'
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: '#2B2B2B', padding: 'calc(40px + var(--safe-top)) 24px calc(32px + var(--safe-bottom))', display: 'flex', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        <motion.form key={tela} onSubmit={enviar} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
          style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button type="button" onClick={() => { setTela('boasvindas'); setErro('') }} style={{ alignSelf: 'flex-start', fontSize: 14, color: 'var(--text-sub)' }}>‹ Voltar</button>
          <h1 style={{ ...titulo, fontSize: 30 }}>{cadastro ? 'Crie sua conta' : 'Que bom te ver'}</h1>
          <p style={{ fontSize: 15, color: '#555255', marginTop: -6 }}>{cadastro ? 'Leva menos de um minuto.' : 'Entre para ver seu plano.'}</p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#555255' }}>E-mail
            <input type="email" autoComplete="email" placeholder="voce@email.com" value={email} onChange={e => { setEmail(e.target.value); setErro('') }} style={campo} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#555255' }}>Senha
            <input type="password" autoComplete={cadastro ? 'new-password' : 'current-password'} placeholder={cadastro ? 'Mínimo 6 caracteres' : 'Sua senha'} value={senha} onChange={e => { setSenha(e.target.value); setErro('') }} style={campo} />
          </label>
          {erro && <p role="alert" style={{ fontSize: 13, color: 'var(--red)' }}>{erro}</p>}
          <button type="submit" disabled={enviando} style={{ height: 54, borderRadius: 999, background: '#2B2B2B', color: '#fff', fontWeight: 600, fontSize: 16, opacity: enviando ? 0.6 : 1 }}>
            {enviando ? 'Um instante…' : cadastro ? 'Criar conta' : 'Entrar'}
          </button>
          <button type="button" onClick={() => { setTela(cadastro ? 'entrar' : 'cadastrar'); setErro('') }} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {cadastro ? 'Já tenho conta' : 'Criar uma conta'}
          </button>
          <div style={{ flex: 1 }} />
          {cadastro && <p style={{ fontSize: 12, color: 'var(--text-sub)', textAlign: 'center', lineHeight: 1.5 }}>Ao continuar você aceita os Termos de uso e a Política de privacidade.</p>}
        </motion.form>
      </AnimatePresence>
    </div>
  )
}
