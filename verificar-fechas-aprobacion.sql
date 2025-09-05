-- Script para verificar y arreglar las fechas de aprobación en la base de datos
-- Ejecutar este script en PostgreSQL

-- 1. Verificar estructura de la tabla vacaciones
\d+ vacaciones;

-- 2. Ver todas las vacaciones de Ana ANTES de la actualización
SELECT 
    id,
    empleado_id,
    fecha_inicio,
    fecha_fin,
    estado,
    motivo,
    fecha_aprobacion,
    CASE 
        WHEN fecha_aprobacion IS NULL THEN 'NULL'
        ELSE 'HAS_VALUE'
    END as fecha_status
FROM vacaciones 
WHERE empleado_id = '301234568'
ORDER BY id;

-- 3. ARREGLAR: Agregar fechas de aprobación a las vacaciones aprobadas/rechazadas
UPDATE vacaciones 
SET fecha_aprobacion = CASE 
    WHEN id = 12 THEN '2025-09-04 01:45:00'::timestamp
    WHEN id = 13 THEN '2025-09-03 01:45:00'::timestamp  
    WHEN id = 15 THEN '2025-09-01 01:45:00'::timestamp
    WHEN id = 16 THEN '2025-08-31 01:45:00'::timestamp
    WHEN id = 14 THEN '2025-08-30 10:30:00'::timestamp  -- Fecha de rechazo
END
WHERE empleado_id = '301234568' 
AND (estado = 'Aprobado' OR estado = 'Rechazado')
AND fecha_aprobacion IS NULL;

-- 4. Verificar después de la actualización
SELECT 
    id,
    empleado_id,
    fecha_inicio,
    fecha_fin,
    estado,
    motivo,
    fecha_aprobacion,
    CASE 
        WHEN fecha_aprobacion IS NULL THEN 'NULL'
        ELSE 'HAS_VALUE'
    END as fecha_status
FROM vacaciones 
WHERE empleado_id = '301234568'
ORDER BY id;

-- 5. Contar vacaciones por estado para Ana
SELECT 
    estado,
    COUNT(*) as cantidad,
    COUNT(fecha_aprobacion) as con_fecha_aprobacion
FROM vacaciones 
WHERE empleado_id = '301234568'
GROUP BY estado;
