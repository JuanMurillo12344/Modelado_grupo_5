import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

function getSQL() {
  if (_sql) return _sql

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set")
  }

  // Agregar parámetro de zona horaria directamente en la URL de conexión
  const connectionString = process.env.DATABASE_URL.includes('?')
    ? `${process.env.DATABASE_URL}&options=-c%20timezone%3DAmerica/Guayaquil`
    : `${process.env.DATABASE_URL}?options=-c%20timezone%3DAmerica/Guayaquil`

  _sql = neon(connectionString)
  return _sql
}

export const sql = new Proxy({} as ReturnType<typeof neon>, {
  apply(target, thisArg, args: any[]) {
    return getSQL().apply(thisArg, args as any)
  },
  get(target, prop) {
    return getSQL()[prop as keyof ReturnType<typeof neon>]
  }
})

// Helper type for SQL query results
export type SQLResult<T = any> = T[]
