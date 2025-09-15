-- Script para crear el usuario Mariela Sanchez Vargas (msanvar) en la base de datos

-- 1. Primero verificar si el usuario ya existe
SELECT id, username, rol, activo FROM usuarios WHERE username = 'msanvar';

-- 2. Crear el empleado primero
INSERT INTO empleados (
    id, 
    nombre, 
    apellidos, 
    correo, 
    telefono, 
    direccion, 
    fecha_nacimiento, 
    fecha_ingreso, 
    activo,
    genero_id,
    estado_civil_id,
    nacionalidad_id,
    departamento_id,
    puesto_id,
    salario_base,
    username
) VALUES (
    '115660143', -- Cédula como ID único
    'Mariela', 
    'Sanchez Vargas', 
    'msanvar@gmail.com', 
    '555-0123', 
    'Cartago, Costa Rica', 
    '1988-03-20', 
    '2024-01-01', 
    true,
    2, -- Femenino
    1, -- Soltero  
    88, -- Costarricense
    2, -- Recursos Humanos
    4, -- Analista de RRHH
    45000.00,
    'msanvar'
) ON CONFLICT (id) DO NOTHING;

-- 3. Crear el usuario vinculado al empleado
INSERT INTO usuarios (
    username, 
    password, 
    email, 
    rol, 
    activo,
    cedula
) VALUES (
    'msanvar', 
    '$2b$10$W2QHrB1d9uDll0B3c6829./WA23H4KZ2UExWsb.QQ6OMZYVPZx/de', -- Hash para 'Kolbi900'
    'msanvar@gmail.com', 
    'empleado', 
    true,
    '115660143'
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    activo = EXCLUDED.activo,
    cedula = EXCLUDED.cedula;

-- 4. Verificar que se creó correctamente
SELECT u.id, u.username, u.email, u.rol, u.activo, u.cedula, 
       e.nombre, e.apellidos
FROM usuarios u 
LEFT JOIN empleados e ON u.cedula = e.id 
WHERE u.username = 'msanvar';

-- 5. Crear algunas vacaciones de prueba para Mariela para poder verificar el filtrado
INSERT INTO vacaciones (
    empleado_id,
    fecha_inicio,
    fecha_fin,
    motivo,
    estado,
    fecha_aprobacion
) VALUES 
    ('115660143', '2024-12-23', '2024-12-30', 'Vacaciones navideñas', 'Aprobado', '2024-11-02 10:00:00'),
    ('115660143', '2025-03-15', '2025-03-22', 'Vacaciones familiares', 'Pendiente', NULL),
    ('115660143', '2025-07-01', '2025-07-15', 'Vacaciones de verano', 'Pendiente', NULL);

-- 6. Verificar las vacaciones creadas
SELECT v.id, v.empleado_id, v.fecha_inicio, v.fecha_fin, v.motivo, v.estado,
       e.nombre, e.apellidos
FROM vacaciones v
LEFT JOIN empleados e ON v.empleado_id = e.id
WHERE v.empleado_id = '115660143';

-- Comentario: 
-- Hash $2b$10$W2QHrB1d9uDll0B3c6829./WA23H4KZ2UExWsb.QQ6OMZYVPZx/de corresponde a 'Kolbi900'
-- Usuario: msanvar
-- Contraseña: Kolbi900
-- Empleado: Mariela Sanchez Vargas (cédula: 115660143)