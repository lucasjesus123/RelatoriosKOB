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
          {ehAdmin && (
            <Link href="/admin" className="font-medium text-blue-600 hover:underline">
              Administração
            </Link>
          )}
          <span className="hidden text-gray-600 sm:inline">{usuario.nome}</span>
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
