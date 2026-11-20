// Cliente das funções /api (banco Neon). A sessão vai num cookie HttpOnly.
export async function api(caminho, corpo) {
  const r = await fetch(`/api/${caminho}`, {
    method: corpo ? 'POST' : 'GET',
    headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
    credentials: 'same-origin',
  })
  const json = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(json.erro || 'Erro de conexão')
  return json
}
export const dados = async (acao, corpo, params = '') => (await api(`dados?acao=${acao}${params}`, corpo)).dados
