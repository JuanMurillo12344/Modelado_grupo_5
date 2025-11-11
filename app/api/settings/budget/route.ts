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

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { monthlyBudget, preferredCurrency } = await request.json()

    if (monthlyBudget === undefined || !preferredCurrency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      UPDATE users 
      SET 
        monthly_budget = ${monthlyBudget},
        preferred_currency = ${preferredCurrency},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING id, monthly_budget, preferred_currency
    `

    return NextResponse.json(result[0], { status: 200 })
  } catch (error) {
    console.error("[v0] Update budget error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
