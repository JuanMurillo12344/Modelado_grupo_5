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
    const categoryId = searchParams.get("categoryId")
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Construir query dinámicamente
    let query = sql`
      SELECT t.*, c.name as category_name, c.icon, c.color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ${userId}
    `

    // Aplicar filtros
    if (month && year) {
      query = sql`${query} AND EXTRACT(MONTH FROM t.date) = ${month} AND EXTRACT(YEAR FROM t.date) = ${year}`
    }

    if (categoryId) {
      query = sql`${query} AND t.category_id = ${categoryId}`
    }

    if (type) {
      query = sql`${query} AND t.type = ${type}`
    }

    if (startDate) {
      query = sql`${query} AND t.date >= ${startDate}`
    }

    if (endDate) {
      query = sql`${query} AND t.date <= ${endDate}`
    }

    query = sql`${query} ORDER BY t.date DESC`

    const transactions = await query

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId, title, amount, description, type } = await request.json()

    if (!categoryId || !title || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO transactions (user_id, category_id, title, amount, description, type) 
      VALUES (${userId}, ${categoryId}, ${title}, ${amount}, ${description || ""}, ${type}) 
      RETURNING *
    `

    const transaction = result[0]

    // Crear notificación
    await createNotification({
      userId,
      type: type === "expense" ? "expense_added" : "income_added",
      title: type === "expense" ? "Gasto registrado" : "Ingreso registrado",
      message: `${title}: $${amount.toLocaleString()}`,
      icon: type === "expense" ? "TrendingDown" : "TrendingUp"
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("[v0] Create transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
