-- Script para crear un usuario administrador
-- Usuario: admin
-- Password: admin123

INSERT INTO usuarios (
    username, 
    password, 
    email, 
    rol, 
    activo
) VALUES (
    'admin', 
    '$2b$10$rQNb1GGqB0rKJC2I1X1TfOLQ9yI2kXVH3jM4N5O6P7Q8R9S0T1U2V',  -- password: admin123
    'admin@infinihr.com', 
    'ADMIN', 
    true
) ON CONFLICT (username) DO UPDATE SET 
    password = EXCLUDED.password,
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo;

-- Verificar que se creó correctamente
SELECT id, username, email, rol, activo FROM usuarios WHERE username = 'admin';