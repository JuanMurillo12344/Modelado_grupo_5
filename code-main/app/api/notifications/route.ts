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

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  const userId = getUserIdFromCookie(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"

    let query
    if (unreadOnly) {
      query = sql`
        SELECT * FROM notifications
        WHERE user_id = ${userId} AND is_read = false
        ORDER BY created_at DESC
        LIMIT 50
      `
    } else {
      query = sql`
        SELECT * FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 100
      `
    }

    const notifications = await query

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Crear notificación
export async function POST(request: NextRequest) {
  const userId = getUserIdFromCookie(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, title, message, icon } = body

    const result = await sql`
      INSERT INTO notifications (user_id, type, title, message, icon, is_read, created_at)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${icon || '🔔'}, false, NOW())
      RETURNING *
    `

    return NextResponse.json({ notification: result[0] })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Marcar como leída
export async function PATCH(request: NextRequest) {
  const userId = getUserIdFromCookie(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE user_id = ${userId} AND is_read = false
      `
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE id = ${notificationId} AND user_id = ${userId}
      `
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
