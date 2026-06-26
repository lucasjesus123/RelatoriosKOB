import 'dotenv/config'
import { PrismaClient, type CfopCategoria, type CfopNatureza } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { CFOP_DICIONARIO_RAW } from '../src/lib/cfop'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Natureza pela primeira casa do CFOP: 1/2/3 = entrada, 5/6/7 = saída.
function naturezaPorCodigo(cfop: string): CfopNatureza {
  return ['1', '2', '3'].includes(cfop[0]) ? 'ENTRADA' : 'SAIDA'
}

async function seedSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL
  const senha = process.env.SEED_SUPER_ADMIN_PASSWORD
  const nome = process.env.SEED_SUPER_ADMIN_NOME ?? 'Administrador'

  if (!email || !senha) {
    console.log('[seed] SEED_SUPER_ADMIN_EMAIL/PASSWORD não definidos — pulando criação do super admin.')
    return
  }

  const existente = await prisma.user.findUnique({ where: { email } })
  if (existente) {
    console.log(`[seed] Super admin "${email}" já existe — nada a fazer.`)
    return
  }

  const passwordHash = await bcrypt.hash(senha, 12)
  await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, nome, role: 'SUPER_ADMIN' },
  })
  console.log(`[seed] Super admin "${email}" criado.`)
}

async function seedCfop() {
  const entradas = Object.entries(CFOP_DICIONARIO_RAW)
  for (const [cfop, info] of entradas) {
    await prisma.cfopMapping.upsert({
      where: { cfop },
      // Não sobrescreve edições feitas pelo Super Admin: só garante existência.
      update: {},
      create: {
        cfop,
        descricao: info.descricao,
        categoria: info.categoria as CfopCategoria,
        natureza: naturezaPorCodigo(cfop),
        ativo: true,
      },
    })
  }
  console.log(`[seed] Mapeamento CFOP garantido (${entradas.length} códigos).`)
}

async function main() {
  await seedSuperAdmin()
  await seedCfop()
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
