# Pace Consultório (ideia guardada)

Produto para nutricionistas, irmão do app Pace. Ainda não construído.

## Proposta
- O nutri cadastra o plano do paciente (refeições, substituições, suplementos) direto no sistema, sem PDF.
- O paciente recebe pelo código de convite do nutri e usa o Pace de graça.
- O nutri acompanha a adesão: quanto do plano cada paciente seguiu na semana, sequência, peso e avaliações.
- Mensagens entre nutri e paciente no próprio app.
- Marca da clínica (cor e logo) no app do paciente.

## Planos (mensal)
- Até 10 pacientes
- Até 25 pacientes
- Até 50 pacientes
- Clínica (mais de um nutri)

## Já existe no banco (Neon)
`clinicas`, `nutricionistas` (com `codigo_convite`), `pacientes.nutricionista_id`, `mensagens`,
`assinaturas` (produto `consultorio`, planos `ate10`, `ate25`, `ate50`, `clinica`), `suplementos_plano`.

## Regras
- O Pace não prescreve: a prescrição é sempre do nutricionista.
- Plano vindo do nutri fica só para o paciente marcar, sem editar.
- Compartilhar dados com o nutri depende do consentimento `compartilhar_nutri`.

## Telas já desenhadas no canvas
Final-Desktop, OpA/OpB/OpC-Desktop (versões para computador), Evo2-Nutri.
