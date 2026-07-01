// Vercel Serverless Function — protege a GROQ_API_KEY do lado do cliente
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { usuario } = req.body
  if (!usuario) {
    return res.status(400).json({ error: 'Dados do usuário ausentes' })
  }

  const systemPrompt = `Você é um nutricionista esportivo especialista em dietas de baixo custo e alta praticidade para o público brasileiro. 
Gere um plano alimentar completo, com receitas e lista de compras, em formato JSON estrito.

O JSON de saída DEVE seguir EXATAMENTE este schema (sem texto fora do JSON):

{
  "usuario": { "nome": string, "peso": number, "altura": number, "idade": number, "objetivo": string, "percentual_gordura": number|null, "orcamento_mensal": number, "restricoes": string[] },
  "plano_diario": {
    "cafe_manha": { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}] },
    "pre_treino": { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}] },
    "almoco": { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}] },
    "janta": { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}] }
  },
  "lista_compras": {
    "acougue": string[], "hortifruti": string[], "mercearia": string[], "laticinios_e_ovos": string[], "suplementos": string[]
  },
  "receitas": { "pre_treino": string, "frango_grelhado": string, "legumes_no_vapor": string },
  "receitas_alternativas": { "opcao_1": string, "opcao_2": string },
  "dicas_gerais": string[],
  "projecao_30_dias": { "peso_estimado": string, "gordura_estimada": string, "observacao": string }
}

Regras:
- Priorize alimentos baratos e fáceis de achar no Brasil.
- Respeite orçamento mensal informado.
- Respeite todas as restrições listadas.
- Ajuste macros para o(s) objetivo(s) selecionado(s) (pode ser mais de um, ex: "perda de gordura com hipertrofia").
- Quantidades sempre em gramas, unidades ou colheres — nunca vagas.
- Receitas curtas, práticas, sem termos técnicos de chef.
- Retorne APENAS o JSON, sem markdown, sem comentários.`

  const userPrompt = `Gere o plano alimentar para:
${JSON.stringify(usuario, null, 2)}`

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      return res.status(502).json({ error: 'Erro na Groq API', detail: errText })
    }

    const data = await groqRes.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return res.status(502).json({ error: 'Resposta vazia da IA' })
    }

    let plano
    try {
      plano = JSON.parse(content)
    } catch {
      return res.status(502).json({ error: 'IA retornou JSON inválido', raw: content })
    }

    return res.status(200).json({ plano })
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno', detail: String(err) })
  }
}
