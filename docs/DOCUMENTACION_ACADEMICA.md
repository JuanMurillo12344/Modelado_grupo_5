# FinanzApp - Sistema de Gestión Financiera para Estudiantes Foráneos

## Descripción General

**FinanzApp** es una aplicación web diseñada específicamente para estudiantes universitarios foráneos que buscan controlar y optimizar su presupuesto mensual. La herramienta permite un control financiero sencillo e intuitivo, adaptado a las necesidades de estudiantes con ingresos limitados y gastos recurrentes predecibles.

## Objetivos del Proyecto

### Objetivo General
Desarrollar una aplicación de gestión financiera personal que facilite a estudiantes universitarios foráneos el control mensual de sus ingresos y gastos, permitiendo una planificación eficiente de su dinero limitado.

### Objetivos Específicos
1. Permitir a estudiantes registrar y categorizar sus gastos e ingresos de forma sencilla
2. Implementar un sistema de presupuesto flexible que se adapte a cambios de ingresos
3. Proporcionar visualización clara del estado financiero mediante gráficos y resúmenes
4. Validar transacciones para evitar gastos mayores al presupuesto disponible
5. Generar reportes que ayuden a identificar patrones de gasto
6. Mantener una interfaz simple y accesible sin recargar de información

## Funcionamiento del Sistema

### Flujo de Trabajo Natural

El sistema sigue un flujo lógico y progresivo diseñado específicamente para estudiantes universitarios foráneos:

```
1. REGISTRO E INICIO DE SESIÓN
   └→ El estudiante crea su cuenta y accede al sistema

2. REGISTRO DE INGRESOS INICIALES
   └→ Registra su mesada, beca o apoyo familiar
   └→ Define si ahorra una parte o la usa como disponible

3. CONFIGURACIÓN DEL PRESUPUESTO
   └→ Define cuánto gastará en total el mes
   └→ Define cuánto ahorrará (obligatorio)
   └→ Sistema calcula: Dinero Disponible = Presupuesto - Ahorro

4. DISTRIBUCIÓN POR CATEGORÍAS
   └→ Asigna presupuesto a: Alimentación, Transporte, Arriendo, Estudios, Otros
   └→ Validación: suma de categorías ≤ dinero disponible

5. REGISTRO DE GASTOS
   └→ Selecciona categoría → sistema muestra presupuesto disponible
   └→ Registra gasto → descuenta automáticamente
   └→ Validación: gasto ≤ presupuesto disponible en categoría

6. VISUALIZACIÓN EN DASHBOARD
   └→ Resumen visual actualizado en tiempo real
   └→ Estado por categorías con barras de progreso

7. CONSULTA DE REPORTES
   └→ Gráficos de ingresos y gastos
   └→ Análisis de comportamiento financiero
```

**Principio fundamental**: Ningún gasto puede registrarse sin respaldo económico (ingreso + presupuesto).

### 1. Dashboard Principal (Resumen Visual)

El dashboard muestra únicamente información de resumen **sin formularios**, permitiendo al estudiante visualizar su situación financiera en segundos:

- **Presupuesto General Mensual**: Monto total de dinero disponible para el mes
- **Dinero Disponible**: Presupuesto general menos el monto ahorrado
- **Dinero Gastado**: Total de gastos registrados en el mes
- **Ingresos Totales**: Total de ingresos registrados
- **Estado por Categorías**: Visualización del gasto en cada categoría
- **Guía de Flujo**: Indicador visual del progreso (solo si faltan pasos)

**Guía de Flujo Inicial**: Sistema muestra automáticamente qué pasos debe completar el estudiante:
- ✅ Paso 1 completado: Ingreso registrado
- ✅ Paso 2 completado: Presupuesto configurado
- ✅ Paso 3 completado: Gastos registrados

El dashboard es **limpio, visual y sin formularios**, garantizando una experiencia de lectura rápida.

### 2. Submenú de Presupuesto

Acceso: `Dashboard → Presupuesto`

**Funcionalidades:**
- Definir o modificar el presupuesto general mensual
- Definir o modificar el monto de ahorro mensual
- Distribuir el dinero disponible entre categorías de gasto

**Categorías de Gasto:**
- Alimentación (comidas, snacks, bebidas)
- Transporte (buses, taxis, viajes)
- Arriendo (alojamiento mensual)
- Estudios (libros, materiales, cursos)
- Otros (gastos variados)

**Validaciones Implementadas:**
- El ahorro no puede superar el presupuesto general
- La suma de categorías no puede superar el dinero disponible
- El sistema calcula automáticamente: `Dinero Disponible = Presupuesto General - Ahorro`

### 3. Submenú de Transacciones

Acceso: `Dashboard → Transacciones` o botón "Nueva Transacción" en dashboard

#### 3.1 Lógica de Ingresos

Los ingresos representan el dinero que recibe el estudiante mensualmente:

**Tipos comunes para estudiantes foráneos:**
- Mesada familiar
- Apoyo económico de familiares
- Beca universitaria
- Trabajos ocasionales (freelance, medio tiempo)

**Al registrar un ingreso:**
1. Se suma automáticamente al presupuesto general disponible
2. Impacta inmediatamente el resumen del dashboard
3. Habilita la posibilidad de registrar gastos

**Flujo lógico**: Sin ingresos registrados → No se pueden registrar gastos

#### 3.2 Lógica de Gastos

Todo gasto debe estar respaldado por:
- ✅ Al menos un ingreso registrado en el mes
- ✅ Presupuesto configurado
- ✅ Categoría con presupuesto asignado

**Al seleccionar una categoría para registrar un gasto:**
- Sistema muestra el **presupuesto disponible** en esa categoría
- Ejemplo: "💰 Disponible: $50.00"
- Si la categoría no tiene presupuesto: "💡 Esta categoría no tiene presupuesto asignado"

**Al intentar registrar el gasto:**
1. **Validación previa (antes de enviar)**:
   - Si gasto > presupuesto disponible → Mensaje claro:
   - "⚠️ Este gasto ($XX) supera el presupuesto disponible ($YY). Puedes ajustar tu presupuesto en la sección 'Presupuesto' o registrar un monto menor."

2. **Validaciones del servidor**:
   - Sin ingresos registrados → "💡 Debes registrar al menos un ingreso primero. Cambia a 'Ingreso' arriba y registra tu mesada, beca o apoyo familiar."
   - Sin presupuesto configurado → "💡 Primero configura tu presupuesto mensual. Ve a la sección 'Presupuesto' en el menú lateral."

3. **Si todas las validaciones pasan**:
   - Gasto se registra exitosamente
   - Se descuenta automáticamente del presupuesto de la categoría
   - Se actualiza el resumen del dashboard en tiempo real
   - Se crea notificación visual

**Validaciones Implementadas:**
- ❌ No se permite registrar gastos sin presupuesto configurado
- ❌ No se permite registrar gastos sin al menos un ingreso registrado
- ❌ El gasto no puede exceder el presupuesto disponible en la categoría
- ✅ Mensajes claros en español, no técnicos
- ✅ Orientación sobre qué hacer ante cada error

### 4. Relación Ingresos → Presupuesto → Gastos

El sistema mantiene una relación clara y obligatoria:

```
INGRESOS
    ↓
PRESUPUESTO GENERAL
    ↓
PRESUPUESTO POR CATEGORÍAS
    ↓
GASTOS
```

**Ningún gasto puede existir sin respaldo económico.**
**Cada ingreso tiene impacto visible en el sistema.**
- Mesada familiar
- Ayuda familiar ocasional
- Beca académica
- Trabajo ocasional (freelance, part-time)

Los cambios se reflejan automáticamente en:
- Presupuesto general (si se usa como disponible)
- Ahorro mensual (si se elige ahorrar)
- Dashboard principal

### 4. Submenú de Reportes

Acceso: `Dashboard → Reportes`

**Visualizaciones:**
- Gráfico de ingresos vs gastos (comparación visual)
- Distribución de gastos por categoría (diagrama circular o barras)
- Detalle de comportamiento financiero

**Información Incluida:**
- En qué categorías se gasta más
- Porcentaje de presupuesto utilizado
- Comparación con meses anteriores
- Comportamiento general del mes
- Observaciones sobre patrones de gasto

### 5. Actualización en Tiempo Real

Cada acción del usuario se refleja inmediatamente en el sistema:

**Al Registrar un Ingreso:**
- Presupuesto general actualizado
- Dashboard muestra nuevo saldo disponible
- Notificación visual inmediata

**Al Configurar Presupuesto:**
- Dinero disponible calculado automáticamente
- Categorías actualizadas en dashboard
- Validaciones en tiempo real

**Al Registrar un Gasto:**
- Presupuesto de categoría descontado automáticamente
- Barra de progreso actualizada
- Total gastado recalculado
- Dashboard actualizado sin recargar página

## Justificación de Diseño Lean

### Principios Lean Aplicados

El sistema FinanzApp se desarrolló siguiendo los principios fundamentales de **Lean Thinking**:

#### 1. Valor para el Usuario

**Aplicación en FinanzApp:**
- ✅ Control mensual de presupuesto (evitar gastos excesivos)
- ✅ Distribución por categorías (entender en qué se gasta)
- ✅ Validaciones automáticas (prevenir errores financieros)
- ✅ Guía de flujo inicial (saber qué hacer primero)
- ❌ NO: Funcionalidades complejas innecesarias para estudiantes

#### 2. Eliminación de Desperdicios

**Desperdicios eliminados:**
- Dashboard sin formularios → acceso directo a resúmenes
- Solo 5 categorías principales, no 20+
- Mensajes claros en español, no códigos técnicos
- Registro de gasto en 4 campos, no 10+

**Flujo optimizado:**
```
ANTES: Dashboard → Formulario → Categorías → Subcategorías → Detalles → Confirmación
AHORA: Dashboard → Nueva Transacción → Tipo → Categoría → Monto → Listo
```

#### 3. Flujo Continuo

**Implementación:**
- Guía visual de flujo: Sistema muestra qué paso completar
- Validaciones preventivas: Antes de enviar, no después
- Actualización en tiempo real
- Navegación lógica progresiva

```
Ingreso → Presupuesto → Categorías → Gastos → Visualización
```

#### 4. Perfección Continua

- Mensajes de validación claros y empáticos
- Flujo inicial con guía visual
- Indicadores de presupuesto disponible
- Sistema de orientación automática
- Validaciones previenen sobregastos
- Reportes ayudan a identificar problemas
- Accesible y fácil de usar

### 4. Eficiencia
- Carga rápida
- Datos en tiempo real
- Cálculos automáticos

## Enfoque para Estudiantes Foráneos

FinanzApp está diseñado considerando:

### Características Financieras del Estudiante Foráneo:
- **Ingresos Limitados**: Mesadas, becas, trabajos ocasionales
- **Gastos Predecibles**: Arriendo, comida, transporte, educación
- **Control Mensual**: Presupuesto reinicia cada mes
- **Necesidad de Ahorro**: Fondo de emergencia importante

### Usabilidad:
- Lenguaje claro y directo
- Sin términos técnicos confusos
- Interfaces intuitivas
- Funciona en desktop y móvil

## Estructura Técnica

### Stack Tecnológico:
- **Frontend**: Next.js 16, TypeScript, React
- **UI**: shadcn/ui, Tailwind CSS
- **Backend**: Node.js con Next.js API Routes
- **Base de Datos**: PostgreSQL (Neon serverless)
- **Autenticación**: Token basado en cookies

### Tablas de Base de Datos:
1. `users` - Estudiantes registrados
2. `categories` - Categorías de ingresos/gastos
3. `transactions` - Registro de ingresos y gastos
4. `monthly_budget_config` - Configuración de presupuesto mensual
5. `budget_category_distribution` - Distribución por categoría
6. `notifications` - Notificaciones del sistema
7. `budgets` - Presupuestos (sistema complementario)
8. `monthly_balances` - Balances históricos

## Rutas de la Aplicación

- `/` - Página de inicio/login
- `/register` - Registro de nuevos usuarios
- `/dashboard` - Dashboard principal (resumen)
- `/dashboard/budget-config` - Configuración de presupuesto
- `/dashboard/transactions` - Registro de transacciones
- `/dashboard/reports` - Reportes y análisis
- `/dashboard/budgets` - Vista de presupuestos por categoría
- `/dashboard/settings` - Configuración de usuario

## Guía de Uso

### Primer Acceso:
1. Registrarse o iniciar sesión
2. Ir a **Presupuesto** y establecer presupuesto general y ahorro
3. Distribuir dinero entre categorías de gasto
4. Registrar primer ingreso en **Transacciones**
5. Comenzar a registrar gastos

### Uso Mensual:
1. Revisar dashboard para ver estado general
2. Registrar ingresos según lleguen
3. Registrar gastos cuando ocurran
4. Revisar categorías en presupuesto si es necesario
5. Consultar reportes para análisis

### Recomendaciones:
- Revisar dashboard una vez al día
- Actualizar presupuesto si ingresos cambian
- Registrar gastos el mismo día que ocurren
- Revisar reportes semanalmente

## Conclusión

FinanzApp es una solución integral y sencilla para que estudiantes universitarios foráneos logren un control efectivo de su dinero. Su enfoque Lean, interfaz simple y funcionalidades directas la hacen ideal para usuarios sin experiencia en gestión financiera.

El objetivo es empoderar a estudiantes para que tomen decisiones financieras informadas dentro de presupuestos limitados, contribuyendo a una experiencia universitaria más estable y menos estresante financieramente.
