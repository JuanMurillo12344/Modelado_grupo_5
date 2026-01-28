#!/usr/bin/env node

/**
 * Script para resetear la base de datos y asegurar IDs correctos
 */

const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_vY7xpiAtChK8@ep-bitter-art-ah6e5v86-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function resetDatabase() {
  console.log(`${colors.cyan}${colors.bright}Reseteando base de datos...${colors.reset}\n`);

  let client;
  try {
    const pool = new Pool({
      connectionString: connectionString,
    });

    client = await pool.connect();

    // Ejecutar transacción para resetear
    await client.query('BEGIN');

    // Limpiar todas las tablas (en orden inverso por dependencias)
    console.log(`${colors.yellow}Limpiando tablas...${colors.reset}`);
    await client.query('DELETE FROM budget_category_distribution');
    await client.query('DELETE FROM monthly_budget_config');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM transactions');
    await client.query('DELETE FROM budgets');
    await client.query('DELETE FROM monthly_balances');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM categories WHERE is_default = true');

    // Resetear sequences
    console.log(`${colors.yellow}Reseteando sequences...${colors.reset}`);
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE budgets_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE notifications_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE monthly_balances_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE monthly_budget_config_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE budget_category_distribution_id_seq RESTART WITH 1');

    // Reinsertar categorías
    console.log(`${colors.yellow}Reinsertando categorías...${colors.reset}`);
    await client.query(`
      INSERT INTO categories (name, icon, color, type, is_default) VALUES
      ('Salario', '💰', '#10b981', 'income', true),
      ('Freelance', '💻', '#3b82f6', 'income', true),
      ('Inversiones', '📈', '#14b8a6', 'income', true),
      ('Otros Ingresos', '💵', '#22c55e', 'income', true),
      ('Alimentación', '🍔', '#f59e0b', 'expense', true),
      ('Transporte', '🚗', '#8b5cf6', 'expense', true),
      ('Educación', '📚', '#06b6d4', 'expense', true),
      ('Entretenimiento', '🎮', '#ec4899', 'expense', true),
      ('Salud', '⚕️', '#ef4444', 'expense', true),
      ('Vivienda', '🏠', '#f97316', 'expense', true),
      ('Servicios', '💡', '#eab308', 'expense', true),
      ('Ropa', '👕', '#a855f7', 'expense', true),
      ('Otros Gastos', '📦', '#6b7280', 'expense', true)
    `);

    // Crear usuario de prueba
    console.log(`${colors.yellow}Creando usuario de prueba...${colors.reset}`);
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update('Prueba123!').digest('hex');

    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ('usuario@prueba.com', $1, 'Usuario Prueba', 'user', true)
      RETURNING id, email;
    `, [passwordHash]);

    const userId = userResult.rows[0].id;

    await client.query('COMMIT');

    console.log(`\n${colors.green}${colors.bright}✓ Base de datos reseteada${colors.reset}\n`);
    console.log(`${colors.bright}Usuario creado:${colors.reset}`);
    console.log(`  ${colors.cyan}ID:${colors.reset} ${userId}`);
    console.log(`  ${colors.cyan}Email:${colors.reset} usuario@prueba.com`);
    console.log(`  ${colors.cyan}Contraseña:${colors.reset} Prueba123!\n`);
    console.log(`${colors.yellow}Ahora inicia sesión con estas credenciales${colors.reset}\n`);

    await client.end();
    await pool.end();

  } catch (error) {
    console.error(`${colors.bright}Error:${colors.reset} ${error.message}\n`);
    process.exit(1);
  }
}

resetDatabase();
