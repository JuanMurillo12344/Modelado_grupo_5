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
  const userId = getUserIdFromCookie(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Obtener todos los meses únicos con transacciones
    const monthsData = await sql`
      SELECT DISTINCT
        EXTRACT(YEAR FROM date) as year,
        EXTRACT(MONTH FROM date) as month
      FROM transactions
      WHERE user_id = ${userId}
      ORDER BY year DESC, month DESC
    `

    const trends = []
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    for (const row of monthsData) {
      const year = Number(row.year)
      const month = Number(row.month)

      // Obtener ingresos y gastos de ese mes
      const summary = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
        FROM transactions
        WHERE user_id = ${userId}
          AND EXTRACT(YEAR FROM date) = ${year}
          AND EXTRACT(MONTH FROM date) = ${month}
      `

      trends.push({
        month,
        year,
        monthName: monthNames[month - 1],
        income: Number(summary[0].income),
        expenses: Number(summary[0].expenses),
      })
    }

    return NextResponse.json({ trends })
  } catch (error) {
    console.error("Error fetching monthly trends:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
