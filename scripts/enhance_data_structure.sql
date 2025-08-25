-- Script para mejorar la estructura de datos y preparar integración con frontend
-- Este script implementa la FASE 2 del plan de implementación

-- ============================================================================
-- MEJORAS EN LA ESTRUCTURA DE DATOS
-- ============================================================================

-- Agregar campos de auditoría si no existen
DO $$
BEGIN
    -- Agregar campo created_at si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'templates' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE Templates ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Campo created_at agregado a la tabla Templates';
    END IF;
    
    -- Agregar campo updated_at si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'templates' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE Templates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Campo updated_at agregado a la tabla Templates';
    END IF;
END $$;

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS update_templates_updated_at_trigger ON Templates;
CREATE TRIGGER update_templates_updated_at_trigger
    BEFORE UPDATE ON Templates
    FOR EACH ROW
    EXECUTE FUNCTION update_templates_updated_at();

-- ============================================================================
-- TABLA DE CONFIGURACIÓN DE PAQUETES
-- ============================================================================

-- Crear tabla para configuración de paquetes
CREATE TABLE IF NOT EXISTS PackageConfiguration (
    id SERIAL PRIMARY KEY,
    procedure_id VARCHAR NOT NULL,
    surgery_type_id VARCHAR NOT NULL,
    package_name VARCHAR(200) NOT NULL,
    package_description TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (procedure_id) REFERENCES Procedures(id),
    FOREIGN KEY (surgery_type_id) REFERENCES SurgeryTypes(id)
);

-- Crear índices para PackageConfiguration
CREATE INDEX IF NOT EXISTS idx_package_config_procedure ON PackageConfiguration(procedure_id);
CREATE INDEX IF NOT EXISTS idx_package_config_surgery_type ON PackageConfiguration(surgery_type_id);
CREATE INDEX IF NOT EXISTS idx_package_config_active ON PackageConfiguration(is_active);
CREATE INDEX IF NOT EXISTS idx_package_config_priority ON PackageConfiguration(priority);

-- Insertar configuraciones de paquetes para procedimientos existentes
INSERT INTO PackageConfiguration (procedure_id, surgery_type_id, package_name, package_description, priority)
SELECT DISTINCT
    t.procedure_id,
    p.surgery_type_id,
    CONCAT('Paquete ', ec.display_name, ' - ', p.name) as package_name,
    CONCAT('Paquete predefinido para procedimiento ', p.name, ' - ', ec.display_name) as package_description,
    ec.sort_order as priority
FROM Templates t
JOIN Procedures p ON t.procedure_id = p.id
JOIN EquipmentCategories ec ON t.category = ec.category_key
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TABLA DE HISTORIAL DE CAMBIOS EN PAQUETES
-- ============================================================================

-- Crear tabla para auditoría de cambios en paquetes
CREATE TABLE IF NOT EXISTS PackageChangeHistory (
    id SERIAL PRIMARY KEY,
    package_config_id INTEGER,
    procedure_id VARCHAR NOT NULL,
    category VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'added', 'removed', 'modified', 'quantity_changed'
    product_id VARCHAR NOT NULL,
    old_quantity INTEGER,
    new_quantity INTEGER,
    old_price NUMERIC,
    new_price NUMERIC,
    changed_by VARCHAR(100),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_config_id) REFERENCES PackageConfiguration(id),
    FOREIGN KEY (procedure_id) REFERENCES Procedures(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Crear índices para PackageChangeHistory
CREATE INDEX IF NOT EXISTS idx_package_history_procedure ON PackageChangeHistory(procedure_id);
CREATE INDEX IF NOT EXISTS idx_package_history_category ON PackageChangeHistory(category);
CREATE INDEX IF NOT EXISTS idx_package_history_action ON PackageChangeHistory(action);
CREATE INDEX IF NOT EXISTS idx_package_history_changed_at ON PackageChangeHistory(changed_at);

-- ============================================================================
-- FUNCIONES DE GESTIÓN DE PAQUETES
-- ============================================================================

-- Función para obtener configuración completa de paquetes por procedimiento
CREATE OR REPLACE FUNCTION GetPackageConfiguration(procedure_id_param VARCHAR)
RETURNS TABLE (
    package_config_id INTEGER,
    procedure_id VARCHAR,
    surgery_type_id VARCHAR,
    package_name VARCHAR,
    package_description TEXT,
    is_active BOOLEAN,
    priority INTEGER,
    category VARCHAR,
    category_display VARCHAR,
    category_sort_order INTEGER,
    category_color VARCHAR,
    category_icon VARCHAR,
    product_count BIGINT,
    total_quantity BIGINT,
    total_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id as package_config_id,
        pc.procedure_id,
        pc.surgery_type_id,
        pc.package_name,
        pc.package_description,
        pc.is_active,
        pc.priority,
        ps.category,
        ps.category_display,
        ps.category_sort_order,
        ps.category_color,
        ps.category_icon,
        ps.product_count,
        ps.total_quantity,
        ps.total_value
    FROM PackageConfiguration pc
    JOIN PackageSummaryOptimized ps ON pc.procedure_id = ps.procedure_id
    WHERE pc.procedure_id = procedure_id_param
    AND pc.is_active = true
    ORDER BY ps.category_sort_order;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar cambios en paquetes
CREATE OR REPLACE FUNCTION LogPackageChange(
    procedure_id_param VARCHAR,
    category_param VARCHAR,
    action_param VARCHAR,
    product_id_param VARCHAR,
    old_quantity_param INTEGER DEFAULT NULL,
    new_quantity_param INTEGER DEFAULT NULL,
    old_price_param NUMERIC DEFAULT NULL,
    new_price_param NUMERIC DEFAULT NULL,
    changed_by_param VARCHAR DEFAULT NULL,
    change_reason_param TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    change_id INTEGER;
    package_config_id_param INTEGER;
BEGIN
    -- Obtener el ID de configuración del paquete
    SELECT id INTO package_config_id_param
    FROM PackageConfiguration
    WHERE procedure_id = procedure_id_param
    LIMIT 1;
    
    -- Insertar el registro de cambio
    INSERT INTO PackageChangeHistory (
        package_config_id,
        procedure_id,
        category,
        action,
        product_id,
        old_quantity,
        new_quantity,
        old_price,
        new_price,
        changed_by,
        change_reason
    ) VALUES (
        package_config_id_param,
        procedure_id_param,
        category_param,
        action_param,
        product_id_param,
        old_quantity_param,
        new_quantity_param,
        old_price_param,
        new_price_param,
        changed_by_param,
        change_reason_param
    ) RETURNING id INTO change_id;
    
    RETURN change_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener historial de cambios de un paquete
CREATE OR REPLACE FUNCTION GetPackageChangeHistory(
    procedure_id_param VARCHAR,
    category_param VARCHAR DEFAULT NULL,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    action VARCHAR,
    product_name VARCHAR,
    old_quantity INTEGER,
    new_quantity INTEGER,
    old_price NUMERIC,
    new_price NUMERIC,
    changed_by VARCHAR,
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pch.action,
        pr.name as product_name,
        pch.old_quantity,
        pch.new_quantity,
        pch.old_price,
        pch.new_price,
        pch.changed_by,
        pch.change_reason,
        pch.changed_at
    FROM PackageChangeHistory pch
    JOIN Products pr ON pch.product_id = pr.id
    WHERE pch.procedure_id = procedure_id_param
    AND (category_param IS NULL OR pch.category = category_param)
    AND pch.changed_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * days_back
    ORDER BY pch.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIONES DE ANÁLISIS Y REPORTES
-- ============================================================================

-- Función para obtener estadísticas de uso de paquetes
CREATE OR REPLACE FUNCTION GetPackageUsageStats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    procedure_id VARCHAR,
    procedure_name VARCHAR,
    surgery_type VARCHAR,
    category VARCHAR,
    category_display VARCHAR,
    product_count BIGINT,
    total_quantity BIGINT,
    total_value NUMERIC,
    last_modified TIMESTAMP WITH TIME ZONE,
    change_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.procedure_id,
        ps.procedure_name,
        ps.surgery_type_name as surgery_type,
        ps.category,
        ps.category_display,
        ps.product_count,
        ps.total_quantity,
        ps.total_value,
        ps.last_updated as last_modified,
        COALESCE(ch.change_count, 0) as change_count
    FROM PackageSummaryOptimized ps
    LEFT JOIN (
        SELECT 
            procedure_id,
            category,
            COUNT(*) as change_count
        FROM PackageChangeHistory
        WHERE changed_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * days_back
        GROUP BY procedure_id, category
    ) ch ON ps.procedure_id = ch.procedure_id AND ps.category = ch.category
    ORDER BY ps.procedure_name, ps.category_sort_order;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener productos más utilizados en paquetes
CREATE OR REPLACE FUNCTION GetMostUsedProductsInPackages(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    product_id VARCHAR,
    product_name VARCHAR,
    product_brand VARCHAR,
    category VARCHAR,
    usage_count BIGINT,
    total_quantity BIGINT,
    avg_price NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.product_id,
        pp.product_name,
        pp.product_brand,
        pp.category,
        COUNT(DISTINCT pp.procedure_id) as usage_count,
        SUM(pp.quantity) as total_quantity,
        AVG(pp.price) as avg_price
    FROM PackageProductsOptimized pp
    GROUP BY pp.product_id, pp.product_name, pp.product_brand, pp.category
    ORDER BY usage_count DESC, total_quantity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICACIÓN DE MEJORAS IMPLEMENTADAS
-- ============================================================================

-- Verificar que las nuevas tablas se crearon correctamente
SELECT 'Verificando tabla PackageConfiguration...' as test_step;
SELECT COUNT(*) as total_configs FROM PackageConfiguration;

SELECT 'Verificando tabla PackageChangeHistory...' as test_step;
SELECT COUNT(*) as total_changes FROM PackageChangeHistory;

-- Verificar que las nuevas funciones funcionan
SELECT 'Probando función GetPackageConfiguration...' as test_step;
SELECT * FROM GetPackageConfiguration('PROC-APENDICECTOMIA') LIMIT 5;

SELECT 'Probando función GetPackageUsageStats...' as test_step;
SELECT * FROM GetPackageUsageStats(30) LIMIT 5;

SELECT 'Probando función GetMostUsedProductsInPackages...' as test_step;
SELECT * FROM GetMostUsedProductsInPackages(10);

-- Verificar triggers y campos de auditoría
SELECT 'Verificando triggers...' as test_step;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'templates';

-- Verificar campos de auditoría
SELECT 'Verificando campos de auditoría...' as test_step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'templates' 
AND column_name IN ('created_at', 'updated_at', 'sort_order')
ORDER BY column_name;
