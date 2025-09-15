import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

// Configuración de la base de datos (basada en application.properties)
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'infinihr_db',
  user: 'postgres',
  password: '123',
});

async function ejecutarScript() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    // Leer el script SQL
    const sqlScript = fs.readFileSync('crear-usuario-mariela.sql', 'utf8');
    
    // Dividir el script en statements individuales, ignorando comentarios
    const statements = sqlScript
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 Ejecutando ${statements.length} statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        if (statement.toLowerCase().includes('select')) {
          console.log(`\n🔍 Query ${i + 1}:`);
          const result = await client.query(statement);
          console.table(result.rows);
        } else {
          console.log(`\n⚡ Ejecutando statement ${i + 1}...`);
          console.log('📝 SQL:', statement.substring(0, 100) + '...');
          const result = await client.query(statement);
          console.log(`✅ Filas afectadas: ${result.rowCount || 0}`);
        }
      } catch (error) {
        console.error(`❌ Error en statement ${i + 1}:`, error.message);
        // Continuar con el siguiente statement
      }
    }

    console.log('\n🎉 Script ejecutado!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    console.log('🔌 Cerrando conexión...');
    await client.end();
  }
}

ejecutarScript();