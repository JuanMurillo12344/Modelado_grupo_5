import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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

// GET - Obtener balance disponible del mes actual
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Buscar balance mensual del mes actual
    const balance = await sql`
      SELECT initial_balance 
      FROM monthly_balances 
      WHERE user_id = ${userId} AND year = ${year} AND month = ${month}
    ` as any[]

    const transactions = await sql`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ${userId}
        AND EXTRACT(YEAR FROM date) = ${year}
        AND EXTRACT(MONTH FROM date) = ${month}
    ` as any[]

    const initialBalance = balance.length > 0 ? parseFloat(balance[0].initial_balance) : 0
    const income = parseFloat(transactions[0]?.income || '0')
    const expense = parseFloat(transactions[0]?.expense || '0')
    const availableBalance = initialBalance + income - expense

    return NextResponse.json({
      availableBalance,
      initialBalance,
      income,
      expense
    })
  } catch (error) {
    console.error("Error al obtener balance:", error)
    return NextResponse.json(
      { error: "Error al obtener balance" },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar balance inicial del mes actual
export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      )
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Actualizar o crear el balance mensual del mes actual
    await sql`
      INSERT INTO monthly_balances (user_id, year, month, initial_balance, updated_at)
      VALUES (${userId}, ${year}, ${month}, ${amount}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, year, month)
      DO UPDATE SET initial_balance = ${amount}, updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({
      success: true,
      initialBalance: amount,
      month: `${month}/${year}`
    })
  } catch (error) {
    console.error("Error al actualizar balance:", error)
    return NextResponse.json(
      { error: "Error al actualizar balance" },
      { status: 500 }
    )
  }
}
