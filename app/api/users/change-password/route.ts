import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { hashPassword, verifyPassword } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

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

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validaciones
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Se requiere la contraseña actual y la nueva" },
        { status: 400 }
      )
    }

    if (newPassword.length < 5) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 5 caracteres" },
        { status: 400 }
      )
    }

    // Obtener el usuario y su contraseña actual
    const users = await sql`
      SELECT id, password_hash 
      FROM users 
      WHERE id = ${userId}
    ` as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = users[0]

    // Verificar que la contraseña actual sea correcta
    if (!verifyPassword(currentPassword, user.password_hash)) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 401 }
      )
    }

    // Hashear la nueva contraseña
    const newPasswordHash = hashPassword(newPassword)

    // Actualizar la contraseña
    await sql`
      UPDATE users 
      SET password_hash = ${newPasswordHash}, 
          updated_at = NOW() 
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente"
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Error al cambiar la contraseña" },
      { status: 500 }
    )
  }
}
