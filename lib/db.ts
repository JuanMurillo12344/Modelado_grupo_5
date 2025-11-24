import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Agregar parámetro de zona horaria directamente en la URL de conexión
const connectionString = process.env.DATABASE_URL.includes('?')
  ? `${process.env.DATABASE_URL}&options=-c%20timezone%3DAmerica/Guayaquil`
  : `${process.env.DATABASE_URL}?options=-c%20timezone%3DAmerica/Guayaquil`

const sql = neon(connectionString)

export { sql }
