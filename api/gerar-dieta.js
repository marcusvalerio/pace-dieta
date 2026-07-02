// Vercel Serverless Function — protege a GROQ_API_KEY do lado do cliente
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { usuario } = req.body
  if (!usuario) {
    return res.status(400).json({ error: 'Dados do usuário ausentes' })
  }

  const refeicoesKeys = (usuario.refeicoes_selecionadas || []).map(r => r.key)
  const refeicoesLista = (usuario.refeicoes_selecionadas || []).map(r => `"${r.key}" (${r.label})`).join(', ')

  const systemPrompt = `Você é um nutricionista esportivo especialista em dietas de baixo custo, práticas e baseadas em alimentos reais para o público brasileiro.

BASE DE ALIMENTOS: Use como referência a Tabela Brasileira de Composição de Alimentos (TACO/NEPA-UNICAMP). Priorize SEMPRE alimentos in natura ou minimamente processados (arroz, feijão, ovos, frango, carne, peixe, frutas, legumes, verduras, tubérculos, leite e derivados simples). EVITE ultraprocessados (embutidos, produtos com muitos ingredientes industriais, refrigerantes, doces industrializados), a menos que o usuário peça explicitamente.

DISTRIBUIÇÃO DE CARBOIDRATOS AO LONGO DO DIA: Com base em evidência científica sobre ritmo circadiano e sensibilidade à insulina, distribua os carboidratos de forma decrescente ao longo do dia — mais carboidratos no café da manhã e almoço, quantidade reduzida na janta/ceia. Não elimine carboidratos da janta, apenas reduza a proporção comparado ao almoço.

REFEIÇÕES DO PLANO: Gere EXATAMENTE estas refeições, nesta ordem, usando estas chaves exatas: ${refeicoesLista || '"cafe_manha" (Café da manhã), "almoco" (Almoço), "janta" (Janta)'}.

Gere um plano alimentar completo em formato JSON estrito. O JSON de saída DEVE seguir EXATAMENTE este schema (sem texto fora do JSON):

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
    ${refeicoesKeys.length > 0 ? refeicoesKeys.map(k => `"${k}"`).join(': { "horario": "HH:MM", "alimentos": [{"item": string, "quantidade": string}], "calorias": number },\n    ') + ': { "horario": "HH:MM", "alimentos": [...], "calorias": number }' : '"cafe_manha": {...}, "almoco": {...}, "janta": {...}'}
  },
  "lista_compras": {
    "acougue": string[], "hortifruti": string[], "mercearia": string[], "laticinios_e_ovos": string[], "suplementos": string[]
  },
  "custo_estimado_mensal": number,
  "receitas": { "receita_1": string, "receita_2": string, "receita_3": string },
  "receitas_alternativas": { "opcao_1": string, "opcao_2": string },
  "dicas_gerais": string[],
  "projecao_30_dias": { "peso_estimado": string, "gordura_estimada": string, "observacao": string }
}

Regras adicionais:
- Priorize alimentos baratos e fáceis de achar no Brasil, seguindo a lógica da Tabela TACO.
- "custo_estimado_mensal" deve ficar dentro ou próximo do orçamento informado.
- Respeite todas as restrições listadas pelo usuário.
- Ajuste macros e calorias para o(s) objetivo(s) selecionado(s) (pode ser mais de um).
- Calcule calorias e macros de forma realista com base em peso, altura, idade e objetivo (estimativa de TMB + fator de atividade).
- A soma das calorias das refeições deve bater aproximadamente com "calorias_totais_dia".
- "explicacao_breve" deve mencionar o racional, incluindo a lógica de carboidratos decrescentes ao longo do dia.
- Quantidades sempre em gramas, unidades ou colheres — nunca vagas.
- Receitas curtas, práticas, sem termos técnicos de chef, usando apenas alimentos citados no plano ou lista de compras.
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
        max_tokens: 4800,
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

    return JSON.parse(content)
  }

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
