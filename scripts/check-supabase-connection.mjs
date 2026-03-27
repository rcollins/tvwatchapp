import { Client } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is not set.')
  console.error('Set it and rerun: DATABASE_URL="..." npm run db:check')
  process.exit(1)
}

function normalizeConnectionString(raw) {
  try {
    // eslint-disable-next-line no-new
    new URL(raw)
    return raw
  } catch {
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

const client = new Client({
  connectionString: normalizeConnectionString(connectionString),
  ssl: {
    rejectUnauthorized: false,
  },
})

try {
  await client.connect()
  const result = await client.query(
    'select current_database() as db, current_user as db_user, now() as server_time',
  )
  const row = result.rows[0]
  console.log('Connected to Supabase Postgres.')
  console.log(`Database: ${row.db}`)
  console.log(`User: ${row.db_user}`)
  console.log(`Server time: ${row.server_time}`)
} catch (error) {
  console.error('Failed to connect to Supabase Postgres.')
  console.error(error.message)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
