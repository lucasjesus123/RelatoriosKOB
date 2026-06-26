import Link from 'next/link'
import { exigirPerfil } from '@/lib/dal'
import { AppHeader } from '@/components/AppHeader'

export default async function AdminPage() {
  const usuario = await exigirPerfil('SUPER_ADMIN')

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <AppHeader usuario={usuario} />
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-600">Área restrita ao Super Admin.</p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">
            As ferramentas de administração (gestão de usuários, edição do mapeamento de CFOP,
            histórico de relatórios e log de auditoria) serão habilitadas nas próximas fases.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
            ← Voltar para a apuração
          </Link>
        </section>
      </main>
    </div>
  )
}
