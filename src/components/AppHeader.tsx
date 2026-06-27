import Link from 'next/link'
import Image from 'next/image'
import type { UsuarioSeguro } from '@/lib/dal'
import { logout } from '@/lib/auth-actions'

export function AppHeader({ usuario }: { usuario: UsuarioSeguro }) {
  const ehAdmin = usuario.role === 'SUPER_ADMIN'

  return (
    <header className="bg-[#1d2c52] shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        {/* Logo da KOB sobre placa branca */}
        <Link href="/" className="flex items-center rounded-md bg-white px-3 py-1.5 shadow-sm">
          <Image src="/logo-kob.png" alt="KOB Contabilidade Estratégica" width={104} height={38} priority />
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <NavLink href="/comparativo">Comparativo</NavLink>
          <NavLink href="/clientes">Clientes</NavLink>
          <NavLink href="/historico">Histórico</NavLink>
          {ehAdmin && <NavLink href="/admin">Administração</NavLink>}

          <span className="mx-1 hidden h-5 w-px bg-white/20 sm:inline-block" aria-hidden />

          <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-blue-50 sm:inline-flex">
            {usuario.nome}
            {ehAdmin && <span className="font-semibold text-amber-300">· Super Admin</span>}
          </span>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  )
}
