import { exigirUsuario } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { AppHeader } from '@/components/AppHeader'
import { ClienteCreateForm } from '@/components/ClienteCreateForm'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const usuario = await exigirUsuario()
  const clientes = await prisma.client.findMany({ orderBy: { nome: 'asc' } })

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <AppHeader usuario={usuario} />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Cadastre os clientes para vincular aos relatórios gerados.</p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Novo cliente</h2>
          <ClienteCreateForm />
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Cadastrados ({clientes.length})
          </h2>
          {clientes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum cliente cadastrado ainda.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {clientes.map((c) => (
                <li key={c.id} className="flex justify-between py-2">
                  <span className="font-medium text-gray-900">{c.nome}</span>
                  <span className="text-gray-500">{c.cnpj ?? '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
