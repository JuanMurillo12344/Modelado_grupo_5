import { neon } from '@neondatabase/serverless'

let _sql: ReturnType<typeof neon> | null = null

function getSQL() {
  if (!_sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set')
    }
    _sql = neon(databaseUrl, {
      fetchOptions: {
        cache: 'no-store',
      },
    })
  }
  return _sql
}

// Create a proxy to delay initialization
export const sql = new Proxy(
  {},
  {
    apply(_target, _thisArg, argumentsList: any[]) {
      return (getSQL() as any)(...argumentsList)
    },
    get(_target, prop) {
      return (getSQL() as any)[prop]
    },
  }
) as ReturnType<typeof neon>
