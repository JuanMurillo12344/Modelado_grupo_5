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

  const { searchParams } = new URL(request.url)
  const month = Number(searchParams.get("month"))
  const year = Number(searchParams.get("year"))

  if (!month || !year) {
    return NextResponse.json({ error: "Month and year required" }, { status: 400 })
  }

  try {
    const dailyActivity = await sql`
      SELECT 
        EXTRACT(DAY FROM date)::integer as day,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net
      FROM transactions
      WHERE user_id = ${userId}
        AND EXTRACT(YEAR FROM date) = ${year}
        AND EXTRACT(MONTH FROM date) = ${month}
      GROUP BY EXTRACT(DAY FROM date)
      ORDER BY day
    `

    const daily = dailyActivity.map(row => ({
      day: Number(row.day),
      income: Number(row.income),
      expenses: Number(row.expenses),
      net: Number(row.net),
    }))

    return NextResponse.json({ daily })
  } catch (error) {
    console.error("Error fetching daily activity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
