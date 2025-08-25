-- Script para optimizar la estructura de la base de datos
-- Este script implementa la FASE 2 del plan de implementación

-- ============================================================================
-- FASE 2.2: AGREGAR CAMPO SORT_ORDER A LA TABLA TEMPLATES
-- ============================================================================

-- Verificar si el campo sort_order ya existe en la tabla Templates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'templates' 
        AND column_name = 'sort_order'
    ) THEN
        -- Agregar campo sort_order si no existe
        ALTER TABLE Templates ADD COLUMN sort_order INTEGER DEFAULT 0;
        
        -- Actualizar el campo sort_order basado en la prioridad de categorías
        UPDATE Templates 
        SET sort_order = ec.sort_order
        FROM EquipmentCategories ec
        WHERE Templates.category = ec.category_key;
        
        RAISE NOTICE 'Campo sort_order agregado a la tabla Templates';
    ELSE
        RAISE NOTICE 'Campo sort_order ya existe en la tabla Templates';
    END IF;
END $$;

-- ============================================================================
-- FASE 2.3: CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================================================

-- Índice compuesto para consultas por procedimiento y categoría
CREATE INDEX IF NOT EXISTS idx_templates_procedure_category 
ON Templates(procedure_id, category, sort_order);

-- Índice para consultas por procedimiento
CREATE INDEX IF NOT EXISTS idx_templates_procedure 
ON Templates(procedure_id);

-- Índice para consultas por categoría
CREATE INDEX IF NOT EXISTS idx_templates_category 
ON Templates(category, sort_order);

-- Índice para consultas por producto
CREATE INDEX IF NOT EXISTS idx_templates_product 
ON Templates(product_id);

-- Índice para consultas por orden de prioridad
CREATE INDEX IF NOT EXISTS idx_templates_sort_order 
ON Templates(sort_order);

-- ============================================================================
-- OPTIMIZACIÓN DE VISTAS EXISTENTES
-- ============================================================================

-- Crear vista optimizada para paquetes con información completa
CREATE OR REPLACE VIEW PackageProductsOptimized AS
SELECT 
    t.procedure_id,
    p.name as procedure_name,
    p.surgery_type_id,
    st.name as surgery_type_name,
    t.category,
    ec.display_name as category_display,
    ec.sort_order as category_sort_order,
    ec.color as category_color,
    ec.icon as category_icon,
    t.product_id,
    pr.name as product_name,
    pr.description as product_description,
    pr.brand as product_brand,
    t.quantity,
    pr.price,
    pr.stock,
    pr.available,
    t.sort_order as template_sort_order,
    t.created_at as template_created_at,
    t.updated_at as template_updated_at
FROM Templates t
JOIN Procedures p ON t.procedure_id = p.id
JOIN SurgeryTypes st ON p.surgery_type_id = st.id
JOIN Products pr ON t.product_id = pr.id
JOIN EquipmentCategories ec ON t.category = ec.category_key
ORDER BY t.procedure_id, ec.sort_order, t.sort_order, pr.name;

-- Crear vista optimizada para resumen de paquetes
CREATE OR REPLACE VIEW PackageSummaryOptimized AS
SELECT 
    procedure_id,
    procedure_name,
    surgery_type_id,
    surgery_type_name,
    category,
    category_display,
    category_sort_order,
    category_color,
    category_icon,
    COUNT(*) as product_count,
    SUM(quantity) as total_quantity,
    SUM(quantity * price) as total_value,
    MIN(template_created_at) as first_added,
    MAX(template_updated_at) as last_updated
FROM PackageProductsOptimized
GROUP BY 
    procedure_id, 
    procedure_name, 
    surgery_type_id,
    surgery_type_name,
    category, 
    category_display, 
    category_sort_order, 
    category_color, 
    category_icon
ORDER BY 
    procedure_id, 
    category_sort_order;

-- ============================================================================
-- FUNCIONES OPTIMIZADAS
-- ============================================================================

-- Función optimizada para obtener paquetes por procedimiento
CREATE OR REPLACE FUNCTION GetProcedurePackagesOptimized(procedure_id_param VARCHAR)
RETURNS TABLE (
    category VARCHAR(50),
    category_display VARCHAR(100),
    category_sort_order INTEGER,
    category_color VARCHAR(7),
    category_icon VARCHAR(50),
    product_count BIGINT,
    total_quantity BIGINT,
    total_value NUMERIC,
    first_added TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE
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
        ps.total_value,
        ps.first_added,
        ps.last_updated
    FROM PackageSummaryOptimized ps
    WHERE ps.procedure_id = procedure_id_param
    ORDER BY ps.category_sort_order;
END;
$$ LANGUAGE plpgsql;

-- Función optimizada para obtener productos por procedimiento y categoría
CREATE OR REPLACE FUNCTION GetPackageProductsOptimized(
    procedure_id_param VARCHAR, 
    category_param VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    product_id VARCHAR,
    product_name VARCHAR,
    product_description TEXT,
    product_brand VARCHAR,
    quantity INTEGER,
    price NUMERIC,
    stock INTEGER,
    available BOOLEAN,
    category VARCHAR(50),
    category_display VARCHAR(100),
    category_sort_order INTEGER,
    category_color VARCHAR(7),
    category_icon VARCHAR(50),
    template_sort_order INTEGER,
    template_created_at TIMESTAMP WITH TIME ZONE,
    template_updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.product_id,
        pp.product_name,
        pp.product_description,
        pp.product_brand,
        pp.quantity,
        pp.price,
        pp.stock,
        pp.available,
        pp.category,
        pp.category_display,
        pp.category_sort_order,
        pp.category_color,
        pp.category_icon,
        pp.template_sort_order,
        pp.template_created_at,
        pp.template_updated_at
    FROM PackageProductsOptimized pp
    WHERE pp.procedure_id = procedure_id_param
    AND (category_param IS NULL OR pp.category = category_param)
    ORDER BY pp.category_sort_order, pp.template_sort_order, pp.product_name;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de paquetes por tipo de cirugía
CREATE OR REPLACE FUNCTION GetSurgeryTypePackages(surgery_type_id_param VARCHAR)
RETURNS TABLE (
    procedure_id VARCHAR,
    procedure_name VARCHAR,
    category VARCHAR(50),
    category_display VARCHAR(100),
    category_sort_order INTEGER,
    product_count BIGINT,
    total_quantity BIGINT,
    total_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.procedure_id,
        ps.procedure_name,
        ps.category,
        ps.category_display,
        ps.category_sort_order,
        ps.product_count,
        ps.total_quantity,
        ps.total_value
    FROM PackageSummaryOptimized ps
    WHERE ps.surgery_type_id = surgery_type_id_param
    ORDER BY ps.procedure_name, ps.category_sort_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIONES DE MANTENIMIENTO
-- ============================================================================

-- Función para actualizar sort_order de templates
CREATE OR REPLACE FUNCTION UpdateTemplateSortOrders()
RETURNS VOID AS $$
BEGIN
    UPDATE Templates 
    SET sort_order = ec.sort_order
    FROM EquipmentCategories ec
    WHERE Templates.category = ec.category_key;
    
    RAISE NOTICE 'Sort orders actualizados para % templates', (SELECT COUNT(*) FROM Templates);
END;
$$ LANGUAGE plpgsql;

-- Función para validar consistencia de datos
CREATE OR REPLACE FUNCTION ValidateTemplateData()
RETURNS TABLE (
    validation_type VARCHAR(100),
    message TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Categorías válidas'::VARCHAR as validation_type,
        'Templates con categorías válidas'::TEXT as message,
        COUNT(*)::BIGINT as count
    FROM Templates t
    JOIN EquipmentCategories ec ON t.category = ec.category_key
    
    UNION ALL
    
    SELECT 
        'Procedimientos válidos'::VARCHAR as validation_type,
        'Templates con procedimientos válidos'::TEXT as message,
        COUNT(*)::BIGINT as count
    FROM Templates t
    JOIN Procedures p ON t.procedure_id = p.id
    
    UNION ALL
    
    SELECT 
        'Productos válidos'::VARCHAR as validation_type,
        'Templates con productos válidos'::TEXT as message,
        COUNT(*)::BIGINT as count
    FROM Templates t
    JOIN Products pr ON t.product_id = pr.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICACIÓN DE IMPLEMENTACIÓN
-- ============================================================================

-- Verificar que los índices se crearon correctamente
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('templates', 'equipmentcategories')
ORDER BY tablename, indexname;

-- Verificar que las vistas optimizadas funcionan
SELECT 'Verificando vista PackageProductsOptimized...' as test_step;
SELECT COUNT(*) as total_records FROM PackageProductsOptimized;

SELECT 'Verificando vista PackageSummaryOptimized...' as test_step;
SELECT COUNT(*) as total_records FROM PackageSummaryOptimized;

-- Verificar que las funciones optimizadas funcionan
SELECT 'Probando función GetProcedurePackagesOptimized...' as test_step;
SELECT * FROM GetProcedurePackagesOptimized('PROC-APENDICECTOMIA') LIMIT 5;

-- Verificar estadísticas de rendimiento
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'templates' 
AND attname IN ('procedure_id', 'category', 'sort_order')
ORDER BY attname;
