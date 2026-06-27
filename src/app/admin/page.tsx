import Link from 'next/link'
import { exigirPerfil } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { AppHeader } from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const usuario = await exigirPerfil('SUPER_ADMIN')

  const [usuarios, cfops, clientes, reports] = await Promise.all([
    prisma.user.count(),
    prisma.cfopMapping.count({ where: { ativo: true } }),
    prisma.client.count(),
    prisma.report.count(),
  ])

  const cards = [
    {
      href: '/admin/usuarios',
      titulo: 'Usuários',
      desc: 'Criar usuários e administradores, ativar ou desativar acessos.',
      info: `${usuarios} cadastrado(s)`,
    },
    {
      href: '/admin/cfop',
      titulo: 'Mapeamento de CFOP',
      desc: 'Adicionar, editar e ativar/desativar os CFOPs da apuração.',
      info: `${cfops} ativo(s)`,
    },
    {
      href: '/clientes',
      titulo: 'Clientes',
      desc: 'Ver e cadastrar clientes vinculados aos relatórios.',
      info: `${clientes} cadastrado(s)`,
    },
    {
      href: '/historico',
      titulo: 'Histórico',
      desc: 'Todos os relatórios gerados no sistema.',
      info: `${reports} relatório(s)`,
    },
  ]

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader usuario={usuario} />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-600">Painel do Super Admin — gestão do sistema.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                  {c.titulo}
                </h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {c.info}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
