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

    // Obtener categorías globales (user_id IS NULL) y categorías personales del usuario
    const categories = await sql`
      SELECT * FROM categories 
      WHERE user_id = ${userId} OR user_id IS NULL 
      ORDER BY type, name
    `

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
