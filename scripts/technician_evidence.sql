-- Crear tabla Evidence
create table if not exists public."Evidence" (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
  technician_id text not null,
  title text not null,
  note text,
  file_url text,
  type text check (type in ('photo','video','audio','text')) not null,
  created_at timestamp with time zone default now()
);

-- Índices útiles
create index if not exists evidence_order_id_idx on public."Evidence" (order_id);
create index if not exists evidence_technician_id_idx on public."Evidence" (technician_id);
create index if not exists evidence_type_idx on public."Evidence" (type);

-- Activar RLS si se desea
alter table public."Evidence" enable row level security;

-- Políticas (ajusta según tu autenticación). Ejemplos permisivos:
-- Insert: permitir a cualquier usuario autenticado insertar su propia evidencia
create policy if not exists evidence_insert_own on public."Evidence"
  for insert to authenticated
  with check (technician_id = auth.uid()::text or true);

-- Select: permitir a técnicos ver sus evidencias y a roles internos ver por order_id
create policy if not exists evidence_select_own on public."Evidence"
  for select to authenticated
  using (technician_id = auth.uid()::text or true);

-- Nota: Si no usas auth.uid() porque el login es custom, reemplaza condiciones por tu lógica o desactiva RLS.

-- Storage bucket para evidencia (crear en Supabase UI):
-- bucket name: evidence (public read)

-- Extensiones de esquema para soportar grupos y metadatos (si no existen)
alter table public."Evidence" add column if not exists group_id uuid;
alter table public."Evidence" add column if not exists storage_path text;
alter table public."Evidence" add column if not exists mime_type text;
alter table public."Evidence" add column if not exists size_bytes integer;
alter table public."Evidence" add column if not exists width integer;
alter table public."Evidence" add column if not exists height integer;
alter table public."Evidence" add column if not exists duration_sec integer;

create index if not exists evidence_group_idx on public."Evidence" (group_id);


