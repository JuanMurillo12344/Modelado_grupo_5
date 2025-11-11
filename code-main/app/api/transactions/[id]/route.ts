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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { categoryId, title, amount, description, type } = await request.json()

    if (!categoryId || !title || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar que la transacción pertenece al usuario
    const existing = await sql`
      SELECT id FROM transactions WHERE id = ${id} AND user_id = ${userId}
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const result = await sql`
      UPDATE transactions 
      SET 
        category_id = ${categoryId},
        title = ${title},
        amount = ${amount},
        description = ${description || ""},
        type = ${type},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `

    const transaction = result[0]

    // Crear notificación
    await createNotification({
      userId,
      type: "transaction_updated",
      title: "Transacción actualizada",
      message: `${title}: $${amount.toLocaleString()}`,
      icon: "Edit"
    })

    return NextResponse.json(transaction, { status: 200 })
  } catch (error) {
    console.error("[v0] Update transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verificar que la transacción pertenece al usuario
    const existing = await sql`
      SELECT title, amount, type FROM transactions WHERE id = ${id} AND user_id = ${userId}
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const transaction = existing[0]

    await sql`
      DELETE FROM transactions 
      WHERE id = ${id} AND user_id = ${userId}
    `

    // Crear notificación
    await createNotification({
      userId,
      type: "transaction_deleted",
      title: "Transacción eliminada",
      message: `${transaction.title}: $${Number(transaction.amount).toLocaleString()}`,
      icon: "Trash2"
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Delete transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
