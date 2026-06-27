import { exigirUsuario } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { AppHeader } from '@/components/AppHeader'
import { RelatorioApuracao } from '@/components/RelatorioApuracao'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const usuario = await exigirUsuario()
  const clientes = await prisma.client.findMany({
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true },
  })

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader usuario={usuario} />
      <RelatorioApuracao clientes={clientes} />
    </div>
  )
}
