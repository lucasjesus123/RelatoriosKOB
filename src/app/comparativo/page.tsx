import { exigirUsuario } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { AppHeader } from '@/components/AppHeader'
import { ComparativoForm } from '@/components/ComparativoForm'

export const dynamic = 'force-dynamic'

export default async function ComparativoPage() {
  const usuario = await exigirUsuario()
  const clientes = await prisma.client.findMany({
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true },
  })

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader usuario={usuario} />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Comparativo de Entradas e Saídas</h1>
          <p className="text-gray-600">
            Envie o PDF de <strong>CFOPs</strong> (Resumo das Operações) e o PDF do{' '}
            <strong>Simples Nacional</strong>. O sistema lê os dois, reconhece o cliente e gera o comparativo
            com o valor do Simples e os percentuais efetivos.
          </p>
        </header>
        <ComparativoForm clientes={clientes} />
      </main>
    </div>
  )
}
