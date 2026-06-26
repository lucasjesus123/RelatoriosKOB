import 'dotenv/config'
import path from 'node:path'
import { defineConfig, env } from 'prisma/config'

// Prisma 7 moveu a URL de conexão (usada por migrate/introspect) para cá.
// Em runtime, a aplicação conecta via driver adapter (@prisma/adapter-pg).
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
