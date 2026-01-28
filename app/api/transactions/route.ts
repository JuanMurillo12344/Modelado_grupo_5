import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"

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

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")
    const categoryId = searchParams.get("categoryId")
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Construir query dinámicamente
    let query = sql`
      SELECT t.*, c.name as category_name, c.icon, c.color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ${userId}
    `

    // Aplicar filtros
    if (month && year) {
      query = sql`${query} AND EXTRACT(MONTH FROM t.date) = ${month} AND EXTRACT(YEAR FROM t.date) = ${year}`
    }

    if (categoryId) {
      query = sql`${query} AND t.category_id = ${categoryId}`
    }

    if (type) {
      query = sql`${query} AND t.type = ${type}`
    }

    if (startDate) {
      query = sql`${query} AND t.date >= ${startDate}`
    }

    if (endDate) {
      query = sql`${query} AND t.date <= ${endDate}`
    }

    query = sql`${query} ORDER BY t.date DESC`

    const transactions = await query

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId, title, amount, description, type, date } = await request.json()

    if (!categoryId || !title || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // VALIDACIÓN PARA GASTOS: Verificar presupuesto configurado y dinero disponible
    if (type === "expense") {
      const transactionDate = date ? new Date(date) : new Date()
      const month = transactionDate.getMonth() + 1
      const year = transactionDate.getFullYear()

      // Verificar que tenga presupuesto configurado
      const budgetConfig = await sql`
        SELECT id FROM monthly_budget_config
        WHERE user_id = ${userId}
          AND year = ${year}
          AND month = ${month}
      `

      // Si no hay configuración mensual, permitir fallback a presupuestos fijos por categoría
      const amountValue = Number(amount)

      if (budgetConfig.length === 0) {
        // Buscar presupuesto fijo para esta categoría
        const fixed = await sql`
          SELECT amount, period FROM budgets WHERE user_id = ${userId} AND category_id = ${categoryId}
        `

        if (fixed.length === 0) {
          return NextResponse.json({
            error: "Presupuesto no configurado",
            message: "Debes configurar tu presupuesto mensual o un presupuesto fijo por categoría antes de registrar gastos.",
            requiresBudget: true
          }, { status: 400 })
        }

        // Calcular asignado mensual según periodo
        const toMonthlyAmount = (amt: any, period: any) => {
          const a = Number(amt || 0)
          if (String(period) === 'week') return a * 4
          return a
        }

        const allocated = toMonthlyAmount(fixed[0].amount, fixed[0].period)

        // Calcular gasto ya realizado en esa categoría para el mes
        const categoryTotals = await sql`
          SELECT COALESCE(SUM(amount), 0) as spent
          FROM transactions
          WHERE user_id = ${userId}
            AND category_id = ${categoryId}
            AND type = 'expense'
            AND EXTRACT(MONTH FROM date) = ${month}
            AND EXTRACT(YEAR FROM date) = ${year}
        `

        const spentInCategory = parseFloat(categoryTotals[0]?.spent || '0')
        const availableInCategory = allocated - spentInCategory

        if (availableInCategory <= 0 || amountValue > availableInCategory) {
          return NextResponse.json({
            error: "Presupuesto de categoría excedido",
            message: `Este gasto ($${amountValue.toFixed(2)}) excede el presupuesto de la categoría ($${availableInCategory.toFixed(2)}).`,
            requiresBudget: true
          }, { status: 400 })
        }

        // Verificar dinero disponible del mes (balance general)
        const existingBalance = await sql`
          SELECT initial_balance 
          FROM monthly_balances 
          WHERE user_id = ${userId} AND year = ${year} AND month = ${month}
        `

        const totals = await sql`
          SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
          FROM transactions
          WHERE user_id = ${userId}
            AND EXTRACT(YEAR FROM date) = ${year}
            AND EXTRACT(MONTH FROM date) = ${month}
        `

        const initialBalance = existingBalance.length > 0 ? parseFloat(existingBalance[0].initial_balance) : 0
        const income = parseFloat(totals[0]?.income || '0')
        const expense = parseFloat(totals[0]?.expense || '0')
        const availableBalance = initialBalance + income - expense

        if (availableBalance <= 0 || amountValue > availableBalance) {
          return NextResponse.json({
            error: "Saldo insuficiente",
            message: `No puedes registrar este gasto. Tu dinero disponible es $${availableBalance.toFixed(2)}.`,
            requiresBalance: true
          }, { status: 400 })
        }
      } else {
        // Con configuración mensual existente comprobar disponibilidad por categoría primero
        const dist = await sql`
          SELECT allocated_amount FROM budget_category_distribution bcd
          INNER JOIN monthly_budget_config mbc ON bcd.budget_config_id = mbc.id
          WHERE mbc.user_id = ${userId} AND mbc.year = ${year} AND mbc.month = ${month} AND bcd.category_id = ${categoryId}
        `

        const allocated = dist.length > 0 ? Number(dist[0].allocated_amount) : 0

        // Calcular gasto ya realizado en esa categoría para el mes
        const categoryTotals = await sql`
          SELECT COALESCE(SUM(amount), 0) as spent
          FROM transactions
          WHERE user_id = ${userId}
            AND category_id = ${categoryId}
            AND type = 'expense'
            AND EXTRACT(MONTH FROM date) = ${month}
            AND EXTRACT(YEAR FROM date) = ${year}
        `

        const spentInCategory = parseFloat(categoryTotals[0]?.spent || '0')
        const availableInCategory = allocated - spentInCategory

        if (allocated > 0) {
          if (availableInCategory <= 0 || amountValue > availableInCategory) {
            return NextResponse.json({
              error: "Presupuesto de categoría excedido",
              message: `Este gasto ($${amountValue.toFixed(2)}) excede el presupuesto de la categoría ($${availableInCategory.toFixed(2)}).`,
              requiresBudget: true
            }, { status: 400 })
          }
          // Si la categoría tiene asignado suficiente, permitimos el gasto (no bloqueamos por balance mensual)
        } else {
          // Si la categoría no tiene asignación específica, caemos a chequear balance mensual
          const existingBalance = await sql`
            SELECT initial_balance 
            FROM monthly_balances 
            WHERE user_id = ${userId} AND year = ${year} AND month = ${month}
          `

          const totals = await sql`
            SELECT 
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions
            WHERE user_id = ${userId}
              AND EXTRACT(YEAR FROM date) = ${year}
              AND EXTRACT(MONTH FROM date) = ${month}
          `

          const initialBalance = existingBalance.length > 0 ? parseFloat(existingBalance[0].initial_balance) : 0
          const income = parseFloat(totals[0]?.income || '0')
          const expense = parseFloat(totals[0]?.expense || '0')
          const availableBalance = initialBalance + income - expense

          if (availableBalance <= 0 || amountValue > availableBalance) {
            return NextResponse.json({
              error: "Saldo insuficiente",
              message: `No puedes registrar este gasto. Tu dinero disponible es $${availableBalance.toFixed(2)}.`,
              requiresBalance: true
            }, { status: 400 })
          }
        }
      }
    }

    const result = await sql`
      INSERT INTO transactions (user_id, category_id, title, amount, description, type, date) 
      VALUES (${userId}, ${categoryId}, ${title}, ${amount}, ${description || ""}, ${type}, ${date || new Date()}) 
      RETURNING *
    `

    const transaction = result[0]

    // Crear notificación
    await createNotification({
      userId,
      type: type === "expense" ? "expense_added" : "income_added",
      title: type === "expense" ? "Gasto registrado" : "Ingreso registrado",
      message: `${title}: $${amount.toLocaleString()}`,
      icon: type === "expense" ? "TrendingDown" : "TrendingUp"
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("[v0] Create transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
