import Link from 'next/link'
import { exigirPerfil } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { AppHeader } from '@/components/AppHeader'
import { UsuarioCreateForm } from '@/components/admin/UsuarioCreateForm'
import { alternarAtivoUsuario } from '@/lib/user-actions'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const admin = await exigirPerfil('SUPER_ADMIN')
  const usuarios = await prisma.user.findMany({ orderBy: [{ isActive: 'desc' }, { nome: 'asc' }] })

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <AppHeader usuario={admin} />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <Link href="/admin" className="text-sm font-medium text-blue-600 hover:underline">
            ← Administração
          </Link>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Novo usuário</h2>
          <UsuarioCreateForm />
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Cadastrados ({usuarios.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-2 py-2 font-medium">Nome</th>
                  <th className="px-2 py-2 font-medium">E-mail</th>
                  <th className="px-2 py-2 font-medium">Perfil</th>
                  <th className="px-2 py-2 font-medium">Situação</th>
                  <th className="px-2 py-2 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className={u.isActive ? '' : 'opacity-50'}>
                    <td className="px-2 py-2 text-gray-900">{u.nome}</td>
                    <td className="px-2 py-2 text-gray-700">{u.email}</td>
                    <td className="px-2 py-2 text-gray-700">
                      {u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Usuário'}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {u.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {u.id === admin.id ? (
                        <span className="text-xs text-gray-400">você</span>
                      ) : (
                        <form action={alternarAtivoUsuario} className="inline">
                          <input type="hidden" name="id" value={u.id} />
                          <button
                            type="submit"
                            className={`rounded-md px-3 py-1 text-xs font-medium ${
                              u.isActive
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {u.isActive ? 'Desativar' : 'Ativar'}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
