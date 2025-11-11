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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    
    let result
    
    if (body.hasOwnProperty('is_active') && !body.role) {
      // Solo actualizar is_active
      result = await sql`
        UPDATE users 
        SET is_active = ${body.is_active}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, email, full_name, role, is_active, created_at, updated_at
      `
    } else if (body.role && !body.hasOwnProperty('is_active')) {
      // Solo actualizar role
      result = await sql`
        UPDATE users 
        SET role = ${body.role}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, email, full_name, role, is_active, created_at, updated_at
      `
    } else if (body.hasOwnProperty('is_active') && body.role) {
      // Actualizar ambos
      result = await sql`
        UPDATE users 
        SET is_active = ${body.is_active}, role = ${body.role}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, email, full_name, role, is_active, created_at, updated_at
      `
    } else {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(result[0], { status: 200 })
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
