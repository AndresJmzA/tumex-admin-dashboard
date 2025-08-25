-- Script para normalizar las categorías en la tabla Templates
-- Este script implementa la FASE 1.4 del plan de implementación

-- Primero, vamos a analizar las categorías existentes y sus variaciones
SELECT 
    category,
    COUNT(*) as count,
    COUNT(DISTINCT procedure_id) as procedures_count
FROM Templates 
GROUP BY category 
ORDER BY count DESC;

-- Normalizar las categorías existentes para asegurar consistencia
-- Corregir 'consumibles' vs 'consumible' y estandarizar nombres
UPDATE Templates 
SET category = 'consumibles' 
WHERE category IN ('consumible', 'Consumible', 'CONSUMIBLES');

UPDATE Templates 
SET category = 'equipo' 
WHERE category IN ('Equipo', 'EQUIPO');

UPDATE Templates 
SET category = 'instrumental' 
WHERE category IN ('Instrumental', 'INSTRUMENTAL');

UPDATE Templates 
SET category = 'complementos' 
WHERE category IN ('Complementos', 'COMPLEMENTOS');

-- Verificar que todas las categorías estén normalizadas
SELECT 
    category,
    COUNT(*) as count
FROM Templates 
GROUP BY category 
ORDER BY count DESC;

-- Crear una vista para paquetes agrupados por procedimiento y categoría
CREATE OR REPLACE VIEW PackageProducts AS
SELECT 
    t.procedure_id,
    p.name as procedure_name,
    t.category,
    ec.display_name as category_display,
    ec.sort_order as category_sort_order,
    ec.color as category_color,
    ec.icon as category_icon,
    t.product_id,
    pr.name as product_name,
    pr.description as product_description,
    t.quantity,
    pr.price,
    pr.stock,
    pr.available
FROM Templates t
JOIN Procedures p ON t.procedure_id = p.id
JOIN Products pr ON t.product_id = pr.id
JOIN EquipmentCategories ec ON t.category = ec.category_key
ORDER BY t.procedure_id, ec.sort_order, pr.name;

-- Crear una vista para resumen de paquetes por procedimiento
CREATE OR REPLACE VIEW PackageSummary AS
SELECT 
    procedure_id,
    procedure_name,
    category,
    category_display,
    category_sort_order,
    category_color,
    category_icon,
    COUNT(*) as product_count,
    SUM(quantity) as total_quantity,
    SUM(quantity * price) as total_value
FROM PackageProducts
GROUP BY 
    procedure_id, 
    procedure_name, 
    category, 
    category_display, 
    category_sort_order, 
    category_color, 
    category_icon
ORDER BY 
    procedure_id, 
    category_sort_order;

-- Verificar la vista de resumen
SELECT * FROM PackageSummary LIMIT 20;

-- Crear función para obtener paquetes completos por procedimiento
CREATE OR REPLACE FUNCTION GetProcedurePackages(procedure_id_param VARCHAR)
RETURNS TABLE (
    category VARCHAR(50),
    category_display VARCHAR(100),
    category_sort_order INTEGER,
    category_color VARCHAR(7),
    category_icon VARCHAR(50),
    product_count BIGINT,
    total_quantity BIGINT,
    total_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.category,
        ps.category_display,
        ps.category_sort_order,
        ps.category_color,
        ps.category_icon,
        ps.product_count,
        ps.total_quantity,
        ps.total_value
    FROM PackageSummary ps
    WHERE ps.procedure_id = procedure_id_param
    ORDER BY ps.category_sort_order;
END;
$$ LANGUAGE plpgsql;

-- Crear función para obtener productos de un paquete por procedimiento y categoría
CREATE OR REPLACE FUNCTION GetPackageProducts(procedure_id_param VARCHAR, category_param VARCHAR DEFAULT NULL)
RETURNS TABLE (
    product_id VARCHAR,
    product_name VARCHAR,
    product_description TEXT,
    quantity INTEGER,
    price NUMERIC,
    stock INTEGER,
    available BOOLEAN,
    category VARCHAR(50),
    category_display VARCHAR(100),
    category_sort_order INTEGER,
    category_color VARCHAR(7),
    category_icon VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.product_id,
        pp.product_name,
        pp.product_description,
        pp.quantity,
        pp.price,
        pp.stock,
        pp.available,
        pp.category,
        pp.category_display,
        pp.category_sort_order,
        pp.category_color,
        pp.category_icon
    FROM PackageProducts pp
    WHERE pp.procedure_id = procedure_id_param
    AND (category_param IS NULL OR pp.category = category_param)
    ORDER BY pp.category_sort_order, pp.product_name;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso: Obtener paquetes para apendicectomía
SELECT * FROM GetProcedurePackages('PROC-APENDICECTOMIA');

-- Ejemplo de uso: Obtener productos de equipo para apendicectomía
SELECT * FROM GetPackageProducts('PROC-APENDICECTOMIA', 'equipo');
