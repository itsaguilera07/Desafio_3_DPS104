// crear-usuario.js
// Ejecuta este archivo UNA VEZ para crear el usuario admin
// Comando: node crear-usuario.js

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function crearUsuario() {
  try {
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Tu contraseña de MySQL (vacía si no tienes)
      database: 'inventario_db'
    });

    console.log('✅ Conectado a la base de datos');

    // Encriptar la contraseña
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar el usuario
    const [result] = await connection.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      ['admin', hashedPassword]
    );

    console.log('✅ Usuario creado exitosamente!');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log(`   ID: ${result.insertId}`);

    await connection.end();
    console.log('\n🎉 Ya puedes usar estas credenciales en la app móvil');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  El usuario "admin" ya existe en la base de datos');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

crearUsuario();