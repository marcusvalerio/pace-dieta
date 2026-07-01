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
Gere um plano alimentar completo, com receitas, lista de compras e informações nutricionais, em formato JSON estrito.

O JSON de saída DEVE seguir EXATAMENTE este schema (sem texto fora do JSON):

{
  "usuario": { "nome": string, "peso": number, "altura": number, "idade": number, "objetivo": string, "percentual_gordura": number|null, "orcamento_mensal": number, "restricoes": string[] },
  "resumo_nutricional": {
    "calorias_totais_dia": number,
    "proteinas_g": number,
    "carboidratos_g": number,
    "gorduras_g": number,
    "explicacao_breve": string
  },
  "plano_diario": {
    "cafe_manha": { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}], "calorias": number },
    "pre_treino": { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}], "calorias": number },
    "almoco": { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}], "calorias": number },
    "janta": { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}], "calorias": number }
  },
  "lista_compras": {
    "acougue": string[], "hortifruti": string[], "mercearia": string[], "laticinios_e_ovos": string[], "suplementos": string[]
  },
  "custo_estimado_mensal": number,
  "receitas": { "pre_treino": string, "frango_grelhado": string, "legumes_no_vapor": string },
  "receitas_alternativas": { "opcao_1": string, "opcao_2": string },
  "dicas_gerais": string[],
  "projecao_30_dias": { "peso_estimado": string, "gordura_estimada": string, "observacao": string }
}

Regras:
- Priorize alimentos baratos e fáceis de achar no Brasil.
- Respeite orçamento mensal informado — "custo_estimado_mensal" deve ficar dentro ou próximo do orçamento.
- Respeite todas as restrições listadas.
- Ajuste macros e calorias para o(s) objetivo(s) selecionado(s) (pode ser mais de um, ex: "perda de gordura com hipertrofia").
- Calcule calorias e macros de forma realista com base em peso, altura, idade e objetivo (use estimativa de TMB + fator de atividade).
- A soma das calorias das 4 refeições deve bater aproximadamente com "calorias_totais_dia".
- "explicacao_breve" deve ser uma frase simples explicando o racional (ex: "déficit calórico moderado para perda de gordura preservando massa magra").
- Quantidades sempre em gramas, unidades ou colheres — nunca vagas.
- Receitas curtas, práticas, sem termos técnicos de chef.
- Retorne APENAS o JSON, sem markdown, sem comentários.`

  const userPrompt = `Gere o plano alimentar para:
${JSON.stringify(usuario, null, 2)}`

  async function callGroq() {
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
        max_tokens: 4500,
        response_format: { type: 'json_object' }
      })
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq API error: ${errText}`)
    }

    const data = await groqRes.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Resposta vazia da IA')

    return JSON.parse(content) // pode lançar erro de parse
  }

  // Retry automático — até 2 tentativas extras se falhar (rede, JSON malformado, etc)
  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const plano = await callGroq()
      return res.status(200).json({ plano })
    } catch (err) {
      lastError = err
      if (attempt < 2) await new Promise(r => setTimeout(r, 600))
    }
  }

  return res.status(502).json({ error: 'Não foi possível gerar sua dieta após algumas tentativas.', detail: String(lastError) })
}
