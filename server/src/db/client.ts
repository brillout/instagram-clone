import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema.js'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const dbPath = process.env.DATABASE_URL
  ? path.resolve(process.env.DATABASE_URL)
  : path.join(serverRoot, 'data.db')

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

/** Apply pending migrations from the generated ./drizzle folder. */
export function runMigrations() {
  migrate(db, { migrationsFolder: path.join(serverRoot, 'drizzle') })
}

export { schema }
