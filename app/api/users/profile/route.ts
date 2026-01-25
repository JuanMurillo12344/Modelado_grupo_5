import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

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

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email } = body

    // Validaciones
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Nombre y apellido son requeridos" },
        { status: 400 }
      )
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe (y no es el del usuario actual)
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE email = ${email} AND id != ${userId}
    ` as any[]

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Este email ya está en uso" },
        { status: 400 }
      )
    }

    // Actualizar el usuario
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    
    await sql`
      UPDATE users 
      SET full_name = ${fullName}, 
          email = ${email}, 
          updated_at = NOW() 
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Información actualizada correctamente",
      user: {
        fullName,
        email
      }
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Error al actualizar la información" },
      { status: 500 }
    )
  }
}
