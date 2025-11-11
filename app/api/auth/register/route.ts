import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const passwordHash = hashPassword(password)

    const result = await sql`
      INSERT INTO users (email, password_hash, full_name) 
      VALUES (${email}, ${passwordHash}, ${fullName || "User"}) 
      RETURNING id, email, full_name
    `

    const user = result[0]

    // Create default categories for new user
    const defaultCategories = [
      { name: "Salario", icon: "💰", color: "#10b981", type: "income" },
      { name: "Freelance", icon: "💻", color: "#3b82f6", type: "income" },
      { name: "Comida", icon: "🍔", color: "#f59e0b", type: "expense" },
      { name: "Transporte", icon: "🚗", color: "#8b5cf6", type: "expense" },
      { name: "Entretenimiento", icon: "🎮", color: "#ec4899", type: "expense" },
      { name: "Educación", icon: "📚", color: "#06b6d4", type: "expense" },
      { name: "Salud", icon: "⚕️", color: "#ef4444", type: "expense" },
      { name: "Otros", icon: "📦", color: "#6b7280", type: "expense" },
    ]

    for (const cat of defaultCategories) {
      await sql`
        INSERT INTO categories (user_id, name, icon, color, type) 
        VALUES (${user.id}, ${cat.name}, ${cat.icon}, ${cat.color}, ${cat.type})
      `
    }

    return NextResponse.json({ user: { id: user.id, email: user.email, fullName: user.full_name } }, { status: 201 })
  } catch (error) {
    console.error("[v0] Auth register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
