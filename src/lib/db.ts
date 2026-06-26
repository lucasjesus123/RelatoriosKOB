import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Singleton do Prisma. Em dev o Next recarrega os módulos a cada alteração,
// então guardamos a instância em globalThis para não abrir conexões demais.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function criarPrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? criarPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
