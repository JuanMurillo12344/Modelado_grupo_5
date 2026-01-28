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

/**
 * GET - Obtener configuración de presupuesto mensual
 * Query params: month, year
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    if (!month || !year) {
      return NextResponse.json(
        { error: "Se requieren mes y año" },
        { status: 400 }
      )
    }

    // Obtener configuración de presupuesto
    const config = await sql`
      SELECT 
        id,
        user_id,
        year,
        month,
        total_budget,
        savings_amount,
        available_for_expenses,
        created_at,
        updated_at
      FROM monthly_budget_config
      WHERE user_id = ${userId}
        AND year = ${year}
        AND month = ${month}
    `

    if (config.length === 0) {
      return NextResponse.json({
        configured: false,
        message: "No hay presupuesto configurado para este mes"
      })
    }

    const budgetConfig = config[0]

    // Obtener distribución por categorías
    const distribution = await sql`
      SELECT 
        bcd.id,
        bcd.category_id,
        bcd.allocated_amount,
        c.name as category_name,
        c.icon,
        c.color,
        c.type
      FROM budget_category_distribution bcd
      INNER JOIN categories c ON bcd.category_id = c.id
      WHERE bcd.budget_config_id = ${budgetConfig.id}
      ORDER BY c.name
    `

    // Calcular gastos reales por categoría
    const expenses = await sql`
      SELECT 
        category_id,
        COALESCE(SUM(amount), 0) as spent
      FROM transactions
      WHERE user_id = ${userId}
        AND type = 'expense'
        AND EXTRACT(MONTH FROM date) = ${month}
        AND EXTRACT(YEAR FROM date) = ${year}
      GROUP BY category_id
    `

    const expenseMap = new Map(
      expenses.map((e: any) => [e.category_id, Number(e.spent)])
    )

    // Combinar distribución con gastos reales
    const categories = distribution.map((d: any) => {
      const allocated = Number(d.allocated_amount)
      const spent: number = Number(expenseMap.get(d.category_id) ?? 0)
      const remaining = allocated - spent
      const percentage = allocated > 0 
        ? Math.round((spent / allocated) * 100)
        : 0
      
      return {
        id: d.id,
        categoryId: d.category_id,
        categoryName: d.category_name,
        icon: d.icon,
        color: d.color,
        allocated,
        spent,
        remaining,
        percentage
      }
    })

    const totalAllocated = categories.reduce((sum: number, c: any) => sum + c.allocated, 0)
    const totalSpent = categories.reduce((sum: number, c: any) => sum + c.spent, 0)

    return NextResponse.json({
      configured: true,
      config: {
        id: budgetConfig.id,
        totalBudget: Number(budgetConfig.total_budget),
        savingsAmount: Number(budgetConfig.savings_amount),
        availableForExpenses: Number(budgetConfig.available_for_expenses),
        totalAllocated,
        unallocated: Number(budgetConfig.available_for_expenses) - totalAllocated,
        totalSpent,
        remaining: Number(budgetConfig.available_for_expenses) - totalSpent,
        createdAt: budgetConfig.created_at,
        updatedAt: budgetConfig.updated_at
      },
      categories
    })
  } catch (error: any) {
    console.error("Error al obtener presupuesto:", error)
    return NextResponse.json(
      { error: "Error al obtener presupuesto", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST - Crear o actualizar configuración de presupuesto mensual
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { month, year, totalBudget, savingsAmount, categories } = body

    // Validaciones básicas
    if (!month || !year || totalBudget === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: month, year, totalBudget" },
        { status: 400 }
      )
    }

    const total = Number(totalBudget)
    const savings = Number(savingsAmount || 0)

    if (total < 0) {
      return NextResponse.json(
        { error: "El presupuesto total debe ser mayor o igual a 0" },
        { status: 400 }
      )
    }

    if (savings < 0) {
      return NextResponse.json(
        { error: "El ahorro debe ser mayor o igual a 0" },
        { status: 400 }
      )
    }

    if (savings > total) {
      return NextResponse.json(
        { error: "El ahorro mensual no puede superar el presupuesto general" },
        { status: 400 }
      )
    }

    const available = total - savings

    // Validar suma de categorías si se proporcionan
    if (categories && Array.isArray(categories)) {
      const totalCategoriesAmount = categories.reduce(
        (sum, cat) => sum + Number(cat.amount || 0),
        0
      )
      
      if (totalCategoriesAmount > available) {
        return NextResponse.json(
          { 
            error: "La suma de presupuestos por categoría excede el presupuesto disponible",
            details: {
              available,
              totalCategoriesAmount,
              difference: totalCategoriesAmount - available
            }
          },
          { status: 400 }
        )
      }
    }

    // Verificar si ya existe configuración para este mes
    const existing = await sql`
      SELECT id FROM monthly_budget_config
      WHERE user_id = ${userId}
        AND year = ${year}
        AND month = ${month}
    `

    let budgetConfigId

    if (existing.length > 0) {
      // Actualizar configuración existente
      const result = await sql`
        UPDATE monthly_budget_config
        SET 
          total_budget = ${total},
          savings_amount = ${savings},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING id
      `
      budgetConfigId = result[0].id

      // Eliminar distribución anterior si se proporciona nueva
      if (categories && Array.isArray(categories)) {
        await sql`
          DELETE FROM budget_category_distribution
          WHERE budget_config_id = ${budgetConfigId}
        `
      }
    } else {
      // Crear nueva configuración
      const result = await sql`
        INSERT INTO monthly_budget_config (
          user_id,
          year,
          month,
          total_budget,
          savings_amount
        ) VALUES (
          ${userId},
          ${year},
          ${month},
          ${total},
          ${savings}
        )
        RETURNING id
      `
      budgetConfigId = result[0].id
    }

    // Insertar distribución por categorías si se proporciona
    if (categories && Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        if (cat.categoryId && cat.amount !== undefined) {
          await sql`
            INSERT INTO budget_category_distribution (
              budget_config_id,
              category_id,
              allocated_amount
            ) VALUES (
              ${budgetConfigId},
              ${cat.categoryId},
              ${Number(cat.amount)}
            )
            ON CONFLICT (budget_config_id, category_id)
            DO UPDATE SET
              allocated_amount = ${Number(cat.amount)},
              updated_at = CURRENT_TIMESTAMP
          `
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: existing.length > 0 
        ? "Presupuesto actualizado correctamente"
        : "Presupuesto creado correctamente",
      budgetConfigId
    })
  } catch (error: any) {
    console.error("Error al guardar presupuesto:", error)
    return NextResponse.json(
      { error: "Error al guardar presupuesto", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar configuración de presupuesto mensual
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromCookie(request)
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    if (!month || !year) {
      return NextResponse.json(
        { error: "Se requieren mes y año" },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM monthly_budget_config
      WHERE user_id = ${userId}
        AND year = ${year}
        AND month = ${month}
    `

    return NextResponse.json({
      success: true,
      message: "Presupuesto eliminado correctamente"
    })
  } catch (error: any) {
    console.error("Error al eliminar presupuesto:", error)
    return NextResponse.json(
      { error: "Error al eliminar presupuesto", details: error.message },
      { status: 500 }
    )
  }
}
