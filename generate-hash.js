import bcrypt from 'bcrypt';

// Generar hash para la contraseña 'Kolbi900'
const password = 'Kolbi900';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Hash para "Kolbi900":');
        console.log(hash);
        
        // Verificar que el hash funciona
        bcrypt.compare(password, hash, function(err, result) {
            console.log('Verificación:', result); // Should be true
        });
    }
});

console.log('Generando hash...');
