import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

// Production: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
// Development: local SQLite file (file:./dev.db)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })
