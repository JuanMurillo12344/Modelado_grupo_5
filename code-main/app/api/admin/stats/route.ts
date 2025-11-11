import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("auth_token")?.value
  if (!token) return false
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    return decoded.role === "admin"
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Total users
    const usersResult = await sql`SELECT COUNT(*) as count FROM users`
    const totalUsers = Number.parseInt(usersResult[0].count)

    // Total transactions
    const transactionsResult = await sql`SELECT COUNT(*) as count FROM transactions`
    const totalTransactions = Number.parseInt(transactionsResult[0].count)

    // Total income
    const incomeResult = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'`
    const totalIncome = Number.parseFloat(incomeResult[0].total)

    // Total expenses
    const expenseResult = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'`
    const totalExpenses = Number.parseFloat(expenseResult[0].total)

    // Top categories
    const topCategories = await sql`
      SELECT c.name, c.icon, COUNT(t.id) as count, SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      GROUP BY c.id, c.name, c.icon
      ORDER BY total DESC
      LIMIT 5
    `

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalIncome,
      totalExpenses,
      topCategories,
    })
  } catch (error) {
    console.error("[v0] Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
