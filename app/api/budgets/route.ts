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
      RETURNING *
    `

    const budget = result[0]

    // Obtener nombre de la categoría
    const category = await sql`
      SELECT name FROM categories WHERE id = ${categoryId}
    `

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
