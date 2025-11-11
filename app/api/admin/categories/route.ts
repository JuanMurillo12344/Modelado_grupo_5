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
    const categories = await sql`SELECT * FROM categories ORDER BY type, name`

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("[v0] Admin get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { name, icon, color, type } = await request.json()

    const result = await sql`
      INSERT INTO categories (name, icon, color, type) 
      VALUES (${name}, ${icon}, ${color}, ${type}) 
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Admin create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
