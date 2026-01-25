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

// GET: Obtener balance mensual (o calcularlo si no existe)
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    // Buscar balance mensual guardado
    const existingBalance = await sql`
      SELECT initial_balance 
      FROM monthly_balances 
      WHERE user_id = ${userId} AND year = ${year} AND month = ${month}
    ` as any[]

    if (existingBalance.length > 0) {
      // Calcular balance disponible = inicial + ingresos - gastos del mes
      const transactions = await sql`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = ${userId}
          AND EXTRACT(YEAR FROM date) = ${year}
          AND EXTRACT(MONTH FROM date) = ${month}
      ` as any[]

      const income = parseFloat(transactions[0]?.income || '0')
      const expense = parseFloat(transactions[0]?.expense || '0')
      const initialBalance = parseFloat(existingBalance[0].initial_balance)
      const availableBalance = initialBalance + income - expense

      return NextResponse.json({
        year,
        month,
        initialBalance,
        income,
        expense,
        availableBalance,
        hasCustomBalance: true
      })
    }

    // Si no existe, retornar balance inicial en 0
    const currentTransactions = await sql`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ${userId}
        AND EXTRACT(YEAR FROM date) = ${year}
        AND EXTRACT(MONTH FROM date) = ${month}
    ` as any[]

    const currentIncome = parseFloat(currentTransactions[0]?.income || '0')
    const currentExpense = parseFloat(currentTransactions[0]?.expense || '0')
    const availableBalance = 0 + currentIncome - currentExpense

    return NextResponse.json({
      year,
      month,
      initialBalance: 0,
      income: currentIncome,
      expense: currentExpense,
      availableBalance,
      hasCustomBalance: false
    })

  } catch (error: any) {
    console.error('Error al obtener balance mensual:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Establecer balance inicial del mes
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { year, month, initialBalance } = await request.json()

    if (!year || !month || initialBalance === undefined) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Insertar o actualizar balance mensual
    await sql`
      INSERT INTO monthly_balances (user_id, year, month, initial_balance, updated_at)
      VALUES (${userId}, ${year}, ${month}, ${initialBalance}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, year, month)
      DO UPDATE SET initial_balance = ${initialBalance}, updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Balance mensual actualizado',
      year,
      month,
      initialBalance
    })

  } catch (error: any) {
    console.error('Error al guardar balance mensual:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
