import Link from 'next/link'
import type { UsuarioSeguro } from '@/lib/dal'
import { logout } from '@/lib/auth-actions'

export function AppHeader({ usuario }: { usuario: UsuarioSeguro }) {
  const ehAdmin = usuario.role === 'SUPER_ADMIN'

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-gray-900">
          RelatóriosKOB
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-medium text-gray-600 hover:text-gray-900">
            Apuração
          </Link>
          <Link href="/comparativo" className="font-medium text-gray-600 hover:text-gray-900">
            Comparativo
          </Link>
          <Link href="/clientes" className="font-medium text-gray-600 hover:text-gray-900">
            Clientes
          </Link>
          <Link href="/historico" className="font-medium text-gray-600 hover:text-gray-900">
            Histórico
          </Link>
          {ehAdmin && (
            <Link href="/admin" className="font-medium text-blue-600 hover:underline">
              Administração
            </Link>
          )}
          <span className="mx-1 hidden h-5 w-px bg-gray-200 sm:inline-block" aria-hidden />
          <span className="hidden items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 sm:inline-flex">
            <span aria-hidden>👤</span>
            {usuario.nome}
            {ehAdmin && <span className="font-medium text-blue-600">· Super Admin</span>}
          </span>
          <form action={logout}>
            <button type="submit" className="font-medium text-gray-600 hover:text-gray-900">
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
