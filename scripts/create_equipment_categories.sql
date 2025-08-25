-- Script para crear la tabla de categorías de equipos con orden de prioridad
-- Este script implementa la FASE 1.4 del plan de implementación

-- Crear tabla de categorías de equipos
CREATE TABLE IF NOT EXISTS EquipmentCategories (
    id SERIAL PRIMARY KEY,
    category_key VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    icon VARCHAR(50) NOT NULL DEFAULT 'box',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar las categorías con el orden de prioridad definido
INSERT INTO EquipmentCategories (category_key, display_name, sort_order, color, icon, description) VALUES
    ('equipo', 'Equipo', 1, '#3B82F6', 'monitor', 'Equipos médicos principales como monitores, consolas y generadores'),
    ('instrumental', 'Instrumental', 2, '#10B981', 'scissors', 'Instrumentos quirúrgicos como pinzas, tijeras y agujas'),
    ('consumibles', 'Consumibles', 3, '#F59E0B', 'package', 'Productos de un solo uso como fibras láser y catéteres'),
    ('complementos', 'Complementos', 4, '#8B5CF6', 'plus-circle', 'Productos complementarios como endo catch y clips')
ON CONFLICT (category_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    sort_order = EXCLUDED.sort_order,
    color = EXCLUDED.color,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Crear índice para optimizar consultas por orden
CREATE INDEX IF NOT EXISTS idx_equipment_categories_sort_order ON EquipmentCategories(sort_order);

-- Crear índice para optimizar consultas por clave de categoría
CREATE INDEX IF NOT EXISTS idx_equipment_categories_key ON EquipmentCategories(category_key);

-- Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar timestamp automáticamente
CREATE TRIGGER update_equipment_categories_updated_at 
    BEFORE UPDATE ON EquipmentCategories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar la inserción
SELECT 
    category_key,
    display_name,
    sort_order,
    color,
    icon,
    description
FROM EquipmentCategories 
ORDER BY sort_order;
