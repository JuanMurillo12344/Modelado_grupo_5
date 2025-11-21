import { sql } from "@/lib/db"

export interface NotificationData {
  userId: number
  type: "transaction" | "budget" | "system" | "alert" | 
        "expense_added" | "income_added" | "transaction_updated" | "transaction_deleted" |
        "budget_created" | "budget_updated" | "budget_deleted" | "budget_exceeded"
  title: string
  message: string
  icon?: string
}

export async function createNotification(data: NotificationData): Promise<void> {
  const { userId, type, title, message, icon = "🔔" } = data

  try {
    await sql`
      INSERT INTO notifications (user_id, type, title, message, icon, is_read, created_at)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${icon}, false, NOW())
    `
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}
