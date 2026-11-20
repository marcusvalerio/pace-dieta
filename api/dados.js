import { sql, usuarioDaRequisicao } from './_lib/db.js'

// Todas as leituras e gravações do app passam por aqui, sempre presas ao usuário da sessão.
export default async function handler(req, res) {
  try {
    const usuarioId = usuarioDaRequisicao(req)
    if (!usuarioId) return res.status(401).json({ erro: 'Sessão expirada' })
    const [p] = await sql`select id from pacientes where usuario_id = ${usuarioId}`
    if (!p) return res.status(404).json({ erro: 'Paciente não encontrado' })
    const pid = p.id
    const acao = req.query.acao
    const b = req.body || {}
    const ok = (dados) => res.status(200).json({ dados: dados ?? null })

    switch (acao) {
      case 'plano': {
        const [r] = await sql`select conteudo from planos where paciente_id = ${pid} and ativo`
        return ok(r?.conteudo || null)
      }
      case 'salvarPlano': {
        const [r] = await sql`update planos set conteudo = ${JSON.stringify(b.plano)}::jsonb where paciente_id = ${pid} and ativo returning id`
        if (!r) await sql`insert into planos (paciente_id, autor_usuario_id, origem, inicio, conteudo) values (${pid}, ${usuarioId}, 'proprio', current_date, ${JSON.stringify(b.plano)}::jsonb)`
        return ok()
      }
      case 'limparPlano': {
        await sql.transaction([
          sql`delete from planos where paciente_id = ${pid}`,
          sql`delete from pesagens where paciente_id = ${pid}`,
          sql`delete from checklist_diario where paciente_id = ${pid}`,
          sql`delete from compras_estado where paciente_id = ${pid}`,
          sql`delete from sintomas where paciente_id = ${pid}`,
          sql`delete from celebracoes where paciente_id = ${pid}`,
        ])
        return ok()
      }
      case 'checklist': {
        const rows = await sql`select to_char(data, 'YYYY-MM-DD') as data, itens from checklist_diario where paciente_id = ${pid}`
        return ok(Object.fromEntries(rows.map(r => [r.data, r.itens || {}])))
      }
      case 'salvarChecklist':
        await sql`insert into checklist_diario (paciente_id, data, itens) values (${pid}, ${b.data}, ${JSON.stringify(b.itens || {})}::jsonb)
                  on conflict (paciente_id, data) do update set itens = excluded.itens`
        return ok()
      case 'compras': {
        const [r] = await sql`select itens from compras_estado where paciente_id = ${pid}`
        return ok(r?.itens || {})
      }
      case 'salvarCompras':
        await sql`insert into compras_estado (paciente_id, itens) values (${pid}, ${JSON.stringify(b.itens || {})}::jsonb)
                  on conflict (paciente_id) do update set itens = excluded.itens, atualizado_em = now()`
        return ok()
      case 'pesos': {
        const rows = await sql`select to_char(data, 'YYYY-MM-DD') as data, peso_kg from pesagens where paciente_id = ${pid} order by data`
        return ok(rows.map(r => ({ date: r.data, val: Number(r.peso_kg) })))
      }
      case 'salvarPeso':
        await sql`insert into pesagens (paciente_id, data, peso_kg) values (${pid}, ${b.data}, ${b.valor})
                  on conflict (paciente_id, data) do update set peso_kg = excluded.peso_kg`
        return ok()
      case 'celebracoes': {
        const rows = await sql`select to_char(data, 'YYYY-MM-DD') as data from celebracoes where paciente_id = ${pid}`
        return ok(rows.map(r => r.data))
      }
      case 'celebrar':
        await sql`insert into celebracoes (paciente_id, data) values (${pid}, ${b.data}) on conflict do nothing`
        return ok()
      case 'sintomas': {
        const limite = Math.min(Number(req.query.limite) || 6, 60)
        const rows = req.query.data
          ? await sql`select to_char(data, 'YYYY-MM-DD') as data, campos from sintomas where paciente_id = ${pid} and data = ${req.query.data}`
          : await sql`select to_char(data, 'YYYY-MM-DD') as data, campos from sintomas where paciente_id = ${pid} order by data desc limit ${limite}`
        return ok(rows.map(r => ({ ...r.campos, data: r.data })))
      }
      case 'salvarSintomas':
        await sql`insert into sintomas (paciente_id, data, campos) values (${pid}, ${b.data}, ${JSON.stringify(b.campos || {})}::jsonb)
                  on conflict (paciente_id, data) do update set campos = sintomas.campos || excluded.campos`
        return ok()
      case 'consentir': {
        const tipos = ['dados_saude', 'compartilhar_nutri', 'novidades_email']
        for (const t of tipos) {
          if (typeof b[t] !== 'boolean') continue
          await sql`insert into consentimentos (usuario_id, tipo, aceito, versao_politica) values (${usuarioId}, ${t}, ${b[t]}, ${String(b.versao || 'rascunho')})`
        }
        return ok()
      }
      default:
        return res.status(400).json({ erro: 'Ação inválida' })
    }
  } catch (e) {
    console.error(e)
    return res.status(500).json({ erro: 'Erro no servidor' })
  }
}
