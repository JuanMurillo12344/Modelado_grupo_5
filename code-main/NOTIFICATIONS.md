# Sistema de Notificaciones

## Descripción
Sistema completo de notificaciones en tiempo real con historial persistente para FinanzApp.

## Características

### 1. Centro de Notificaciones
- **Ubicación**: Botón con icono de campana en el sidebar
- **Badge**: Muestra el número de notificaciones no leídas
- **Dialog**: Modal con lista completa de notificaciones
- **Filtros**: Pestañas para ver todas o solo no leídas
- **Acciones**: Marcar como leída individual o todas a la vez

### 2. Tipos de Notificaciones

#### Transacciones
- `expense_added`: Nuevo gasto registrado
- `income_added`: Nuevo ingreso registrado
- `transaction_updated`: Transacción actualizada
- `transaction_deleted`: Transacción eliminada

#### Presupuestos
- `budget_created`: Nuevo presupuesto creado
- `budget_updated`: Presupuesto actualizado
- `budget_deleted`: Presupuesto eliminado
- `budget_exceeded`: Presupuesto excedido (automático)

#### Sistema
- `alert`: Alertas generales del sistema
- `system`: Notificaciones del sistema

### 3. API Endpoints

#### GET `/api/notifications`
Obtener notificaciones del usuario actual
```typescript
// Query params
?unread=true // Opcional: solo notificaciones no leídas

// Response
{
  notifications: Notification[]
}
```

#### POST `/api/notifications`
Crear nueva notificación (uso interno)
```typescript
// Body
{
  type: string,
  title: string,
  message: string,
  icon?: string
}

// Response
Notification
```

#### PATCH `/api/notifications`
Marcar notificaciones como leídas
```typescript
// Body
{
  id?: number, // Opcional: ID específica
  all?: boolean // Opcional: marcar todas
}

// Response
{ success: true }
```

### 4. Componentes

#### `NotificationCenter`
```tsx
<NotificationCenter
  open={boolean}
  onOpenChange={(open) => void}
  onUpdate={() => void} // Callback cuando cambia el estado
/>
```

#### Integración en Sidebar
```tsx
// Estado
const [notificationOpen, setNotificationOpen] = useState(false)
const [unreadCount, setUnreadCount] = useState(0)

// Botón con badge
<Button onClick={() => setNotificationOpen(true)}>
  <Bell />
  {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
</Button>
```

### 5. Helper Function

```typescript
import { createNotification } from "@/lib/notifications"

await createNotification({
  userId: number,
  type: "expense_added" | "income_added" | ...,
  title: string,
  message: string,
  icon?: string // Nombre del icono de lucide-react
})
```

### 6. Base de Datos

#### Tabla `notifications`
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT '🔔',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 7. Flujo de Notificaciones

1. **Usuario realiza acción** (crear/editar/eliminar transacción o presupuesto)
2. **Backend crea notificación** usando `createNotification()`
3. **Notificación se guarda en DB** con `is_read = false`
4. **Badge actualiza** (polling cada 60s en sidebar)
5. **Usuario abre centro de notificaciones**
6. **Usuario marca como leída**
7. **Badge actualiza** mostrando nuevo conteo

### 8. Notificaciones Automáticas

#### Presupuestos Excedidos
- Se verifica en `/api/budgets/check`
- Solo se crea una notificación por presupuesto por mes
- Se dispara cuando el gasto supera el 100% del presupuesto
- Incluye porcentaje y monto actual vs presupuestado

### 9. Polling y Tiempo Real

- **Unread Count**: Se actualiza cada 60 segundos
- **Lista de notificaciones**: Se recarga al abrir el centro
- **Marcar como leída**: Actualiza inmediatamente el badge

### 10. Personalización

Para agregar nuevos tipos de notificaciones:

1. **Actualizar tipo en `lib/notifications.ts`**:
```typescript
export interface NotificationData {
  userId: number
  type: "..." | "nuevo_tipo"
  ...
}
```

2. **Crear notificación en el endpoint correspondiente**:
```typescript
await createNotification({
  userId,
  type: "nuevo_tipo",
  title: "Título",
  message: "Mensaje detallado",
  icon: "IconName" // De lucide-react
})
```

3. **Opcional: Agregar badge en `notification-center.tsx`**:
```typescript
const typeColors = {
  ...existing,
  nuevo_tipo: "bg-color-500"
}
```

## Iconos Disponibles
- `Bell`: Campana genérica
- `TrendingUp`: Ingreso
- `TrendingDown`: Gasto
- `Edit`: Edición
- `Trash2`: Eliminación
- `PiggyBank`: Presupuesto
- `AlertTriangle`: Alerta/Advertencia
- Cualquier icono de [lucide-react](https://lucide.dev)
