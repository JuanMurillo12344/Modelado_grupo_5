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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { amount, period } = await request.json()

    if (!amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar que el presupuesto pertenece al usuario
    const existing = await sql`
      SELECT * FROM budgets WHERE id = ${id} AND user_id = ${userId}
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    // Actualizar presupuesto
    const result = await sql`
      UPDATE budgets 
      SET amount = ${amount}, period = ${period || "month"}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `

    const budget = result[0]

    // Obtener nombre de la categoría
    const category = await sql`
      SELECT name FROM categories WHERE id = ${budget.category_id}
    `

    // Crear notificación
    await createNotification({
      userId,
      type: "budget_updated",
      title: "Presupuesto actualizado",
      message: `${category[0]?.name || "Categoría"}: $${amount.toLocaleString()} (${period === "month" ? "mensual" : "semanal"})`,
      icon: "Edit"
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error("[v0] Update budget error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el presupuesto pertenece al usuario
    const existing = await sql`
      SELECT b.*, c.name as category_name FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ${id} AND b.user_id = ${userId}
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    const budget = existing[0]

    // Eliminar presupuesto
    await sql`
      DELETE FROM budgets WHERE id = ${id} AND user_id = ${userId}
    `

    // Crear notificación
    await createNotification({
      userId,
      type: "budget_deleted",
      title: "Presupuesto eliminado",
      message: `${budget.category_name || "Categoría"}: $${Number(budget.amount).toLocaleString()}`,
      icon: "Trash2"
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete budget error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
