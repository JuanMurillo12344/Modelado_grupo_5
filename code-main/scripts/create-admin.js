/**
 * Script para crear usuario administrador
 * Genera el hash de la contraseña usando SHA256 (igual que el sistema de auth)
 * 
 * Uso:
 * 1. node scripts/create-admin.js
 * 2. Copia el INSERT SQL generado
 * 3. Ejecútalo en tu base de datos Neon
 */

const crypto = require('crypto')

// Función igual a la de lib/auth.ts
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Configuración del admin
const adminData = {
  email: 'admin@finanzapp.com',
  password: 'Admin123!', // Cambia esto por tu contraseña deseada
  fullName: 'Administrador Principal',
  role: 'admin'
}

// Generar hash
const passwordHash = hashPassword(adminData.password)

// Generar SQL
const sql = `
-- ============================================
-- Crear Usuario Administrador
-- ============================================
-- Email: ${adminData.email}
-- Contraseña: ${adminData.password}
-- ============================================

INSERT INTO users (email, password_hash, full_name, role, monthly_budget, preferred_currency, is_active)
VALUES (
  '${adminData.email}',
  '${passwordHash}',
  '${adminData.fullName}',
  '${adminData.role}',
  0,
  'USD',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Verificar que se creó correctamente
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
WHERE email = '${adminData.email}';
`

console.log('\n' + '='.repeat(60))
console.log('📋 USUARIO ADMINISTRADOR GENERADO')
console.log('='.repeat(60))
console.log('\n📧 Email:', adminData.email)
console.log('🔑 Contraseña:', adminData.password)
console.log('🔐 Hash SHA256:', passwordHash)
console.log('\n' + '='.repeat(60))
console.log('📝 SQL PARA EJECUTAR EN TU BASE DE DATOS:')
console.log('='.repeat(60))
console.log(sql)
console.log('='.repeat(60))
console.log('\n✅ Pasos siguientes:')
console.log('1. Ve a https://console.neon.tech/')
console.log('2. Abre tu proyecto y ve a "SQL Editor"')
console.log('3. Copia y pega el SQL de arriba')
console.log('4. Ejecuta el query')
console.log('5. Inicia sesión con:', adminData.email, '/', adminData.password)
console.log('\n💡 Para cambiar la contraseña, edita la variable "password" en este script\n')
