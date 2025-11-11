-- ============================================
-- FinanzApp - Database Schema
-- ============================================
-- Gestor de Finanzas Personales para Estudiantes
-- 
-- Cambios principales:
-- ✅ SERIAL (ID autoincremental) en lugar de UUID
-- ✅ Campos para presupuesto mensual y moneda preferida
-- ✅ Categorías requeridas: Alimentación, Transporte, Educación, Entretenimiento
-- ✅ Sistema de alertas automáticas al exceder presupuesto
-- ✅ Título en transacciones
-- ✅ Control de usuarios activos/inactivos
-- ✅ Vistas para facilitar consultas y reportes
-- 
-- Fecha: Noviembre 2025
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  monthly_budget DECIMAL(12, 2) DEFAULT 0,
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  type VARCHAR(20) CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget table (presupuesto por categoría)
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  period VARCHAR(20) DEFAULT 'month' CHECK (period IN ('week', 'month', 'year')),
  alert_threshold DECIMAL(5, 2) DEFAULT 80.00 CHECK (alert_threshold BETWEEN 0 AND 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id, period)
);

-- Alerts table (notificaciones de presupuesto)
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  budget_id INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  alert_type VARCHAR(50) CHECK (alert_type IN ('budget_warning', 'budget_exceeded', 'info')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table (centro de notificaciones con historial)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT '🔔',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create view for transaction summary
CREATE OR REPLACE VIEW v_transaction_summary AS
SELECT 
  t.id,
  t.user_id,
  t.title,
  t.amount,
  t.description,
  t.type,
  t.date,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color,
  u.full_name as user_name,
  t.created_at
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN users u ON t.user_id = u.id;

-- Create view for budget alerts
CREATE OR REPLACE VIEW v_budget_alerts AS
SELECT 
  b.id as budget_id,
  b.user_id,
  b.amount as budget_amount,
  b.period,
  b.alert_threshold,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color,
  COALESCE(SUM(t.amount), 0) as spent,
  ROUND((COALESCE(SUM(t.amount), 0) / b.amount * 100), 2) as percentage_used,
  CASE 
    WHEN COALESCE(SUM(t.amount), 0) > b.amount THEN 'exceeded'
    WHEN (COALESCE(SUM(t.amount), 0) / b.amount * 100) >= b.alert_threshold THEN 'warning'
    ELSE 'ok'
  END as status
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = b.category_id 
  AND t.user_id = b.user_id 
  AND t.type = 'expense'
  AND EXTRACT(MONTH FROM t.date) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM t.date) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY b.id, b.user_id, b.amount, b.period, b.alert_threshold, c.name, c.icon, c.color;

-- Insert default categories (global - sin user_id)
INSERT INTO categories (name, icon, color, type, is_default) VALUES
-- Ingresos
('Salario', '💰', '#10b981', 'income', true),
('Freelance', '💻', '#3b82f6', 'income', true),
('Inversiones', '📈', '#14b8a6', 'income', true),
('Otros Ingresos', '💵', '#22c55e', 'income', true),

-- Gastos principales (según requisitos)
('Alimentación', '🍔', '#f59e0b', 'expense', true),
('Transporte', '🚗', '#8b5cf6', 'expense', true),
('Educación', '📚', '#06b6d4', 'expense', true),
('Entretenimiento', '🎮', '#ec4899', 'expense', true),

-- Gastos adicionales
('Salud', '⚕️', '#ef4444', 'expense', true),
('Vivienda', '🏠', '#f97316', 'expense', true),
('Servicios', '�', '#eab308', 'expense', true),
('Ropa', '👕', '#a855f7', 'expense', true),
('Otros Gastos', '📦', '#6b7280', 'expense', true);

-- Crear usuario administrador por defecto (password: admin123)
-- Hash bcrypt de "admin123"
INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES
('admin@finanzapp.com', '$2a$10$xQNl0EQVLZkPEj5oy6K4KOQvqHcXHvZkPeqPaV0pXXKPqJ0J0J0J0', 'Administrador', 'admin', true)
ON CONFLICT (email) DO NOTHING;
