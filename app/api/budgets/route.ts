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

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    // Si se especifica mes y año, calcular gastos
    if (month && year) {
      const budgetsWithSpending = await sql`
        SELECT 
          b.id,
          b.category_id,
          b.amount,
          b.period,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          COALESCE(SUM(t.amount), 0) as spent
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN transactions t ON t.category_id = b.category_id 
          AND t.user_id = ${userId}
          AND t.type = 'expense'
          AND EXTRACT(MONTH FROM t.date) = ${month}
          AND EXTRACT(YEAR FROM t.date) = ${year}
        WHERE b.user_id = ${userId}
        GROUP BY b.id, b.category_id, b.amount, b.period, c.name, c.icon, c.color
        ORDER BY c.name
      ` as any[]

      // Calcular porcentajes y restante
      const budgets = budgetsWithSpending.map(budget => {
        const spent = parseFloat(budget.spent || 0)
        const amount = parseFloat(budget.amount)
        const percentage = amount > 0 ? (spent / amount) * 100 : 0
        const remaining = amount - spent

        return {
          ...budget,
          name: budget.category_name,
          icon: budget.category_icon,
          spent,
          amount,
          percentage,
          remaining
        }
      })

      return NextResponse.json({ budgets })
    }

    // Sin filtros, devolver solo la lista de presupuestos
    const budgets = await sql`
      SELECT b.*, c.name, c.icon FROM budgets b 
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ${userId}
      ORDER BY c.name
    `

    return NextResponse.json({ budgets })
  } catch (error) {
    console.error("[v0] Get budgets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
//Cr
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId, amount, period } = await request.json()

    if (!categoryId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO budgets (user_id, category_id, amount, period) 
      VALUES (${userId}, ${categoryId}, ${amount}, ${period || "month"}) 
      ON CONFLICT (user_id, category_id, period) 
      DO UPDATE SET amount = ${amount}
      RETURNING *
    ` as any[]

    const budget = result[0]

    // Obtener nombre de la categoría
    const category = await sql`
      SELECT name FROM categories WHERE id = ${categoryId}
    ` as any[]

    // Crear notificación
    await createNotification({
      userId,
      type: "budget_created",
      title: "Presupuesto creado",
      message: `${category[0]?.name || "Categoría"}: $${amount.toLocaleString()} (${period === "month" ? "mensual" : "semanal"})`,
      icon: "PiggyBank"
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("[v0] Create budget error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
