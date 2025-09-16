// Test directo de conexión al backend
async function testBackendConnection() {
    console.log('🔍 === TEST DE CONEXIÓN AL BACKEND ===');
    
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const rol = localStorage.getItem('rol');
    
    console.log('📋 Datos locales:');
    console.log('  Token:', token ? `${token.substring(0, 50)}...` : 'NO HAY TOKEN');
    console.log('  Username:', username || 'NO HAY USERNAME');
    console.log('  Rol:', rol || 'NO HAY ROL');
    
    if (!token) {
        console.error('❌ No hay token para probar');
        return;
    }
    
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Test 1: Verificar si el backend está funcionando
    console.log('\n🧪 Test 1: Ping al backend...');
    try {
        const response = await fetch('http://localhost:8082/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        const data = await response.text();
        console.log('Response body:', data);
    } catch (error) {
        console.error('❌ Error conectando al backend:', error);
    }
    
    // Test 2: Probar endpoint de usuarios
    console.log('\n🧪 Test 2: GET /api/usuarios...');
    try {
        const response = await fetch('http://localhost:8082/api/usuarios', {
            method: 'GET',
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response status:', response.status);
        if (response.status === 403) {
            console.log('❌ 403 Forbidden - confirmado problema de permisos');
        }
        const data = await response.text();
        console.log('Response body:', data.substring(0, 200) + '...');
    } catch (error) {
        console.error('❌ Error:', error);
    }
    
    console.log('\n🔍 === FIN TEST ===');
}

// Ejecutar el test
testBackendConnection();