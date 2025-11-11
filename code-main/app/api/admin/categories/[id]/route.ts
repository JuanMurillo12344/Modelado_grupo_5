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
    const { name, icon, color, type } = await request.json()

    if (!name || !icon || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      UPDATE categories 
      SET 
        name = ${name},
        icon = ${icon},
        color = ${color},
        type = ${type}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(result[0], { status: 200 })
  } catch (error) {
    console.error("[v0] Update category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params

    // No permitir eliminar categorías por defecto
    const category = await sql`
      SELECT is_default FROM categories WHERE id = ${id}
    `

    if (category.length > 0 && category[0].is_default) {
      return NextResponse.json({ error: "Cannot delete default category" }, { status: 400 })
    }

    await sql`
      DELETE FROM categories WHERE id = ${id}
    `

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Delete category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
