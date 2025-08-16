import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create the database connection
const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Minimal configuration for testing
const client = postgres(connectionString, { 
  prepare: false,
  ssl: 'prefer',
  max: 1,
})

export const db = drizzle(client, { schema })

// Export the schema for use in other files
export * from './schema'
