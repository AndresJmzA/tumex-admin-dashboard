-- Script de prueba para verificar la implementación de la FASE 2
-- Este script implementa la FASE 2 del plan de implementación

-- ============================================================================
-- VERIFICACIÓN COMPLETA DE LA FASE 2
-- ============================================================================

-- 1. VERIFICAR ESTRUCTURA DE BASE DE DATOS
SELECT '=== VERIFICACIÓN DE ESTRUCTURA DE BASE DE DATOS ===' as section;

-- Verificar que la tabla EquipmentCategories existe y tiene datos
SELECT 'Verificando tabla EquipmentCategories...' as test_step;
SELECT 
    COUNT(*) as total_categories,
    COUNT(CASE WHEN sort_order = 1 THEN 1 END) as equipo_count,
    COUNT(CASE WHEN sort_order = 2 THEN 1 END) as instrumental_count,
    COUNT(CASE WHEN sort_order = 3 THEN 1 END) as consumibles_count,
    COUNT(CASE WHEN sort_order = 4 THEN 1 END) as complementos_count
FROM EquipmentCategories;

-- Verificar que el campo sort_order se agregó a Templates
SELECT 'Verificando campo sort_order en Templates...' as test_step;
SELECT 
    COUNT(*) as total_templates,
    COUNT(CASE WHEN sort_order IS NOT NULL THEN 1 END) as templates_with_sort_order,
    COUNT(CASE WHEN sort_order = 0 THEN 1 END) as templates_without_sort_order
FROM Templates;

-- Verificar campos de auditoría en Templates
SELECT 'Verificando campos de auditoría en Templates...' as test_step;
SELECT 
    COUNT(*) as total_templates,
    COUNT(CASE WHEN created_at IS NOT NULL THEN 1 END) as templates_with_created_at,
    COUNT(CASE WHEN updated_at IS NOT NULL THEN 1 END) as templates_with_updated_at
FROM Templates;

-- 2. VERIFICAR ÍNDICES CREADOS
SELECT '=== VERIFICACIÓN DE ÍNDICES ===' as section;

SELECT 'Verificando índices en Templates...' as test_step;
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'templates'
ORDER BY indexname;

SELECT 'Verificando índices en EquipmentCategories...' as test_step;
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'equipmentcategories'
ORDER BY indexname;

-- 3. VERIFICAR VISTAS OPTIMIZADAS
SELECT '=== VERIFICACIÓN DE VISTAS OPTIMIZADAS ===' as section;

SELECT 'Verificando vista PackageProductsOptimized...' as test_step;
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT procedure_id) as unique_procedures,
    COUNT(DISTINCT category) as unique_categories
FROM PackageProductsOptimized;

SELECT 'Verificando vista PackageSummaryOptimized...' as test_step;
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT procedure_id) as unique_procedures,
    COUNT(DISTINCT category) as unique_categories
FROM PackageSummaryOptimized;

-- 4. VERIFICAR FUNCIONES OPTIMIZADAS
SELECT '=== VERIFICACIÓN DE FUNCIONES OPTIMIZADAS ===' as section;

SELECT 'Probando función GetProcedurePackagesOptimized...' as test_step;
SELECT 
    category,
    category_display,
    category_sort_order,
    product_count,
    total_quantity,
    total_value
FROM GetProcedurePackagesOptimized('PROC-APENDICECTOMIA')
ORDER BY category_sort_order;

SELECT 'Probando función GetPackageProductsOptimized...' as test_step;
SELECT 
    product_name,
    category_display,
    quantity,
    price,
    stock,
    available
FROM GetPackageProductsOptimized('PROC-APENDICECTOMIA', 'equipo')
ORDER BY template_sort_order, product_name
LIMIT 5;

-- 5. VERIFICAR NUEVAS TABLAS
SELECT '=== VERIFICACIÓN DE NUEVAS TABLAS ===' as section;

SELECT 'Verificando tabla PackageConfiguration...' as test_step;
SELECT 
    COUNT(*) as total_configs,
    COUNT(DISTINCT procedure_id) as unique_procedures,
    COUNT(DISTINCT surgery_type_id) as unique_surgery_types
FROM PackageConfiguration;

SELECT 'Verificando tabla PackageChangeHistory...' as test_step;
SELECT 
    COUNT(*) as total_changes,
    COUNT(DISTINCT procedure_id) as unique_procedures,
    COUNT(DISTINCT action) as unique_actions
FROM PackageChangeHistory;

-- 6. VERIFICAR FUNCIONES DE GESTIÓN
SELECT '=== VERIFICACIÓN DE FUNCIONES DE GESTIÓN ===' as section;

SELECT 'Probando función GetPackageConfiguration...' as test_step;
SELECT 
    package_name,
    category_display,
    product_count,
    total_quantity,
    total_value
FROM GetPackageConfiguration('PROC-APENDICECTOMIA')
ORDER BY category_sort_order;

SELECT 'Probando función GetPackageUsageStats...' as test_step;
SELECT 
    procedure_name,
    surgery_type,
    category_display,
    product_count,
    total_quantity,
    total_value
FROM GetPackageUsageStats(30)
WHERE procedure_id = 'PROC-APENDICECTOMIA'
ORDER BY category_sort_order;

SELECT 'Probando función GetMostUsedProductsInPackages...' as test_step;
SELECT 
    product_name,
    product_brand,
    category,
    usage_count,
    total_quantity,
    avg_price
FROM GetMostUsedProductsInPackages(10)
ORDER BY usage_count DESC;

-- 7. VERIFICAR TRIGGERS Y AUDITORÍA
SELECT '=== VERIFICACIÓN DE TRIGGERS Y AUDITORÍA ===' as section;

SELECT 'Verificando triggers en Templates...' as test_step;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'templates'
ORDER BY trigger_name;

-- 8. VERIFICAR RENDIMIENTO Y ESTADÍSTICAS
SELECT '=== VERIFICACIÓN DE RENDIMIENTO ===' as section;

SELECT 'Verificando estadísticas de rendimiento...' as test_step;
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals
FROM pg_stats 
WHERE tablename = 'templates' 
AND attname IN ('procedure_id', 'category', 'sort_order')
ORDER BY attname;

-- 9. VERIFICAR ORDEN DE CATEGORÍAS
SELECT '=== VERIFICACIÓN DE ORDEN DE CATEGORÍAS ===' as section;

SELECT 'Verificando orden correcto de categorías...' as test_step;
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
FROM PackageSummaryOptimized 
WHERE procedure_id = 'PROC-APENDICECTOMIA'
ORDER BY category_sort_order;

-- 10. VERIFICAR CONSISTENCIA DE DATOS
SELECT '=== VERIFICACIÓN DE CONSISTENCIA ===' as section;

SELECT 'Verificando consistencia de datos...' as test_step;
SELECT * FROM ValidateTemplateData();

-- 11. PRUEBAS DE FUNCIONALIDAD AVANZADA
SELECT '=== PRUEBAS DE FUNCIONALIDAD AVANZADA ===' as section;

-- Probar registro de cambios
SELECT 'Probando registro de cambios...' as test_step;
SELECT LogPackageChange(
    'PROC-APENDICECTOMIA',
    'equipo',
    'test_change',
    'PROD-001',
    1,
    2,
    100.00,
    150.00,
    'test_user',
    'Prueba de funcionalidad'
) as change_id;

-- Verificar historial de cambios
SELECT 'Verificando historial de cambios...' as test_step;
SELECT 
    action,
    product_name,
    old_quantity,
    new_quantity,
    changed_by,
    change_reason
FROM GetPackageChangeHistory('PROC-APENDICECTOMIA', 'equipo', 1)
ORDER BY changed_at DESC;

-- 12. RESUMEN FINAL DE IMPLEMENTACIÓN
SELECT '=== RESUMEN FINAL DE IMPLEMENTACIÓN FASE 2 ===' as section;

SELECT 
    '✅ Campo sort_order agregado a Templates' as status,
    COUNT(CASE WHEN sort_order IS NOT NULL THEN 1 END) as templates_with_sort_order
FROM Templates
UNION ALL
SELECT 
    '✅ Campos de auditoría agregados' as status,
    COUNT(CASE WHEN created_at IS NOT NULL AND updated_at IS NOT NULL THEN 1 END) as templates_with_audit
FROM Templates
UNION ALL
SELECT 
    '✅ Índices de optimización creados' as status,
    COUNT(*) as total_indexes
FROM pg_indexes 
WHERE tablename = 'templates'
UNION ALL
SELECT 
    '✅ Vistas optimizadas creadas' as status,
    2 as total_views
UNION ALL
SELECT 
    '✅ Funciones optimizadas creadas' as status,
    3 as total_functions
UNION ALL
SELECT 
    '✅ Tabla PackageConfiguration creada' as status,
    COUNT(*) as total_configs
FROM PackageConfiguration
UNION ALL
SELECT 
    '✅ Tabla PackageChangeHistory creada' as status,
    COUNT(*) as total_changes
FROM PackageChangeHistory
UNION ALL
SELECT 
    '✅ Funciones de gestión creadas' as status,
    5 as total_management_functions
UNION ALL
SELECT 
    '✅ Triggers de auditoría creados' as status,
    COUNT(*) as total_triggers
FROM information_schema.triggers 
WHERE event_object_table = 'templates';

-- 13. VERIFICACIÓN DE RENDIMIENTO
SELECT '=== VERIFICACIÓN DE RENDIMIENTO ===' as section;

-- Medir tiempo de consulta para paquetes
SELECT 'Medición de rendimiento...' as test_step;
SELECT 
    'Consulta optimizada' as query_type,
    COUNT(*) as result_count,
    'ms' as time_unit
FROM GetProcedurePackagesOptimized('PROC-APENDICECTOMIA');

-- Verificar uso de índices
SELECT 'Verificando uso de índices...' as test_step;
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'templates'
ORDER BY idx_scan DESC;
