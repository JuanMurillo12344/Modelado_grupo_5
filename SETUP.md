# Guía de Instalación - FinanzApp

**Gestor de Finanzas Personales** - Aplicación completa con sistema de notificaciones, gráficos avanzados y panel de administración.

## 📋 Requisitos Previos

- **Node.js** 18.x o superior
- **npm** o **pnpm** (recomendado)
- Cuenta en **Neon PostgreSQL** (gratuita)
- Editor de código (VS Code recomendado)

## Paso 1: Preparación Inicial

### 1.1 Clonar o descargar el proyecto

\`\`\`bash
git clone <repository-url>
cd finanzapp
\`\`\`

### 1.2 Instalar dependencias

\`\`\`bash
# Con npm
npm install

# Con pnpm (recomendado - más rápido)
pnpm install
\`\`\`

## Paso 2: Configurar Neon PostgreSQL

### 2.1 Crear base de datos en Neon

1. Ve a [https://console.neon.tech](https://console.neon.tech)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Copia la **CONNECTION STRING** (se verá algo como: \`postgresql://user:password@...\`)

### 2.2 Crear archivo de variables de entorno

En la raíz del proyecto, crea un archivo llamado \`.env.local\`:

\`\`\`bash
# .env.local
DATABASE_URL=postgresql://your-user:your-password@ep-xxxxx.neon.tech/dbname
\`\`\`

Reemplaza con tu conexión real de Neon.

### 2.3 Ejecutar las migraciones de base de datos

#### Opción 1: Usando el SQL Editor de Neon (Recomendado)

1. Ve al proyecto en **Neon Console**
2. Click en **SQL Editor** en el menú lateral
3. Abre el archivo \`scripts/init-database.sql\` del proyecto
4. Copia **TODO** el contenido (6 tablas + vistas + categorías + admin)
5. Pégalo en el editor de Neon
6. Click en **Run** o presiona Ctrl+Enter
7. Espera a que ejecute (verás "Success" en cada statement)

#### Opción 2: Usando el script automatizado

\`\`\`bash
# En PowerShell (Windows)
$env:DATABASE_URL="tu_conexion_completa"; node scripts/migrate-notifications.js

# En Bash/Terminal (Mac/Linux)
DATABASE_URL="tu_conexion_completa" node scripts/migrate-notifications.js
\`\`\`

**Nota**: El script \`migrate-notifications.js\` elimina restricciones antiguas del constraint CHECK.

### 2.4 Verificar que las tablas se crearon

En el SQL Editor de Neon, ejecuta:

\`\`\`sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Deberías ver: users, categories, transactions, budgets, alerts, notifications

-- Verificar categorías predefinidas
SELECT COUNT(*) FROM categories WHERE is_default = true;
-- Debería retornar: 13

-- Verificar usuario admin
SELECT email, role FROM users WHERE role = 'admin';
-- Debería mostrar: admin@finanzapp.com
\`\`\`

## Paso 3: Ejecutar la aplicación en desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Paso 4: Primeros Pasos en la Aplicación

### 4.1 Acceder como Administrador (Opcional)

El script de inicialización crea un usuario admin por defecto:

- **Email**: \`admin@finanzapp.com\`
- **Password**: \`admin123\`

**⚠️ IMPORTANTE**: Cambia esta contraseña en producción.

### 4.2 Crear tu propia cuenta

1. Ve a [http://localhost:3000/register](http://localhost:3000/register)
2. Registra una nueva cuenta
3. Inicia sesión
4. Las 13 categorías predefinidas ya están disponibles
5. ¡Comienza a agregar transacciones!

### 4.3 Probar las funcionalidades

#### Crear tu primera transacción
1. En el Dashboard, haz clic en "Nueva Transacción"
2. Selecciona tipo: Ingreso o Gasto
3. Elige categoría (ej: Alimentación, Salario)
4. Ingresa título, monto y descripción
5. Verás un **toast de notificación inmediato** (rojo para gastos, verde para ingresos)

#### Configurar presupuestos
1. Ve a **Presupuestos** en el sidebar
2. Selecciona una categoría (ej: Alimentación)
3. Define el monto mensual (ej: $500)
4. El sistema te alertará automáticamente cuando excedas el 80%

#### Ver reportes y gráficos
1. Ve a **Reportes** en el sidebar
2. Explora las 4 pestañas:
   - **General**: Balance, comparación, actividad diaria
   - **Ingresos**: Top categorías, lista detallada
   - **Gastos**: Top categorías, gráfico de distribución
   - **Tendencias**: Todos los meses con datos

#### Centro de Notificaciones
1. Haz clic en el ícono de **campana** en el sidebar
2. Verás el badge con el número de notificaciones no leídas
3. Filtra por "Todas" o "No leídas"
4. Marca como leída individual o todas a la vez

## Paso 5: Deploy en Vercel (Opcional)

### 5.1 Preparar para Vercel

1. Push tu código a GitHub:

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio GitHub
4. Configura la variable de entorno \`DATABASE_URL\`
5. Deploy automático cuando hagas push a main

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not set"

**Causa**: Variable de entorno no cargada

**Solución**:
1. Verifica que \`.env.local\` existe en la raíz del proyecto
2. Verifica que tiene el formato correcto (sin espacios extras)
3. Reinicia el servidor de desarrollo (\`npm run dev\`)
4. Si usas PowerShell, asegúrate de no tener comillas simples en la URL

### Error: "relation 'notifications' does not exist"

**Causa**: Tabla notifications no creada o constraint antiguo

**Solución**:
\`\`\`bash
# Ejecutar migración de notificaciones
$env:DATABASE_URL="tu_conexion"; node scripts/migrate-notifications.js
\`\`\`

### Error: "new row violates check constraint"

**Causa**: Tipos de notificación no permitidos por constraint antiguo

**Solución**: Ejecutar \`migrate-notifications.js\` (elimina el constraint CHECK)

### Error: "Conexión rechazada a base de datos"

**Posibles causas**:
- Neon proyecto pausado (se pausa después de inactividad)
- URL de conexión incorrecta
- Firewall bloqueando conexión

**Solución**:
1. Ve a Neon Console y verifica que el proyecto está activo
2. Copia nuevamente la CONNECTION STRING (puede haber cambiado)
3. Asegúrate de usar el pooler connection string (termina en \`-pooler.neon.tech\`)

### Los gráficos no muestran datos

**Causa**: No hay suficientes transacciones en el mes

**Solución**:
1. Crea al menos 3-5 transacciones en diferentes días
2. Navega entre meses usando las flechas
3. Algunos gráficos requieren datos de múltiples meses

### Las notificaciones se duplican

**Causa**: Toast del sidebar y toast inmediato (Ya corregido en esta versión)

**Verificación**: Solo debe aparecer 1 toast al crear/editar/eliminar

### Dark Mode no persiste

**Solución**:
1. Abre DevTools (F12)
2. Ve a Application > Local Storage
3. Verifica que existe la key \`theme\`
4. Si no, limpia el cache (Ctrl+Shift+Delete)

## 📊 Estructura de Carpetas

\`\`\`
finanzapp/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Login, register
│   │   ├── transactions/  # CRUD transacciones
│   │   ├── budgets/       # CRUD presupuestos
│   │   ├── notifications/ # Sistema notificaciones
│   │   ├── categories/    # Categorías
│   │   ├── dashboard/     # Summary, trends, daily
│   │   └── admin/         # Panel administración
│   ├── dashboard/         # Páginas principales
│   ├── login/            
│   ├── register/
│   └── layout.tsx         # Layout raíz con metadata
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── *-chart.tsx       # 8 componentes de gráficos
│   ├── *-form.tsx        # Formularios
│   ├── *-list.tsx        # Listas
│   ├── notification-center.tsx
│   └── dashboard-sidebar.tsx
├── contexts/             # React Contexts
│   ├── auth-context.tsx
│   ├── budget-alerts-context.tsx
│   ├── notification-context.tsx
│   └── theme-context.tsx
├── lib/                  # Utilidades
│   ├── db.ts            # Conexión Neon
│   ├── auth.ts          # Helpers autenticación
│   ├── notifications.ts # Helper notificaciones
│   └── utils.ts         # Utilidades generales
├── scripts/             # Scripts SQL
│   ├── init-database.sql
│   └── migrate-notifications.js
└── public/              # Archivos estáticos
\`\`\`

## 🎯 Funcionalidades Clave

### Dashboard
- Balance total, ingresos y gastos del mes
- Gráfico de balance general
- Comparación mes actual vs anterior
- Gráfico de ingresos por categoría
- Gráfico de gastos por categoría
- Lista de transacciones recientes

### Reportes (4 pestañas)
- **General**: QuickStats, BalanceOverview, PeriodComparison, DailyActivityChart
- **Ingresos**: IncomeChart, TopCategoriesRanking, IncomeList
- **Gastos**: ExpenseChart, TopCategoriesRanking
- **Tendencias**: MonthlyTrend (todos los meses históricos)

### Sistema de Notificaciones
- 8 tipos: expense_added, income_added, transaction_updated, transaction_deleted, budget_created, budget_updated, budget_deleted, budget_exceeded
- Toast inmediatos con colores contextuales
- Centro de notificaciones con historial
- Badge con contador de no leídas
- Polling cada 60 segundos

### Presupuestos
- Definir presupuestos por categoría
- Alertas automáticas al 80%
- Notificación cuando se excede el 100%
- Solo 1 notificación por mes por categoría

## ⚙️ Configuración Avanzada

### Cambiar el nombre de la aplicación

Edita \`app/layout.tsx\`:
\`\`\`typescript
export const metadata: Metadata = {
  title: "Tu Nombre - Tu Descripción",
  description: "Tu descripción personalizada",
}
\`\`\`

### Cambiar colores del tema

Edita \`app/globals.css\` en las secciones \`@layer base\`.

### Agregar nuevas categorías predefinidas

Edita \`scripts/init-database.sql\` en la sección de INSERT de categories.

## ¿Necesitas ayuda?

1. **Consola del navegador** (F12) → Ver errores de frontend
2. **Terminal** → Ver logs de Next.js y errores de API
3. **Neon SQL Editor** → Verificar datos en la base de datos
4. **README.md** → Documentación completa de API endpoints
5. **NOTIFICATIONS.md** → Guía completa del sistema de notificaciones

## 🚀 Deploy a Producción

Ver archivo README.md sección "Deploy en Vercel"

---

¡Listo! 🎉 Ya tienes **FinanzApp** funcionando completamente con todas sus funcionalidades.
\`\`\`

\`\`\`

```env.example file=".env.example"
# Copia este archivo a .env.local y rellena con tus valores

# Neon PostgreSQL Connection String
DATABASE_URL=postgresql://username:password@ep-xxxxx.neon.tech:5432/dbname
