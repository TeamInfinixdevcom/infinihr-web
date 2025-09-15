    -- Script para crear el usuario rumadr en la base de datos

    -- 1. Primero verificar si el usuario ya existe
    SELECT id, username, rol, activo FROM usuarios WHERE username = 'rumadr';

    -- 2. Crear el empleado primero
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
        'rumadr-001', -- ID único como cédula
        'Rubén', 
        'Madrigal', 
        'rumadr@infinihr.com', 
        '555-0789', 
        'San José, Costa Rica', 
        '1990-05-15', 
        '2024-01-15', 
        true,
        1, -- Masculino
        1, -- Soltero  
        88, -- Costarricense
        3, -- Tecnología
        3, -- Desarrollador Senior
        55000.00
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
        'rumadr', 
        '$2a$10$vwRYNp6DxMpMPtGYD4rQtef.ZkqYkGJK0uBqOLR9DVA0XQc7QTp1G', -- Hash para 'Kolbi800*'
        'rumadr@infinihr.com', 
        'empleado', 
        true,
        'rumadr-001'
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
    WHERE u.username = 'rumadr';

    -- Comentario: El hash $2a$10$vwRYNp6DxMpMPtGYD4rQtef.ZkqYkGJK0uBqOLR9DVA0XQc7QTp1G corresponde a 'Kolbi800*'
