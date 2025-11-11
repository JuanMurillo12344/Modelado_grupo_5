import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"

function getUserIdFromCookie(request: NextRequest): number | null {
  const token = request.cookies.get("auth_token")?.value
  if (!token) return null
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    return Number(decoded.userId)
  } catch {
    return null
  }
}

interface Budget {
  id: number
  budget_amount: number
  name: string
  icon: string
  spent: number
}

interface Alert extends Budget {
  percentage: number
  isExceeded: boolean
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || new Date().getMonth() + 1
    const year = searchParams.get("year") || new Date().getFullYear()

    const budgets = await sql`
      SELECT b.id, b.amount as budget_amount, c.name, c.icon,
             COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.user_id = ${userId} 
        AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.date) = ${month}
        AND EXTRACT(YEAR FROM t.date) = ${year}
      WHERE b.user_id = ${userId}
      GROUP BY b.id, b.amount, c.name, c.icon
    ` as Budget[]

    const alerts: Alert[] = budgets
      .map((budget) => ({
        ...budget,
        percentage: budget.budget_amount > 0 ? (budget.spent / budget.budget_amount) * 100 : 0,
        isExceeded: budget.spent > budget.budget_amount,
      }))
      .filter((b) => b.percentage >= 80)

    // Crear notificaciones para presupuestos excedidos (solo los que están por encima del 100%)
    for (const alert of alerts.filter(a => a.isExceeded)) {
      // Verificar si ya existe una notificación para este presupuesto en este mes
      const existingNotification = await sql`
        SELECT id FROM notifications
        WHERE user_id = ${userId}
        AND type = 'budget_exceeded'
        AND message LIKE ${`${alert.name}:%`}
        AND created_at >= date_trunc('month', CURRENT_DATE)
      `

      // Solo crear notificación si no existe una para este mes
      if (existingNotification.length === 0) {
        await createNotification({
          userId,
          type: "budget_exceeded",
          title: "⚠️ Presupuesto excedido",
          message: `${alert.name}: $${Number(alert.spent).toLocaleString()} de $${Number(alert.budget_amount).toLocaleString()} (${Math.round(alert.percentage)}%)`,
          icon: "AlertTriangle"
        })
      }
    }

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("[v0] Check budget alerts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
