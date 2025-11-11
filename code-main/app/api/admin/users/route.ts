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
    const users = await sql`
      SELECT id, email, full_name, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Admin get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
