import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

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
    const month = searchParams.get("month") || new Date().getMonth() + 1
    const year = searchParams.get("year") || new Date().getFullYear()

    // Total income
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE user_id = ${userId} 
      AND type = 'income'
      AND EXTRACT(MONTH FROM date) = ${month} 
      AND EXTRACT(YEAR FROM date) = ${year}
    `

    // Total expenses
    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE user_id = ${userId} 
      AND type = 'expense'
      AND EXTRACT(MONTH FROM date) = ${month} 
      AND EXTRACT(YEAR FROM date) = ${year}
    `

    // Todas las categorías (ingresos y gastos)
    const byCategoryRaw = await sql`
      SELECT c.name, c.icon, c.color, t.type, SUM(t.amount) as total, COUNT(t.id) as count
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ${userId}
      AND EXTRACT(MONTH FROM t.date) = ${month} 
      AND EXTRACT(YEAR FROM t.date) = ${year}
      GROUP BY c.id, c.name, c.icon, c.color, t.type
      ORDER BY total DESC
    `

    // Total de transacciones del mes
    const transactionCountResult = await sql`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE user_id = ${userId}
      AND EXTRACT(MONTH FROM date) = ${month} 
      AND EXTRACT(YEAR FROM date) = ${year}
    `

    // Convertir los totales a números para evitar problemas
    const byCategory = byCategoryRaw.map(cat => ({
      ...cat,
      type: cat.type,
      total: Number.parseFloat(cat.total || 0),
      count: Number.parseInt(cat.count || 0)
    }))

    const totalIncome = Number.parseFloat(incomeResult[0].total)
    const totalExpenses = Number.parseFloat(expenseResult[0].total)
    const balance = totalIncome - totalExpenses
    const transactionCount = Number.parseInt(transactionCountResult[0].count || 0)
    const avgTransaction = transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      balance,
      byCategory,
      transactionCount,
      avgTransaction,
    })
  } catch (error) {
    console.error("[v0] Dashboard summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
