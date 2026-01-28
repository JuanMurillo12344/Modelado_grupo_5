-- ============================================
-- Sistema de Presupuesto Mensual
-- ============================================
-- Extensión para control de presupuesto general,
-- ahorro y distribución por categorías
-- ============================================

-- Eliminar objetos existentes si es necesario (en orden inverso por dependencias)
DROP VIEW IF EXISTS budget_summary CASCADE;
DROP TRIGGER IF EXISTS check_category_distribution_sum ON budget_category_distribution CASCADE;
DROP TRIGGER IF EXISTS update_monthly_budget_config_updated_at ON monthly_budget_config CASCADE;
DROP TRIGGER IF EXISTS update_budget_category_distribution_updated_at ON budget_category_distribution CASCADE;
DROP FUNCTION IF EXISTS validate_category_distribution() CASCADE;
DROP FUNCTION IF EXISTS update_budget_updated_at() CASCADE;
DROP TABLE IF EXISTS budget_category_distribution CASCADE;
DROP TABLE IF EXISTS monthly_budget_config CASCADE;

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

-- Índices para optimización
CREATE INDEX idx_monthly_budget_config_user_id ON monthly_budget_config(user_id);
CREATE INDEX idx_monthly_budget_config_year_month ON monthly_budget_config(year, month);
CREATE INDEX idx_budget_category_distribution_budget_config ON budget_category_distribution(budget_config_id);
CREATE INDEX idx_budget_category_distribution_category ON budget_category_distribution(category_id);

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

COMMENT ON TABLE monthly_budget_config IS 'Configuración de presupuesto mensual general del usuario';
COMMENT ON TABLE budget_category_distribution IS 'Distribución del presupuesto disponible entre categorías de gasto';
COMMENT ON COLUMN monthly_budget_config.total_budget IS 'Presupuesto general mensual del usuario';
COMMENT ON COLUMN monthly_budget_config.savings_amount IS 'Monto destinado al ahorro mensual';
COMMENT ON COLUMN monthly_budget_config.available_for_expenses IS 'Presupuesto disponible para gastos (total - ahorro)';
COMMENT ON COLUMN budget_category_distribution.allocated_amount IS 'Monto asignado a esta categoría específica';
