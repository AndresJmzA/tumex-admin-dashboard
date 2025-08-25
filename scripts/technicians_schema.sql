-- technicians_schema.sql
-- Esquema mínimo para asignación de técnicos, historial de estados
-- y utilidades de disponibilidad/traslapes sin duraciones planificadas.

-- Requisitos
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Technicians_Details: corregir typo si existiera y añadir columnas rápidas de estado
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Technicians_Details' AND column_name='techincian_id'
  ) THEN
    EXECUTE 'ALTER TABLE "Technicians_Details" RENAME COLUMN "techincian_id" TO "technician_id"';
  END IF;
END $$;

ALTER TABLE "Technicians_Details"
  ADD COLUMN IF NOT EXISTS current_assignment_id uuid,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- 2) Tabla de asignaciones de técnicos (sin duraciones planificadas)
CREATE TABLE IF NOT EXISTS "Technician_Assignments" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id varchar NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  technician_id varchar NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'asistente',           -- 'principal' | 'asistente'
  status text NOT NULL DEFAULT 'assigned',          -- 'assigned' | 'in_transit' | 'on_site' | 'completed' | 'cancelled'
  scheduled_at timestamptz,                         -- instante objetivo (fecha+hora cirugía)
  started_at timestamptz,                           -- momento real en que entra
  finished_at timestamptz,                          -- momento real en que cierra
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, technician_id)
);

-- FK desde Technicians_Details a asignación actual
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_td_current_assignment'
      AND table_name = 'Technicians_Details'
  ) THEN
    ALTER TABLE "Technicians_Details"
      ADD CONSTRAINT fk_td_current_assignment
      FOREIGN KEY (current_assignment_id) REFERENCES "Technician_Assignments"(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Índices para disponibilidad/traslapes
CREATE INDEX IF NOT EXISTS idx_ta_technician ON "Technician_Assignments"(technician_id);
CREATE INDEX IF NOT EXISTS idx_ta_order ON "Technician_Assignments"(order_id);
CREATE INDEX IF NOT EXISTS idx_ta_scheduled ON "Technician_Assignments"(scheduled_at);

-- 3) Historial de estados de orden
CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id varchar NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by varchar,
  changed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_osh_order_changed ON "OrderStatusHistory"(order_id, changed_at DESC);

-- 4) Periodos de indisponibilidad no ligados a órdenes (opcional, útil para agenda)
CREATE TABLE IF NOT EXISTS "Technician_Unavailability" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id varchar NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  type text NOT NULL,                                -- 'time_off' | 'sick' | 'vacation' | 'training'
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tu_technician ON "Technician_Unavailability"(technician_id);
CREATE INDEX IF NOT EXISTS idx_tu_period ON "Technician_Unavailability"(start_at, end_at);

-- 5) Orders: columna combinada para fecha/hora (facilita consultas)
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS surgery_at timestamptz;

UPDATE "Orders"
SET surgery_at = (surgery_date::timestamp + surgery_time)::timestamptz
WHERE surgery_at IS NULL AND surgery_date IS NOT NULL AND surgery_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_surgery_at ON "Orders"(surgery_at);

-- 6) Vista para estado actual del técnico (disponible / orden actual / desde cuándo)
CREATE OR REPLACE VIEW "Technician_Current_Status" AS
SELECT
  u.id AS technician_id,
  COALESCE(td.is_available, true) AS is_available_flag,
  CASE WHEN ta_active.id IS NULL THEN true ELSE false END AS is_available_now,
  ta_active.order_id AS current_order_id,
  COALESCE(ta_active.started_at, ta_active.scheduled_at) AS current_since
FROM "Users" u
LEFT JOIN "Technicians_Details" td ON td.technician_id = u.id
LEFT JOIN LATERAL (
  SELECT ta.*
  FROM "Technician_Assignments" ta
  WHERE ta.technician_id = u.id
    AND ta.status IN ('assigned','in_transit','on_site')
    AND ta.finished_at IS NULL
  ORDER BY COALESCE(ta.started_at, ta.scheduled_at) DESC
  LIMIT 1
) ta_active ON true
WHERE u.role = 'Técnico';

-- 7) Función de conflicto básica por instante (ventana configurable en minutos)
CREATE OR REPLACE FUNCTION check_technician_conflict(
  p_technician_id varchar,
  p_at timestamptz,
  p_window_minutes int DEFAULT 120
) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "Technician_Assignments" ta
    WHERE ta.technician_id = p_technician_id
      AND ta.status IN ('assigned','in_transit','on_site')
      AND ta.finished_at IS NULL
      AND abs(extract(epoch from (COALESCE(ta.scheduled_at, ta.started_at) - p_at))) <= (p_window_minutes * 60)
  );
$$ LANGUAGE sql STABLE;


