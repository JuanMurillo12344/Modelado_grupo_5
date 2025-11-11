# FinanzApp - Gestor de Finanzas Personales

Una aplicación web completa para gestionar tus finanzas personales. Construida con Next.js 16, React 19, TypeScript, Tailwind CSS 4 y PostgreSQL (Neon).

## 🚀 Características Principales

### 💰 Gestión Financiera
- ✅ **Dashboard completo** - Visualiza balance, ingresos, gastos y tendencias
- ✅ **Transacciones** - Crea, edita y elimina transacciones con facilidad
- ✅ **Categorización inteligente** - 13 categorías predefinidas (alimentación, transporte, educación, etc.)
- ✅ **Presupuestos** - Define presupuestos mensuales/semanales por categoría
- ✅ **Alertas automáticas** - Notificaciones cuando excedes el 80% del presupuesto

### 📊 Visualización y Reportes
- ✅ **8 tipos de gráficos** - Ingresos, gastos, balance, tendencias, comparaciones, actividad diaria
- ✅ **Reportes detallados** - 4 pestañas (General, Ingresos, Gastos, Tendencias)
- ✅ **Comparación de períodos** - Compara mes actual vs mes anterior con indicadores inteligentes
- ✅ **Ranking de categorías** - Top categorías de ingresos y gastos
- ✅ **Análisis de tendencias** - Visualiza todos los meses con datos históricos

### 🔔 Sistema de Notificaciones
- ✅ **Notificaciones en tiempo real** - Toast inmediatos al crear/editar/eliminar
- ✅ **Centro de notificaciones** - Historial completo con filtros (leídas/no leídas)
- ✅ **Badge inteligente** - Contador de notificaciones no leídas en sidebar
- ✅ **8 tipos de notificaciones** - Gastos, ingresos, presupuestos, alertas con colores y emojis
- ✅ **Notificaciones persistentes** - Base de datos con índices optimizados

### 👥 Administración
- ✅ **Panel de administrador** - Dashboard con estadísticas globales
- ✅ **Gestión de usuarios** - Crear, editar, desactivar usuarios
- ✅ **Gestión de categorías** - Categorías globales y personalizadas
- ✅ **Estadísticas completas** - Total usuarios, transacciones, volumen

### 🎨 Experiencia de Usuario
- ✅ **Tema oscuro/claro** - Cambio suave con persistencia
- ✅ **100% Responsive** - Optimizado para móvil, tablet y desktop
- ✅ **Sidebar colapsable** - Maximiza espacio en pantallas pequeñas
- ✅ **Iconos y colores** - Interfaz visual e intuitiva con emojis y colores contextuales

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4.1.9, shadcn/ui, Radix UI
- **Charts**: Recharts para visualizaciones
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: PostgreSQL (Neon Serverless)
- **ORM/Query**: @neondatabase/serverless con SQL tagged templates
- **Authentication**: Cookie-based (httpOnly) con tokens base64
- **Dates**: date-fns v4 con localización en español
- **Icons**: Lucide React
- **Deployment**: Vercel Ready

## 📋 Requisitos Previos

1. Node.js 18+ y npm/yarn
2. Cuenta de Neon PostgreSQL
3. Variables de entorno configuradas

## 🔧 Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone <repository-url>
cd finanzapp
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`bash
DATABASE_URL=postgresql://user:password@host:port/database
\`\`\`

### 4. Ejecutar migraciones de base de datos

Ejecuta el script de inicialización en tu cliente Neon:

\`\`\`bash
# Copiar el contenido de scripts/init-database.sql
# y ejecutarlo en el editor SQL de Neon
\`\`\`

### 5. Ejecutar la aplicación en desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 👤 Cuentas de Prueba

Para probar la aplicación, puedes crear nuevas cuentas o usar estas credenciales de ejemplo:

### Usuario Regular
- Email: `admin@gmail.com`
- Password: `12345`

### Admin
- Email: `admin@finanzapp.com`
- Password: `Admin123!`

## 📱 Uso

### Para Usuarios Regulares

1. **Registrarse** - Ve a `/register` y crea una nueva cuenta
2. **Iniciar sesión** - Ve a `/login` con tus credenciales
3. **Dashboard** - Visualiza tu balance actual e historial de transacciones
4. **Agregar transacción** - Usa el formulario para añadir ingresos o gastos
5. **Navegar meses** - Usa las flechas para ver diferentes meses
6. **Cambiar tema** - Click en el botón de sol/luna en la esquina superior derecha

### Para Administradores

1. **Acceder panel admin** - Inicia sesión con una cuenta admin
2. **Ver estadísticas** - Dashboard muestra estadísticas globales
3. **Gestionar usuarios** - Pestaña "Usuarios" para ver todos los usuarios
4. **Gestionar categorías** - Pestaña "Categorías" para crear y ver categorías

## 🗄️ Estructura de Base de Datos

### Tablas Principales

- **users** - Usuarios con roles (user/admin), presupuesto mensual, moneda preferida
- **categories** - 13 categorías predefinidas + personalizadas (con iconos y colores)
- **transactions** - Transacciones con título, monto, descripción, tipo y fecha
- **budgets** - Presupuestos por categoría (mensual/semanal) con alertas al 80%
- **alerts** - Sistema de alertas para presupuestos excedidos
- **notifications** - Historial completo de notificaciones con 8 tipos

### Vistas Optimizadas

- **v_transaction_summary** - Vista completa de transacciones con categorías
- **v_budget_alerts** - Vista para monitoreo de presupuestos en tiempo real

### Índices de Rendimiento

10 índices estratégicos para optimizar consultas frecuentes (user_id, date, type, is_read, etc.)

## 🔐 Seguridad

- ✅ **Contraseñas hasheadas** - SHA-256 con salt
- ✅ **Cookies HttpOnly** - Tokens de autenticación seguros (base64 JSON)
- ✅ **Protección de rutas** - Middleware para validar autenticación
- ✅ **Validación en servidor** - Todas las entradas validadas
- ✅ **SQL Injection Prevention** - Uso de prepared statements (tagged templates)
- ✅ **CORS configurado** - Protección contra peticiones no autorizadas
- ✅ **Roles y permisos** - Separación admin/user
- ✅ **CASCADE on DELETE** - Integridad referencial en DB

## 🎨 Temas

La aplicación soporta:
- **Modo Claro** - Interfaz clara y limpia
- **Modo Oscuro** - Interfaz oscura para luz baja
- **Sistema** - Adapta al tema del sistema operativo

## 📦 Construcción para Producción

\`\`\`bash
npm run build
npm start
\`\`\`

## 🚀 Deployment en Vercel

1. Push tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio GitHub
4. Configura las variables de entorno
5. Deploy automático en cada push

## 📄 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Transacciones
- `GET /api/transactions` - Obtener transacciones (con filtros: mes, año, categoría, tipo, rango)
- `POST /api/transactions` - Crear transacción (+ notificación automática)
- `PUT /api/transactions/[id]` - Actualizar transacción (+ notificación)
- `DELETE /api/transactions/[id]` - Eliminar transacción (+ notificación)

### Presupuestos
- `GET /api/budgets` - Obtener presupuestos del usuario
- `POST /api/budgets` - Crear presupuesto (+ notificación)
- `PUT /api/budgets/[id]` - Actualizar presupuesto (+ notificación)
- `DELETE /api/budgets/[id]` - Eliminar presupuesto (+ notificación)
- `GET /api/budgets/check` - Verificar alertas de presupuestos (+ notificación si excede)

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones (con filtro ?unread=true)
- `POST /api/notifications` - Crear notificación (uso interno)
- `PATCH /api/notifications` - Marcar como leída (individual o todas)

### Categorías
- `GET /api/categories` - Obtener categorías del usuario

### Dashboard
- `GET /api/dashboard/summary` - Resumen del mes (con transactionCount, avgTransaction, byCategory)
- `GET /api/dashboard/monthly-trends` - Tendencias mensuales históricas
- `GET /api/dashboard/daily-activity` - Actividad diaria del mes

### Admin
- `GET /api/admin/users` - Listar todos los usuarios
- `PATCH /api/admin/users/[id]` - Actualizar usuario (activar/desactivar, cambiar rol)
- `GET /api/admin/categories` - Listar categorías globales
- `POST /api/admin/categories` - Crear categoría global
- `GET /api/admin/stats` - Estadísticas globales

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## � Documentación Adicional

- **SETUP.md** - Guía completa de instalación paso a paso
- **FEATURES.md** - Lista detallada de todas las funcionalidades
- **NOTIFICATIONS.md** - Documentación del sistema de notificaciones
- **scripts/init-database.sql** - Schema completo de la base de datos

## 🎨 Componentes Principales

### Gráficos y Visualización (8 componentes)
- `expense-chart.tsx` - Distribución de gastos por categoría (Pie Chart)
- `income-chart.tsx` - Distribución de ingresos por categoría (Pie Chart)
- `balance-overview.tsx` - Balance general del mes (Bar Chart)
- `period-comparison.tsx` - Comparación mes actual vs anterior (3 indicadores inteligentes)
- `monthly-trend.tsx` - Tendencias históricas todos los meses (Bar Chart lado a lado)
- `daily-activity-chart.tsx` - Actividad diaria del mes (Line Chart)
- `top-categories-ranking.tsx` - Top 5 categorías por monto (Lista con barras)
- `quick-stats-cards.tsx` - Tarjetas resumen (Total, Promedio, Cantidad)

### Gestión (7 componentes)
- `transaction-form.tsx` - Formulario crear transacciones
- `transactions-list.tsx` - Lista editable de transacciones
- `budget-manager.tsx` - Gestión completa de presupuestos
- `budget-alerts.tsx` - Alertas visuales de presupuestos
- `budget-notifications.tsx` - Sistema de alertas cada 2 minutos
- `notification-center.tsx` - Centro de notificaciones con historial
- `dashboard-sidebar.tsx` - Sidebar con navegación y badge de notificaciones

### Administración (4 componentes)
- `admin-header.tsx` - Header del panel admin
- `admin-stats.tsx` - Estadísticas globales
- `admin-users-tab.tsx` - Gestión de usuarios
- `admin-categories-tab.tsx` - Gestión de categorías

## 🔑 Características Destacadas

### Sistema Inteligente de Comparaciones
Los indicadores de comparación de períodos tienen lógica contextual:
- **Ingresos**: ↑ Verde (aumento es bueno), ↓ Rojo (disminución es malo)
- **Gastos**: ↑ Rojo (aumento es malo), ↓ Verde (disminución es bueno)
- **Balance**: Siempre muestra el cambio neto

### Notificaciones en Tiempo Real
- **Toast inmediato** al realizar cualquier acción
- **Sin duplicados** - Solo 1 notificación por acción
- **Colores contextuales** - Rojo para gastos/eliminaciones, verde para ingresos
- **Emojis visuales** - 💸 gastos, 💰 ingresos, ✏️ edición, 🗑️ eliminación
- **Historial persistente** en base de datos

### Gráficos Avanzados
- **Todos los meses** - MonthlyTrend muestra todos los meses con datos, no solo los últimos 6
- **Barras lado a lado** - Ingresos y gastos crecen juntos hacia arriba
- **Sin duplicados** - Dashboard = vista rápida, Reportes = análisis detallado
- **Responsive** - Se adaptan a móvil, tablet y desktop

### Presupuestos Inteligentes
- **Alertas automáticas** al 80% del presupuesto
- **Notificación única** por mes cuando se excede el 100%
- **Verificación cada 2 minutos** en tiempo real
- **Indicador visual** con barra de progreso y porcentaje

## 🏗️ Arquitectura

### Frontend
- **React 19** con Server Components y Client Components
- **Next.js 16** App Router con rutas paralelas
- **TypeScript** estricto con tipos explícitos
- **Tailwind CSS 4** con custom theme
- **Context API** para estado global (Auth, Theme, Notifications, BudgetAlerts)

### Backend
- **API Routes** con Next.js
- **Async/Await** para todas las operaciones
- **Tagged Templates** para SQL seguro
- **Error Handling** completo con try-catch
- **Validación** en cada endpoint

### Base de Datos
- **PostgreSQL** en Neon Serverless
- **6 tablas** principales con relaciones
- **2 vistas** optimizadas
- **10 índices** estratégicos
- **SERIAL** para IDs autoincrementales
- **CASCADE** para integridad referencial

## 🎓 Casos de Uso

### Para Estudiantes
- Control de gastos mensuales de alimentación, transporte y entretenimiento
- Seguimiento de ingresos por becas, trabajos part-time o mesadas
- Presupuestos para gestionar dinero limitado
- Reportes para identificar en qué se gasta más

### Para Freelancers
- Seguimiento de ingresos por proyectos
- Control de gastos operativos
- Presupuestos por categoría de negocio
- Análisis de tendencias mensuales

### Para Familias
- Gestión conjunta de finanzas del hogar
- Presupuestos por categoría (alimentación, servicios, educación)
- Alertas cuando se exceden límites
- Reportes mensuales para tomar decisiones

## 👨‍💻 Autor

Desarrollado con ❤️ por Christian Conforme

## 📞 Soporte

Si tienes preguntas o problemas:
1. **SETUP.md** - Guía completa de instalación con troubleshooting
2. **Next.js Docs** - https://nextjs.org/docs
3. **Neon Docs** - https://neon.tech/docs
4. **Tailwind CSS** - https://tailwindcss.com/docs
5. **shadcn/ui** - https://ui.shadcn.com

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

---

**¡Gestiona tus finanzas de manera inteligente con FinanzApp!** 💰📊✨
