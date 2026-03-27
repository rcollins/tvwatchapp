import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { Client } from 'pg'

function loadEnvLocalIfNeeded() {
  if (process.env.DATABASE_URL) return

  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, 'utf8')
  const lines = content.split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const equalIdx = line.indexOf('=')
    if (equalIdx <= 0) continue
    const key = line.slice(0, equalIdx).trim()
    const value = line.slice(equalIdx + 1).trim()
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvLocalIfNeeded()

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set.')
  console.error('Add it to .env.local or run with DATABASE_URL="..." npm run db:schema')
  process.exit(1)
}

function normalizeConnectionString(raw) {
  try {
    // If already valid, keep as-is.
    // eslint-disable-next-line no-new
    new URL(raw)
    return raw
  } catch {
    // Try encoding only the password segment for common Postgres URL format.
    const schemeIdx = raw.indexOf('://')
    if (schemeIdx < 0) return raw
    const authStart = schemeIdx + 3
    const atIdx = raw.lastIndexOf('@')
    if (atIdx < authStart) return raw
    const colonIdx = raw.indexOf(':', authStart)
    if (colonIdx < 0 || colonIdx > atIdx) return raw

    const userPart = raw.slice(authStart, colonIdx)
    const passPart = raw.slice(colonIdx + 1, atIdx)
    const hostPart = raw.slice(atIdx + 1)
    const schemePart = raw.slice(0, authStart)

    return `${schemePart}${userPart}:${encodeURIComponent(passPart)}@${hostPart}`
  }
}

const migrationsDir = resolve(process.cwd(), 'supabase/migrations')
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()

const client = new Client({
  connectionString: normalizeConnectionString(connectionString),
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  for (const file of migrationFiles) {
    const sqlPath = resolve(migrationsDir, file)
    const sql = readFileSync(sqlPath, 'utf8')
    await client.query(sql)
    console.log(`Applied migration: ${file}`)
  }
  console.log('All migrations applied successfully.')
} catch (error) {
  console.error('Failed to apply schema.')
  console.error(error.message)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
