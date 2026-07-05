import { supabase } from './supabase'

export function today() { return new Date().toISOString().split('T')[0] }

export async function getSintomasHoje(userId) {
  if (!userId) return null
  const { data } = await supabase.from('pace_sintomas').select('*').eq('user_id', userId).eq('data', today()).maybeSingle()
  return data
}

export async function getSintomasHistorico(userId, limit = 6) {
  if (!userId) return []
  const { data } = await supabase.from('pace_sintomas').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(limit)
  return data || []
}

export async function salvarSintomas(userId, campos) {
  if (!userId) return
  await supabase.from('pace_sintomas').upsert({ user_id: userId, data: today(), ...campos })
}

export async function precisaCheckinHoje(userId) {
  const hoje = await getSintomasHoje(userId)
  return !hoje || (!hoje.enviado && !hoje.dismissed)
}

export const NIVEL_OPCOES = [
  { v: 0, label: 'Nenhum' },
  { v: 1, label: 'Leve' },
  { v: 2, label: 'Moderado' },
  { v: 3, label: 'Intenso' },
]

export const SONO_OPCOES = [
  { v: 0, label: 'Ruim' },
  { v: 1, label: 'Regular' },
  { v: 2, label: 'Boa' },
  { v: 3, label: 'Ótima' },
]
