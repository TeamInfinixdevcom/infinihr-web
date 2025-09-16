-- Script para cambiar el rol de rumadr a ADMIN
UPDATE usuarios SET rol = 'ADMIN' WHERE username = 'rumadr';

-- Verificar el cambio
SELECT id, username, email, rol, activo FROM usuarios WHERE username = 'rumadr';