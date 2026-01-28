#!/usr/bin/env node

/**
 * Script para crear usuario de prueba en Neon PostgreSQL
 */

const { Pool } = require('pg');
const crypto = require('crypto');

const connectionString = 'postgresql://neondb_owner:npg_vY7xpiAtChK8@ep-bitter-art-ah6e5v86-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// Función simple para hashear contraseña
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createTestUser() {
  console.log(`${colors.cyan}${colors.bright}Creando usuario de prueba...${colors.reset}\n`);

  let client;
  try {
    const pool = new Pool({
      connectionString: connectionString,
    });

    client = await pool.connect();

    // Crear hash de contraseña
    const passwordHash = hashPassword('Prueba123!');

    // Insertar usuario de prueba
    const result = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role;
    `, [
      'usuario@prueba.com',
      passwordHash,
      'Usuario Prueba',
      'user',
      true
    ]);

    const user = result.rows[0];

    console.log(`${colors.green}✓ Usuario creado exitosamente${colors.reset}\n`);
    console.log(`${colors.bright}Datos de inicio de sesión:${colors.reset}`);
    console.log(`  Email: ${colors.cyan}usuario@prueba.com${colors.reset}`);
    console.log(`  Contraseña: ${colors.cyan}Prueba123!${colors.reset}`);
    console.log(`  ID: ${colors.cyan}${user.id}${colors.reset}`);
    console.log(`  Nombre: ${colors.cyan}${user.full_name}${colors.reset}`);
    console.log(`  Rol: ${colors.cyan}${user.role}${colors.reset}\n`);

    // Verificar usuarios en la base de datos
    const usersResult = await client.query('SELECT COUNT(*) as total FROM users;');
    console.log(`${colors.bright}Total de usuarios en BD: ${colors.cyan}${usersResult.rows[0].total}${colors.reset}\n`);

    await client.end();
    await pool.end();

    console.log(`${colors.green}${colors.bright}✓ Ahora puedes iniciar sesión en la aplicación${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.bright}Error:${colors.reset} ${error.message}\n`);
    process.exit(1);
  }
}

createTestUser();
