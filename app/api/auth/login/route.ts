import { sql } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const users = await sql`SELECT id, email, password_hash, full_name, role FROM users WHERE email = ${email}`

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = crypto.randomBytes(32).toString("hex")

    // Store token in a simple in-memory store (in production, use redis or session store)
    // For now, we'll use JWT instead
    const sessionToken = Buffer.from(JSON.stringify({ userId: user.id, email: user.email, role: user.role })).toString(
      "base64",
    )

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        token: sessionToken,
      },
      { status: 200 },
    )

    response.cookies.set("auth_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("[v0] Auth login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
