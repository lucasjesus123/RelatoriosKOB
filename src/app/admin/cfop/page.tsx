import Link from 'next/link'
import { exigirPerfil } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { AppHeader } from '@/components/AppHeader'
import { CfopCreateForm } from '@/components/admin/CfopCreateForm'
import { CfopRow } from '@/components/admin/CfopRow'

export const dynamic = 'force-dynamic'

export default async function AdminCfopPage() {
  const usuario = await exigirPerfil('SUPER_ADMIN')

  const cfops = await prisma.cfopMapping.findMany({
    orderBy: [{ ativo: 'desc' }, { cfop: 'asc' }],
  })

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader usuario={usuario} />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Mapeamento de CFOP</h1>
          <p className="text-gray-600">
            Apenas os CFOPs <strong>ativos</strong> entram na apuração. Códigos fora desta lista são ignorados.
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Adicionar CFOP</h2>
          <CfopCreateForm />
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            CFOPs cadastrados ({cfops.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-2 py-2 font-medium">CFOP</th>
                  <th className="px-2 py-2 font-medium">Descrição</th>
                  <th className="px-2 py-2 font-medium">Categoria</th>
                  <th className="px-2 py-2 font-medium">Natureza</th>
                  <th className="px-2 py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cfops.map((c) => (
                  <CfopRow
                    key={c.id}
                    item={{
                      id: c.id,
                      cfop: c.cfop,
                      descricao: c.descricao,
                      categoria: c.categoria,
                      natureza: c.natureza,
                      ativo: c.ativo,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Link href="/admin" className="inline-block text-sm font-medium text-blue-600 hover:underline">
          ← Administração
        </Link>
      </main>
    </div>
  )
}
