import { neon } from '@neondatabase/serverless'
import crypto from 'node:crypto'

export const sql = neon(process.env.DATABASE_URL)

const SEGREDO = () => {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET ausente')
  return s
}
const b64 = (b) => Buffer.from(b).toString('base64url')
const DIAS = 60

export function criarToken(usuarioId) {
  const corpo = b64(JSON.stringify({ u: usuarioId, exp: Date.now() + DIAS * 864e5 }))
  const ass = crypto.createHmac('sha256', SEGREDO()).update(corpo).digest('base64url')
  return `${corpo}.${ass}`
}

export function lerToken(token) {
  if (!token || !token.includes('.')) return null
  const [corpo, ass] = token.split('.')
  const esperado = crypto.createHmac('sha256', SEGREDO()).update(corpo).digest('base64url')
  if (ass.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(ass), Buffer.from(esperado))) return null
  const dados = JSON.parse(Buffer.from(corpo, 'base64url').toString())
  return dados.exp > Date.now() ? dados.u : null
}

export function cookie(res, token) {
  const idade = token ? DIAS * 86400 : 0
  res.setHeader('Set-Cookie', `pace_sessao=${token || ''}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${idade}`)
}

export function usuarioDaRequisicao(req) {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)pace_sessao=([^;]+)/)
  return m ? lerToken(m[1]) : null
}

export function hashSenha(senha) {
  const sal = crypto.randomBytes(16)
  const h = crypto.scryptSync(senha, sal, 64)
  return `scrypt$${sal.toString('hex')}$${h.toString('hex')}`
}

export function conferirSenha(senha, guardado) {
  const [, salHex, hHex] = (guardado || '').split('$')
  if (!salHex) return false
  const h = crypto.scryptSync(senha, Buffer.from(salHex, 'hex'), 64)
  return crypto.timingSafeEqual(h, Buffer.from(hHex, 'hex'))
}
