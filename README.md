# FinanzApp - Gestor de Finanzas Personales

Una aplicación web completa para gestionar tus finanzas personales, especialmente diseñada para estudiantes universitarios. Construida con **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4** y **PostgreSQL (Neon)**.

---

## 🚀 Características Principales

### 💰 Gestión Financiera Completa
- **Dashboard personalizado** - Balance, ingresos, gastos y tendencias en tiempo real
- **Transacciones** - Crear, editar y eliminar transacciones fácilmente
- **13 Categorías predefinidas** - Alimentación, transporte, vivienda, educación, salud, entretenimiento y más
- **Presupuestos inteligentes** - Define presupuestos fijos por categoría
- **Validación de gastos** - Bloquea gastos si no hay dinero disponible

### 📊 Visualización y Análisis
- **8 tipos de gráficos** - Ingresos, gastos, balance, tendencias y comparaciones
- **4 pestañas de reportes** - General, Ingresos, Gastos y Tendencias mensuales
- **Comparación inteligente** - Mes actual vs mes anterior con indicadores
- **Ranking de categorías** - Top categorías de ingresos y gastos
- **Histórico completo** - Visualiza datos de todos los meses

### 🔔 Notificaciones Inteligentes
- **Alertas en tiempo real** - Toast inmediatos al crear/editar transacciones
- **Centro de notificaciones** - Historial completo con filtros
- **8 tipos de alertas** - Gastos, ingresos, presupuestos excedidos, etc.
- **Badge dinámico** - Contador de notificaciones no leídas

### 👥 Administración Completa
- **Panel de administrador** - Estadísticas globales y gestión del sistema
- **Gestión de usuarios** - Crear, editar y desactivar usuarios
- **Categorías personalizables** - Agregar y personalizar categorías
- **Auditoría** - Seguimiento de cambios en el sistema

### 🎨 Experiencia Premium
- **Tema oscuro/claro** - Cambio suave y persistente
- **100% Responsive** - Optimizado para móvil, tablet y desktop
- **Interfaz intuitiva** - Diseño limpio con iconos y colores contextuales
- **Navegación fluida** - Experiencia de usuario perfecta

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, Next.js 16 (App Router), TypeScript |
| **Styling** | Tailwind CSS v4.1.9, shadcn/ui, Radix UI |
| **Gráficos** | Recharts para visualizaciones interactivas |
| **Backend** | Next.js API Routes con TypeScript |
| **Database** | PostgreSQL (Neon Serverless SQL) |
| **Autenticación** | Cookie-based (httpOnly) con tokens base64 |
| **Fechas** | date-fns v4 con localización español |
| **Icons** | Lucide React (150+ iconos) |
| **Deployment** | Vercel Ready |

---

## 📋 Requisitos Previos

- **Node.js** 18+ (npm, yarn o pnpm)
- **Cuenta Neon** - Base de datos PostgreSQL gratuita
- **.env.local** - Variables de entorno configuradas

---

## 🔧 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd Modelado_grupo_5
```

### 2. Instalar dependencias
```bash
npm install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crea `.env.local` en la raíz:
```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### 4. Ejecutar migraciones
```bash
# Copiar contenido de scripts/Database.sql
# Ejecutar en el editor SQL de Neon Dashboard
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) ✨

---

## 👤 Cuentas de Prueba

### Estudiante
- **Email**: `estudiante@example.com`
- **Contraseña**: `password123`

### Administrador
- **Email**: `admin@example.com`
- **Contraseña**: `admin123`

---

## 📱 Estructura de la Aplicación

### Páginas Principales

| Página | Descripción |
|--------|-----------|
| `/` | Landing page con funcionalidades |
| `/login` | Inicio de sesión |
| `/register` | Registro de nuevos usuarios |
| `/dashboard` | Dashboard principal (balance, gráficos) |
| `/dashboard/transactions` | Registro y historial de transacciones |
| `/dashboard/budgets` | Gestión de presupuestos fijos |
| `/dashboard/budget-config` | Configuración presupuesto mensual |
| `/dashboard/reports` | Reportes detallados |
| `/dashboard/settings` | Configuración de perfil y seguridad |
| `/dashboard/admin` | Panel de administrador |

### Funcionalidades Clave

**Dashboard**
- Tarjeta de balance disponible
- Análisis de IA del mes
- Presupuesto mensual con estado por categoría
- Transacciones recientes

**Transacciones**
- Formulario rápido con validación
- Sugerencias de IA al registrar gastos
- Historial con filtros
- Editar/eliminar transacciones

**Presupuestos**
- Asignar presupuesto fijo por categoría
- Editar y eliminar presupuestos
- Visualizar estado en tiempo real
- Bloquear gastos si no hay dinero

**Reportes**
- Comparación de períodos
- Análisis por categoría
- Tendencias históricas
- Descargar datos

---

## 🤖 IA Integrada (Claude Haiku)

La app incluye un asistente de IA que:
- **Sugiere distribución de presupuesto** según patrones de gasto
- **Analiza gastos individuales** en tiempo real
- **Proporciona insights mensuales** personalizados
- **Advierte sobre excesos** de presupuesto
- **Felicita por buen control** financiero

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas (bcrypt)
- ✅ Cookies seguras (httpOnly, sameSite)
- ✅ Protección CSRF integrada
- ✅ Validación en frontend y backend
- ✅ Autorización por rol (user/admin)

---

## 📊 Base de Datos

### Tablas Principales
- **users** - Usuarios con roles y datos personales
- **transactions** - Ingresos y gastos con categoría
- **categories** - 13 categorías predefinidas + custom
- **budgets** - Presupuestos fijos por categoría
- **monthly_budget_config** - Configuración presupuesto mensual
- **budget_category_distribution** - Distribución por categoría
- **notifications** - Historial de 8 tipos de notificaciones
- **alerts** - Sistema de alertas cuando se excede presupuesto

### Vistas Optimizadas
- `v_transaction_summary` - Transacciones con categoría
- `v_budget_alerts` - Monitoreo de presupuestos

### Índices de Rendimiento
10+ índices estratégicos para consultas rápidas (user_id, date, type, is_read, etc.)

---

## 🎯 Casos de Uso

### Para Estudiantes Universitarios Foráneos
1. **Distribución inteligente** - IA sugiere cómo distribuir el dinero
2. **Control mensual** - Sabe cuánto tiene y cuánto puede gastar
3. **Alertas preventivas** - Se entera cuando se está pasando
4. **Ahorros automáticos** - Define cuánto ahorrar cada mes
5. **Análisis mensual** - Entiende en qué gastó más

### Para Administradores
1. **Ver estadísticas globales** - Total usuarios, transacciones, volumen
2. **Gestionar usuarios** - Crear, editar, desactivar
3. **Configurar categorías** - Personalizar según necesidades
4. **Auditoría completa** - Seguimiento de cambios

---

## 🚀 Deployment

### En Vercel (Recomendado)
```bash
# Conectar repositorio GitHub
# Definir DATABASE_URL en variables de entorno
# Deploy automático en cada push
```

### En tu servidor
```bash
npm run build
npm run start
```

---

## 📝 Variables de Entorno

```env
# Base de datos (REQUERIDO)
DATABASE_URL=postgresql://user:password@host/db

# Secreto para cookies (opcional, pero recomendado)
JWT_SECRET=tu-secreto-aleatorio-aqui
```

---

## 🐛 Resolución de Problemas

### "Presupuesto no configurado"
→ Ve a `/dashboard/budget-config` y configura tu presupuesto mensual

### "No puedo registrar gastos"
→ Verifica que tengas:
- Presupuesto configurado
- Al menos un ingreso registrado
- Dinero disponible en el mes

### Errores de conexión a base de datos
→ Verifica que `DATABASE_URL` esté correcta en `.env.local`

### El servidor no inicia
→ Ejecuta `npm install` nuevamente

---

## 📄 Licencia

MIT License - Libre para usar y modificar

---

## 👨‍💻 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

¿Preguntas o problemas? 
- Abre un issue en GitHub
- Revisa la documentación en `/docs`
- Contacta al equipo de desarrollo

---

**Última actualización**: 27 de Enero de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Producción
