import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sprout } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ease = [0.22, 1, 0.36, 1]

function InputIcon({ icon: Icon, type = 'text', placeholder, value, onChange, right }) {
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-mute)', pointerEvents: 'none' }}>
        <Icon size={16} />
      </div>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{ paddingLeft: 42, paddingRight: right ? 42 : 16 }} />
      {right && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
    </div>
  )
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Preencha e-mail e senha.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    setLoading(false)
    if (error) setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
  }

  const handleSignup = async () => {
    if (!form.email || !form.password) { setError('Preencha todos os campos.'); return }
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    setLoading(false)
    if (error) setError(error.message)
  }

  const EyeBtn = (
    <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', display: 'flex', padding: 0, minHeight: 'unset' }}>
      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', paddingTop: 'var(--safe-top)' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
        style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 44, justifyContent: 'center' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={15} color="#0A0A0A" />
          </div>
          <span style={{ fontFamily: 'Funnel Display, sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>Pace</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}>
            <h2 style={{ fontSize: 26, marginBottom: 6 }}>{mode === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 26 }}>
              {mode === 'login' ? 'Entre para acessar seu plano.' : 'Seus dados ficam salvos na nuvem, em qualquer dispositivo.'}
            </p>

            <InputIcon icon={Mail} type="email" placeholder="E-mail" value={form.email} onChange={e => setF('email', e.target.value)} />
            <InputIcon icon={Lock} type={showPass ? 'text' : 'password'} placeholder="Senha" value={form.password} onChange={e => setF('password', e.target.value)} right={EyeBtn} />

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ fontSize: 12, color: '#e57373', background: 'rgba(196,30,45,0.08)', border: '1px solid rgba(196,30,45,0.2)', borderRadius: 6, padding: '9px 12px', marginBottom: 12 }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading}
              whileTap={{ scale: 0.97 }} whileHover={{ opacity: 0.88 }}
              style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1, marginBottom: 20 }}>
              {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              {!loading && <ArrowRight size={16} />}
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-sub)' }}>
              {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 13, padding: 0, minHeight: 'unset' }}>
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
