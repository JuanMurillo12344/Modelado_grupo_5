import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

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

// POST: Subir foto de perfil
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: 'No se proporcionó imagen' }, { status: 400 })
    }

    // Validar que sea base64 válido y del tamaño correcto
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Formato de imagen inválido' }, { status: 400 })
    }

    // Limitar tamaño (aproximadamente 2MB en base64)
    if (imageData.length > 3000000) {
      return NextResponse.json({ error: 'La imagen es demasiado grande (máx 2MB)' }, { status: 400 })
    }

    // Guardar en la base de datos
    await sql`
      UPDATE users
      SET profile_picture = ${imageData}
      WHERE id = ${userId}
    `

    return NextResponse.json({ 
      success: true,
      message: 'Foto de perfil actualizada'
    })

  } catch (error: any) {
    console.error('Error al subir foto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Eliminar foto de perfil
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    await sql`
      UPDATE users
      SET profile_picture = NULL
      WHERE id = ${userId}
    `

    return NextResponse.json({ 
      success: true,
      message: 'Foto de perfil eliminada'
    })

  } catch (error: any) {
    console.error('Error al eliminar foto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
