-- Script de prueba para verificar el sistema de paquetes
-- Este script implementa la FASE 1.4 del plan de implementación

-- 1. Verificar que la tabla EquipmentCategories se creó correctamente
SELECT 'Verificando tabla EquipmentCategories...' as test_step;

SELECT 
    id,
    category_key,
    display_name,
    sort_order,
    color,
    icon,
    description
FROM EquipmentCategories 
ORDER BY sort_order;

-- 2. Verificar que las vistas se crearon correctamente
SELECT 'Verificando vista PackageProducts...' as test_step;

SELECT 
    procedure_id,
    procedure_name,
    category,
    category_display,
    category_sort_order,
    COUNT(*) as product_count
FROM PackageProducts 
GROUP BY 
    procedure_id, 
    procedure_name, 
    category, 
    category_display, 
    category_sort_order
ORDER BY 
    procedure_id, 
    category_sort_order
LIMIT 10;

-- 3. Verificar que la vista PackageSummary funciona
SELECT 'Verificando vista PackageSummary...' as test_step;

SELECT * FROM PackageSummary 
WHERE procedure_id = 'PROC-APENDICECTOMIA'
ORDER BY category_sort_order;

-- 4. Probar la función GetProcedurePackages
SELECT 'Probando función GetProcedurePackages...' as test_step;

SELECT * FROM GetProcedurePackages('PROC-APENDICECTOMIA');

-- 5. Probar la función GetPackageProducts para diferentes categorías
SELECT 'Probando función GetPackageProducts para equipo...' as test_step;

SELECT * FROM GetPackageProducts('PROC-APENDICECTOMIA', 'equipo');

SELECT 'Probando función GetPackageProducts para instrumental...' as test_step;

SELECT * FROM GetPackageProducts('PROC-APENDICECTOMIA', 'instrumental');

SELECT 'Probando función GetPackageProducts para consumibles...' as test_step;

SELECT * FROM GetPackageProducts('PROC-APENDICECTOMIA', 'consumibles');

SELECT 'Probando función GetPackageProducts para complementos...' as test_step;

SELECT * FROM GetPackageProducts('PROC-APENDICECTOMIA', 'complementos');

-- 6. Verificar el orden correcto de categorías
SELECT 'Verificando orden de categorías...' as test_step;

SELECT 
    'Orden esperado: Equipo(1) -> Instrumental(2) -> Consumibles(3) -> Complementos(4)' as expected_order;

SELECT 
    procedure_id,
    procedure_name,
    category,
    category_display,
    category_sort_order,
    product_count,
    total_quantity,
    total_value
FROM PackageSummary 
WHERE procedure_id = 'PROC-APENDICECTOMIA'
ORDER BY category_sort_order;

-- 7. Verificar que todos los procedimientos tienen productos en todas las categorías
SELECT 'Verificando cobertura de categorías por procedimiento...' as test_step;

SELECT 
    procedure_id,
    procedure_name,
    COUNT(DISTINCT category) as categories_count,
    STRING_AGG(category, ', ' ORDER BY category_sort_order) as categories
FROM PackageSummary 
GROUP BY procedure_id, procedure_name
HAVING COUNT(DISTINCT category) < 4
ORDER BY categories_count DESC;

-- 8. Verificar estadísticas generales
SELECT 'Estadísticas generales del sistema...' as test_step;

SELECT 
    COUNT(DISTINCT procedure_id) as total_procedures,
    COUNT(DISTINCT product_id) as total_products,
    COUNT(*) as total_template_items,
    AVG(product_count) as avg_products_per_category
FROM PackageSummary;

-- 9. Verificar que no hay categorías duplicadas o inconsistentes
SELECT 'Verificando consistencia de categorías...' as test_step;

SELECT 
    category,
    COUNT(*) as count,
    COUNT(DISTINCT procedure_id) as procedures_count
FROM Templates 
GROUP BY category 
ORDER BY count DESC;

-- 10. Resumen final de la implementación
SELECT 'RESUMEN DE IMPLEMENTACIÓN FASE 1' as summary_header;

SELECT 
    '✅ Tabla EquipmentCategories creada' as status,
    COUNT(*) as categories_count
FROM EquipmentCategories
UNION ALL
SELECT 
    '✅ Vista PackageProducts creada' as status,
    COUNT(DISTINCT procedure_id) as procedures_count
FROM PackageProducts
UNION ALL
SELECT 
    '✅ Vista PackageSummary creada' as status,
    COUNT(DISTINCT procedure_id) as procedures_count
FROM PackageSummary
UNION ALL
SELECT 
    '✅ Función GetProcedurePackages creada' as status,
    1 as function_count
UNION ALL
SELECT 
    '✅ Función GetPackageProducts creada' as status,
    1 as function_count;
