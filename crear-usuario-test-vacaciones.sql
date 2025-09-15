-- Script para crear usuario de prueba para testing de vacaciones

-- 1. Verificar si el usuario ya existe
SELECT id, username, rol, activo FROM usuarios WHERE username = 'testvacaciones';

-- 2. Crear el empleado primero con cédula fácil de identificar
INSERT INTO empleados (
    id, 
    nombre, 
    apellidos, 
    correo, 
    telefono, 
    direccion, 
    fecha_nacimiento, 
    fecha_contratacion, 
    activo,
    genero_id,
    estado_civil_id,
    nacionalidad_id,
    departamento_id,
    puesto_id,
    salario_base
) VALUES (
    '123456789', -- Cédula fácil de identificar
    'Test', 
    'Vacaciones', 
    'test.vacaciones@infinihr.com', 
    '555-1234', 
    'San José, Costa Rica', 
    '1985-03-10', 
    '2024-09-01', 
    true,
    1, -- Masculino
    1, -- Soltero  
    88, -- Costarricense
    3, -- Tecnología
    3, -- Desarrollador Senior
    45000.00
) ON CONFLICT (id) DO NOTHING;

-- 3. Crear el usuario vinculado al empleado
INSERT INTO usuarios (
    username, 
    password, 
    email, 
    rol, 
    activo,
    empleado_cedula
) VALUES (
    'testvacaciones', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Hash para 'password'
    'test.vacaciones@infinihr.com', 
    'empleado', 
    true,
    '123456789'  -- Vinculado con la cédula del empleado
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    activo = EXCLUDED.activo,
    empleado_cedula = EXCLUDED.empleado_cedula;

-- 4. Verificar que se creó correctamente
SELECT u.id, u.username, u.email, u.rol, u.activo, u.empleado_cedula, 
       e.nombre, e.apellidos
FROM usuarios u 
LEFT JOIN empleados e ON u.empleado_cedula = e.id 
WHERE u.username = 'testvacaciones';

-- 5. Opcional: Crear algunas vacaciones de prueba para este empleado
INSERT INTO vacaciones (
    empleado_id,
    fecha_inicio,
    fecha_fin,
    dias,
    estado,
    motivo
) VALUES 
(
    '123456789',  -- Cédula del empleado de prueba
    '2024-12-20',
    '2024-12-31',
    10,
    'Pendiente',
    'Vacaciones de fin de año'
),
(
    '123456789',  -- Cédula del empleado de prueba
    '2024-11-01',
    '2024-11-05',
    5,
    'Aprobado',
    'Vacaciones cortas'
) ON CONFLICT DO NOTHING;

-- 6. Verificar las vacaciones creadas
SELECT * FROM vacaciones WHERE empleado_id = '123456789';

-- Credenciales del usuario:
-- Username: testvacaciones
-- Password: password
-- Cédula: 123456789