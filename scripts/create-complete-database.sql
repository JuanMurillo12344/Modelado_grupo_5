-- ============================================
-- FinanzApp - Base de Datos Completa
-- ============================================
-- Sistema de Gestión de Finanzas Personales
-- con Sistema de Presupuesto Mensual
-- Timezone: America/Guayaquil (UTC-5)
-- Enero 2026
-- ============================================

-- ============================================
-- PASO 1: Eliminar tablas existentes
-- ============================================

-- Eliminar en orden inverso por dependencias
DROP VIEW IF EXISTS budget_summary CASCADE;
DROP TRIGGER IF EXISTS check_category_distribution_sum ON budget_category_distribution CASCADE;
DROP TRIGGER IF EXISTS update_monthly_budget_config_updated_at ON monthly_budget_config CASCADE;
DROP TRIGGER IF EXISTS update_budget_category_distribution_updated_at ON budget_category_distribution CASCADE;
DROP FUNCTION IF EXISTS validate_category_distribution() CASCADE;
DROP FUNCTION IF EXISTS update_budget_updated_at() CASCADE;
DROP TABLE IF EXISTS budget_category_distribution CASCADE;
DROP TABLE IF EXISTS monthly_budget_config CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS monthly_balances CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- PASO 2: Crear tablas principales
-- ============================================

-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  profile_picture TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de balances mensuales
CREATE TABLE monthly_balances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, year, month)
);

-- Tabla de categorías
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  type VARCHAR(20) CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de transacciones
CREATE TABLE transactions (
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

-- Tabla de presupuestos por categoría (sistema antiguo)
CREATE TABLE budgets (
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

-- Tabla de notificaciones
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT '🔔',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PASO 3: Sistema de Presupuesto Mensual (NUEVO)
-- ============================================

-- Tabla de configuración de presupuesto mensual
CREATE TABLE monthly_budget_config (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  
  -- Presupuesto general y ahorro
  total_budget DECIMAL(12, 2) NOT NULL CHECK (total_budget >= 0),
  savings_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (savings_amount >= 0),
  available_for_expenses DECIMAL(12, 2) GENERATED ALWAYS AS (total_budget - savings_amount) STORED,
  
  -- Metadatos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Solo una configuración por mes por usuario
  UNIQUE(user_id, year, month),
  
  -- Validar que el ahorro no supere el presupuesto total
  CHECK (savings_amount <= total_budget)
);

-- Tabla de distribución de presupuesto por categoría
CREATE TABLE budget_category_distribution (
  id SERIAL PRIMARY KEY,
  budget_config_id INTEGER NOT NULL REFERENCES monthly_budget_config(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Monto asignado a esta categoría
  allocated_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (allocated_amount >= 0),
  
  -- Metadatos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Solo una asignación por categoría por presupuesto
  UNIQUE(budget_config_id, category_id)
);

-- ============================================
-- PASO 4: Índices para optimización
-- ============================================

-- Índices de tablas principales
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_monthly_balances_user_id ON monthly_balances(user_id);
CREATE INDEX idx_monthly_balances_year_month ON monthly_balances(year, month);

-- Índices de sistema de presupuesto mensual
CREATE INDEX idx_monthly_budget_config_user_id ON monthly_budget_config(user_id);
CREATE INDEX idx_monthly_budget_config_year_month ON monthly_budget_config(year, month);
CREATE INDEX idx_budget_category_distribution_budget_config ON budget_category_distribution(budget_config_id);
CREATE INDEX idx_budget_category_distribution_category ON budget_category_distribution(category_id);

-- ============================================
-- PASO 5: Funciones y Triggers
-- ============================================

-- Función para validar que la suma de categorías no exceda el disponible
CREATE OR REPLACE FUNCTION validate_category_distribution()
RETURNS TRIGGER AS $$
DECLARE
  config_available DECIMAL(12, 2);
  total_allocated DECIMAL(12, 2);
BEGIN
  -- Obtener el presupuesto disponible
  SELECT available_for_expenses INTO config_available
  FROM monthly_budget_config
  WHERE id = NEW.budget_config_id;
  
  -- Calcular el total asignado incluyendo el nuevo/modificado registro
  SELECT COALESCE(SUM(allocated_amount), 0) INTO total_allocated
  FROM budget_category_distribution
  WHERE budget_config_id = NEW.budget_config_id
    AND id != COALESCE(NEW.id, -1);
  
  total_allocated := total_allocated + NEW.allocated_amount;
  
  -- Validar que no exceda el disponible
  IF total_allocated > config_available THEN
    RAISE EXCEPTION 'La suma de presupuestos por categoría (%) excede el presupuesto disponible (%)', 
      total_allocated, config_available;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar distribución de categorías
CREATE TRIGGER check_category_distribution_sum
  BEFORE INSERT OR UPDATE ON budget_category_distribution
  FOR EACH ROW
  EXECUTE FUNCTION validate_category_distribution();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_budget_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_monthly_budget_config_updated_at
  BEFORE UPDATE ON monthly_budget_config
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_updated_at();

CREATE TRIGGER update_budget_category_distribution_updated_at
  BEFORE UPDATE ON budget_category_distribution
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_updated_at();

-- ============================================
-- PASO 6: Vistas
-- ============================================

-- Vista para facilitar consultas de presupuesto con distribución
CREATE VIEW budget_summary AS
SELECT 
  mbc.id AS budget_config_id,
  mbc.user_id,
  mbc.year,
  mbc.month,
  mbc.total_budget,
  mbc.savings_amount,
  mbc.available_for_expenses,
  COALESCE(SUM(bcd.allocated_amount), 0) AS total_allocated,
  mbc.available_for_expenses - COALESCE(SUM(bcd.allocated_amount), 0) AS unallocated_amount,
  mbc.created_at,
  mbc.updated_at
FROM monthly_budget_config mbc
LEFT JOIN budget_category_distribution bcd ON mbc.id = bcd.budget_config_id
GROUP BY mbc.id;

-- ============================================
-- PASO 7: Datos iniciales
-- ============================================

-- Categorías predefinidas (globales para todos los usuarios)
INSERT INTO categories (name, icon, color, type, is_default) VALUES
-- Ingresos
('Salario', '💰', '#10b981', 'income', true),
('Freelance', '💻', '#3b82f6', 'income', true),
('Inversiones', '📈', '#14b8a6', 'income', true),
('Otros Ingresos', '💵', '#22c55e', 'income', true),
-- Gastos
('Alimentación', '🍔', '#f59e0b', 'expense', true),
('Transporte', '🚗', '#8b5cf6', 'expense', true),
('Educación', '📚', '#06b6d4', 'expense', true),
('Entretenimiento', '🎮', '#ec4899', 'expense', true),
('Salud', '⚕️', '#ef4444', 'expense', true),
('Vivienda', '🏠', '#f97316', 'expense', true),
('Servicios', '💡', '#eab308', 'expense', true),
('Ropa', '👕', '#a855f7', 'expense', true),
('Otros Gastos', '📦', '#6b7280', 'expense', true);

-- ============================================
-- PASO 8: Comentarios y documentación
-- ============================================

COMMENT ON TABLE users IS 'Usuarios del sistema';
COMMENT ON TABLE monthly_balances IS 'Balances iniciales mensuales de usuarios';
COMMENT ON TABLE categories IS 'Categorías de ingresos y gastos';
COMMENT ON TABLE transactions IS 'Transacciones (ingresos y gastos) de usuarios';
COMMENT ON TABLE budgets IS 'Presupuestos por categoría (sistema antiguo)';
COMMENT ON TABLE notifications IS 'Notificaciones del sistema';
COMMENT ON TABLE monthly_budget_config IS 'Configuración de presupuesto mensual general del usuario (NUEVO)';
COMMENT ON TABLE budget_category_distribution IS 'Distribución del presupuesto disponible entre categorías de gasto (NUEVO)';

COMMENT ON COLUMN monthly_budget_config.total_budget IS 'Presupuesto general mensual del usuario';
COMMENT ON COLUMN monthly_budget_config.savings_amount IS 'Monto destinado al ahorro mensual';
COMMENT ON COLUMN monthly_budget_config.available_for_expenses IS 'Presupuesto disponible para gastos (total - ahorro) - columna calculada';
COMMENT ON COLUMN budget_category_distribution.allocated_amount IS 'Monto asignado a esta categoría específica';

-- ============================================
-- FINALIZADO
-- ============================================

-- Verificar tablas creadas
SELECT 
  'TABLA CREADA: ' || table_name as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '  BASE DE DATOS CREADA EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tablas principales: 9';
  RAISE NOTICE 'Vistas: 1';
  RAISE NOTICE 'Funciones: 2';
  RAISE NOTICE 'Triggers: 3';
  RAISE NOTICE 'Categorías iniciales: 13';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Sistema listo para usar!';
END $$;
