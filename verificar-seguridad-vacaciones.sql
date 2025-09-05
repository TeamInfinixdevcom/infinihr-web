-- Script para verificar el problema de seguridad en la base de datos
-- Ejecutar en PostgreSQL

-- 1. Ver todas las vacaciones por empleado
SELECT 
    empleado_id,
    COUNT(*) as total_vacaciones,
    array_agg(id ORDER BY id) as vacation_ids
FROM vacaciones 
GROUP BY empleado_id
ORDER BY empleado_id;

-- 2. Verificar empleados existentes
SELECT id, username, nombre FROM empleados ORDER BY id;

-- 3. Ver vacaciones específicas de Juan Pérez
SELECT 
    id,
    empleado_id,
    fecha_inicio,
    fecha_fin,
    estado,
    motivo,
    fecha_aprobacion
FROM vacaciones 
WHERE empleado_id = '201234567'
ORDER BY id;

-- 4. Ver vacaciones específicas de Ana Mora  
SELECT 
    id,
    empleado_id,
    fecha_inicio,
    fecha_fin,
    estado,
    motivo,
    fecha_aprobacion
FROM vacaciones 
WHERE empleado_id = '301234568'
ORDER BY id;
