-- Crear tabla Order_Equipment para equipos específicos de órdenes
CREATE TABLE IF NOT EXISTS "Order_Equipment" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_id" uuid NOT NULL REFERENCES "Orders"("id") ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "Products"("id"),
  "product_name" text NOT NULL,
  "category" text NOT NULL,
  "quantity" integer NOT NULL DEFAULT 1,
  "price" decimal(10,2) NOT NULL,
  "notes" text DEFAULT '',
  "confirmed" boolean DEFAULT false,
  "is_from_package" boolean DEFAULT false,
  "package_id" uuid REFERENCES "Equipment_Packages"("id"),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS "idx_order_equipment_order_id" ON "Order_Equipment"("order_id");
CREATE INDEX IF NOT EXISTS "idx_order_equipment_product_id" ON "Order_Equipment"("product_id");
CREATE INDEX IF NOT EXISTS "idx_order_equipment_package_id" ON "Order_Equipment"("package_id");
CREATE INDEX IF NOT EXISTS "idx_order_equipment_confirmed" ON "Order_Equipment"("confirmed");

-- Crear tabla Equipment_Packages para paquetes predefinidos
CREATE TABLE IF NOT EXISTS "Equipment_Packages" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" text NOT NULL,
  "description" text,
  "category" text NOT NULL,
  "price" decimal(10,2) NOT NULL,
  "equipment" jsonb NOT NULL DEFAULT '[]',
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- Crear índices para Equipment_Packages
CREATE INDEX IF NOT EXISTS "idx_equipment_packages_category" ON "Equipment_Packages"("category");

-- Insertar datos de ejemplo para Equipment_Packages
INSERT INTO "Equipment_Packages" ("name", "description", "category", "price", "equipment") VALUES
(
  'Paquete Cirugía General',
  'Equipos básicos para cirugía general',
  'Cirugía General',
  12000.00,
  '[
    {
      "product_id": "1",
      "product_name": "Monitor Multiparamétrico",
      "category": "Equipo",
      "quantity": 1,
      "price": 8500.00
    },
    {
      "product_id": "2", 
      "product_name": "Bomba de Infusión",
      "category": "Equipo",
      "quantity": 2,
      "price": 3500.00
    }
  ]'::jsonb
),
(
  'Paquete Cirugía Cardíaca',
  'Equipos especializados para cirugía cardíaca',
  'Cirugía Cardíaca',
  18500.00,
  '[
    {
      "product_id": "1",
      "product_name": "Monitor Multiparamétrico", 
      "category": "Equipo",
      "quantity": 1,
      "price": 8500.00
    },
    {
      "product_id": "3",
      "product_name": "Desfibrilador",
      "category": "Equipo", 
      "quantity": 1,
      "price": 12000.00
    }
  ]'::jsonb
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE "Order_Equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Equipment_Packages" ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad básicas (permitir todo por ahora)
CREATE POLICY "Allow all operations on Order_Equipment" ON "Order_Equipment" FOR ALL USING (true);
CREATE POLICY "Allow all operations on Equipment_Packages" ON "Equipment_Packages" FOR ALL USING (true); 