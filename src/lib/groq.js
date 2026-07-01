export async function gerarDieta(usuario) {
  const res = await fetch('/api/gerar-dieta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Falha ao gerar dieta')
  }

  const data = await res.json()
  return data.plano
}
