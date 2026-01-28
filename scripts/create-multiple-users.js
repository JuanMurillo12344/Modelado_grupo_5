#!/usr/bin/env node

/**
 * Script para crear múltiples usuarios de prueba
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

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createTestUsers() {
  console.log(`${colors.cyan}${colors.bright}Creando usuarios de prueba...${colors.reset}\n`);

  let client;
  try {
    const pool = new Pool({
      connectionString: connectionString,
    });

    client = await pool.connect();

    const passwordHash = hashPassword('Prueba123!');

    // Crear múltiples usuarios de prueba
    const users = [
      { email: 'usuario1@prueba.com', name: 'Usuario 1' },
      { email: 'usuario2@prueba.com', name: 'Usuario 2' },
      { email: 'usuario3@prueba.com', name: 'Usuario 3' },
      { email: 'usuario4@prueba.com', name: 'Usuario 4' },
      { email: 'usuario5@prueba.com', name: 'Usuario 5' },
    ];

    console.log(`${colors.yellow}Insertando usuarios...${colors.reset}\n`);

    for (const user of users) {
      try {
        const result = await client.query(`
          INSERT INTO users (email, password_hash, full_name, role, is_active)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO NOTHING
          RETURNING id, email, full_name;
        `, [
          user.email,
          passwordHash,
          user.name,
          'user',
          true
        ]);

        if (result.rows.length > 0) {
          const createdUser = result.rows[0];
          console.log(`${colors.green}✓${colors.reset} ID ${createdUser.id}: ${createdUser.email}`);
        } else {
          console.log(`${colors.yellow}⚠${colors.reset} ${user.email} ya existe`);
        }
      } catch (error) {
        console.log(`${colors.yellow}⚠${colors.reset} Error creando ${user.email}: ${error.message}`);
      }
    }

    console.log();

    // Verificar usuarios en la base de datos
    const usersResult = await client.query('SELECT id, email, full_name FROM users ORDER BY id;');
    console.log(`${colors.bright}Usuarios en la base de datos:${colors.reset}`);
    usersResult.rows.forEach(user => {
      console.log(`  ${colors.cyan}ID ${user.id}:${colors.reset} ${user.email} (${user.full_name})`);
    });

    console.log(`\n${colors.bright}Datos de inicio de sesión:${colors.reset}`);
    console.log(`${colors.cyan}Contraseña:${colors.reset} Prueba123!`);
    console.log(`${colors.cyan}Email:${colors.reset} usuario1@prueba.com hasta usuario5@prueba.com\n`);

    await client.end();
    await pool.end();

  } catch (error) {
    console.error(`${colors.bright}Error:${colors.reset} ${error.message}\n`);
    process.exit(1);
  }
}

createTestUsers();
