import { sql, criarToken, cookie, usuarioDaRequisicao, hashSenha, conferirSenha } from './_lib/db.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  try {
    const acao = req.query.acao
    if (acao === 'eu') {
      const id = usuarioDaRequisicao(req)
      if (!id) return res.status(200).json({ usuario: null })
      const [u] = await sql`select id, email, nome from usuarios where id = ${id}`
      return res.status(200).json({ usuario: u || null })
    }
    if (acao === 'sair') { cookie(res, null); return res.status(200).json({ ok: true }) }
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' })

    const email = String(req.body?.email || '').trim().toLowerCase()
    const senha = String(req.body?.senha || '')
    if (!EMAIL.test(email) || !senha) return res.status(400).json({ erro: 'Preencha e-mail e senha.' })

    if (acao === 'cadastrar') {
      if (senha.length < 6) return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' })
      const [existe] = await sql`select 1 from usuarios where email = ${email}`
      if (existe) return res.status(409).json({ erro: 'Este e-mail já tem conta. Entre com sua senha.' })
      const [u] = await sql`insert into usuarios (email, tipo, senha_hash) values (${email}, 'paciente', ${hashSenha(senha)}) returning id, email, nome`
      await sql`insert into pacientes (usuario_id) values (${u.id})`
      cookie(res, criarToken(u.id))
      return res.status(200).json({ usuario: u })
    }
    if (acao === 'entrar') {
      const [u] = await sql`select id, email, nome, senha_hash from usuarios where email = ${email}`
      if (!u || !conferirSenha(senha, u.senha_hash)) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' })
      cookie(res, criarToken(u.id))
      return res.status(200).json({ usuario: { id: u.id, email: u.email, nome: u.nome } })
    }
    return res.status(400).json({ erro: 'Ação inválida' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ erro: 'Erro no servidor. Tente de novo.' })
  }
}
