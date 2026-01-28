#!/usr/bin/env node

/**
 * Script para desplegar la base de datos en Neon PostgreSQL
 * Uso: node deploy-database.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configuración de la conexión
const connectionString = 'postgresql://neondb_owner:npg_vY7xpiAtChK8@ep-bitter-art-ah6e5v86-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function deployDatabase() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Desplegando Base de Datos FinanzApp  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  let client;
  try {
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create-complete-database.sql');
    console.log(`${colors.yellow}📂 Leyendo script SQL...${colors.reset}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`No se encontró el archivo: ${sqlFilePath}`);
    }

    const sqlScript = fs.readFileSync(sqlFilePath, 'utf-8');
    console.log(`${colors.green}✓ Script cargado (${sqlScript.length} bytes)${colors.reset}\n`);

    // Conectar a la base de datos
    console.log(`${colors.yellow}🔌 Conectando a Neon PostgreSQL...${colors.reset}`);
    const pool = new Pool({
      connectionString: connectionString,
      statement_timeout: 60000,
      idle_in_transaction_session_timeout: 60000,
    });

    client = await pool.connect();
    console.log(`${colors.green}✓ Conectado exitosamente${colors.reset}\n`);

    // Ejecutar el script SQL
    console.log(`${colors.yellow}⚙️  Ejecutando script SQL...${colors.reset}`);
    await client.query(sqlScript);
    console.log(`${colors.green}✓ Script ejecutado correctamente${colors.reset}\n`);

    // Verificar tablas creadas
    console.log(`${colors.yellow}📊 Verificando tablas creadas...${colors.reset}`);
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n${colors.bright}Tablas creadas:${colors.reset}`);
    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${colors.cyan}${row.table_name}${colors.reset}`);
    });

    // Verificar categorías
    const categoriesResult = await client.query(`
      SELECT COUNT(*) as total FROM categories;
    `);

    console.log(`\n${colors.bright}Datos iniciales:${colors.reset}`);
    console.log(`  • Categorías: ${colors.cyan}${categoriesResult.rows[0].total}${colors.reset}`);

    // Resumen final
    console.log(`\n${colors.green}${colors.bright}`);
    console.log('╔════════════════════════════════════════╗');
    console.log('║  ✓ BASE DE DATOS CREADA EXITOSAMENTE  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`${colors.reset}\n`);

    console.log(`${colors.bright}Resumen:${colors.reset}`);
    console.log(`  📦 Tablas: ${colors.green}${result.rows.length}${colors.reset}`);
    console.log(`  🏷️  Categorías: ${colors.green}${categoriesResult.rows[0].total}${colors.reset}`);
    console.log(`  ✨ Estado: ${colors.green}Listo para usar${colors.reset}\n`);

    await client.end();
    await pool.end();

    console.log(`${colors.yellow}Próximos pasos:${colors.reset}`);
    console.log(`  1. npm install (instalar dependencias)`);
    console.log(`  2. npm run dev (iniciar servidor)`);
    console.log(`  3. Acceder a http://localhost:3000\n`);

  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ Error durante el despliegue:${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}\n`);

    if (error.detail) {
      console.error(`${colors.yellow}Detalles:${colors.reset}`);
      console.error(`${colors.red}${error.detail}${colors.reset}\n`);
    }

    process.exit(1);
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
}

// Ejecutar
deployDatabase().catch(error => {
  console.error(error);
  process.exit(1);
});
