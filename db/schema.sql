-- Pace · esquema do banco (Neon / Postgres 17)
-- Atende os dois produtos: Pace (paciente e quem faz dieta sozinho) e Pace Consultório (nutricionista).

create extension if not exists pgcrypto;

-- Pessoas e organizações ------------------------------------------------------

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nome text not null,
  tipo text not null check (tipo in ('paciente', 'nutricionista')),
  criado_em timestamptz not null default now()
);

create table clinicas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cor_marca text,
  logo_url text,
  criada_em timestamptz not null default now()
);

create table nutricionistas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references usuarios(id) on delete cascade,
  clinica_id uuid references clinicas(id) on delete set null,
  crn text,
  codigo_convite text not null unique
);

create table pacientes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references usuarios(id) on delete cascade,
  nutricionista_id uuid references nutricionistas(id) on delete set null,
  conectado_em timestamptz,
  sexo text check (sexo in ('feminino', 'masculino')),
  nascimento date,
  altura_cm numeric(5,1),
  nivel_atividade text check (nivel_atividade in ('sedentaria', 'leve', 'moderada', 'intensa')),
  objetivo text check (objetivo in ('perder', 'manter', 'ganhar', 'saude')),
  peso_meta_kg numeric(5,1),
  refeicoes_por_dia smallint,
  acorda_as time,
  dorme_as time,
  almoca_fora boolean default false,
  restricoes text[] not null default '{}'
);

-- Assinaturas e consentimentos ------------------------------------------------

create table assinaturas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete cascade,
  clinica_id uuid references clinicas(id) on delete cascade,
  produto text not null check (produto in ('pace', 'consultorio')),
  plano text not null check (plano in ('mensal', 'anual', 'ate10', 'ate25', 'ate50', 'clinica')),
  status text not null check (status in ('teste', 'ativa', 'carencia', 'pausada', 'cancelada')),
  loja text check (loja in ('apple', 'google', 'web')),
  teste_ate timestamptz,
  periodo_ate timestamptz,
  carencia_ate timestamptz,
  criada_em timestamptz not null default now(),
  check (usuario_id is not null or clinica_id is not null)
);

create table consentimentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo text not null check (tipo in ('dados_saude', 'compartilhar_nutri', 'novidades_email')),
  aceito boolean not null,
  versao_politica text not null,
  registrado_em timestamptz not null default now()
);

-- Alimentos (biblioteca de ícones) --------------------------------------------

create table alimentos (
  id serial primary key,
  slug text not null unique,
  nome text not null,
  grupo text not null check (grupo in ('fruta_verdura', 'proteina', 'carboidrato', 'gordura', 'bebida')),
  icone text not null,
  kcal_100g numeric(6,1),
  proteina_100g numeric(5,1),
  carbo_100g numeric(5,1),
  gordura_100g numeric(5,1)
);

-- Plano alimentar --------------------------------------------------------------

create table planos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  autor_usuario_id uuid references usuarios(id) on delete set null,
  origem text not null check (origem in ('nutri', 'proprio', 'pdf')),
  inicio date not null,
  fim date,
  meta_kcal integer,
  meta_proteina_g integer,
  meta_carbo_g integer,
  meta_gordura_g integer,
  meta_agua_ml integer,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table refeicoes_plano (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid not null references planos(id) on delete cascade,
  dia_semana smallint check (dia_semana between 0 and 6), -- null = todos os dias
  nome text not null,
  horario time,
  ordem smallint not null default 0
);

create table itens_refeicao (
  id uuid primary key default gen_random_uuid(),
  refeicao_id uuid not null references refeicoes_plano(id) on delete cascade,
  alimento_id integer references alimentos(id),
  descricao text not null,
  quantidade numeric(7,2),
  unidade text,
  kcal integer,
  substitui_item_id uuid references itens_refeicao(id) on delete cascade
);

-- Diário do paciente -----------------------------------------------------------

create table registros_refeicao (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  refeicao_plano_id uuid references refeicoes_plano(id) on delete set null,
  data date not null,
  status text not null check (status in ('comi', 'troquei', 'pulei', 'extra')),
  descricao text,
  kcal integer,
  criado_em timestamptz not null default now()
);

create table registros_agua (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  data date not null,
  ml integer not null check (ml > 0),
  criado_em timestamptz not null default now()
);

create table pesagens (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  data date not null,
  peso_kg numeric(5,1) not null
);

create table avaliacoes (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  data date not null,
  local text check (local in ('academia', 'farmacia', 'nutri', 'casa')),
  origem text not null check (origem in ('pdf', 'manual')),
  pdf_url text,
  modelo_pdf text,
  peso_kg numeric(5,1),
  gordura_pct numeric(4,1),
  massa_magra_kg numeric(5,1),
  imc numeric(4,1),
  gordura_visceral numeric(4,1),
  agua_pct numeric(4,1),
  medidas jsonb not null default '{}'
);

create table importacoes_dieta (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  pdf_url text not null,
  modelo text,
  status text not null check (status in ('recebido', 'lido', 'revisar', 'salvo', 'falhou')),
  resultado jsonb,
  plano_id uuid references planos(id) on delete set null,
  criado_em timestamptz not null default now()
);

-- Lista de compras -------------------------------------------------------------

create table listas_compras (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  semana_inicio date not null,
  unique (paciente_id, semana_inicio)
);

create table itens_lista (
  id uuid primary key default gen_random_uuid(),
  lista_id uuid not null references listas_compras(id) on delete cascade,
  alimento_id integer references alimentos(id),
  nome text not null,
  quantidade numeric(7,2),
  unidade text,
  corredor text check (corredor in ('hortifruti', 'acougue_laticinios', 'mercearia', 'gorduras', 'outros')),
  comprado boolean not null default false
);

-- Conquistas -------------------------------------------------------------------

create table conquistas (
  slug text primary key,
  nome text not null,
  tipo text not null check (tipo in ('sequencia', 'semana', 'tematica')),
  nivel smallint check (nivel between 1 and 3),
  regra jsonb not null default '{}'
);

create table conquistas_paciente (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  conquista_slug text not null references conquistas(slug),
  obtida_em timestamptz not null default now(),
  dados jsonb not null default '{}'
);

-- Conversa paciente e nutri ----------------------------------------------------

create table mensagens (
  id uuid primary key default gen_random_uuid(),
  nutricionista_id uuid not null references nutricionistas(id) on delete cascade,
  paciente_id uuid not null references pacientes(id) on delete cascade,
  autor_usuario_id uuid not null references usuarios(id) on delete cascade,
  texto text not null,
  lida_em timestamptz,
  criada_em timestamptz not null default now()
);

-- Índices ----------------------------------------------------------------------

create index on pacientes (nutricionista_id);
create index on planos (paciente_id) where ativo;
create index on refeicoes_plano (plano_id);
create index on itens_refeicao (refeicao_id);
create index on registros_refeicao (paciente_id, data);
create index on registros_agua (paciente_id, data);
create index on pesagens (paciente_id, data);
create index on avaliacoes (paciente_id, data);
create index on itens_lista (lista_id);
create index on conquistas_paciente (paciente_id);
create index on mensagens (paciente_id, criada_em);
create index on assinaturas (usuario_id);
create index on assinaturas (clinica_id);

-- Dados do app atual (login próprio e estado do paciente) ----------------------

alter table usuarios add column senha_hash text;
alter table usuarios alter column nome set default '';
alter table planos add column conteudo jsonb;
create unique index pesagens_pac_data on pesagens (paciente_id, data);
create unique index planos_um_ativo on planos (paciente_id) where ativo;
create table checklist_diario (paciente_id uuid not null references pacientes(id) on delete cascade, data date not null, itens jsonb not null default '{}', primary key (paciente_id, data));
create table compras_estado (paciente_id uuid primary key references pacientes(id) on delete cascade, itens jsonb not null default '{}', atualizado_em timestamptz not null default now());
create table sintomas (paciente_id uuid not null references pacientes(id) on delete cascade, data date not null, campos jsonb not null default '{}', primary key (paciente_id, data));
create table celebracoes (paciente_id uuid not null references pacientes(id) on delete cascade, data date not null, primary key (paciente_id, data));
