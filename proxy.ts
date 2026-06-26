import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

// Checagem otimista de autenticação. Esta é apenas a primeira barreira
// (redireciona quem não está logado); a verificação real acontece na DAL,
// perto dos dados. Aqui só lemos o cookie — sem acesso ao banco.
const rotasPublicas = ['/login']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const ehPublica = rotasPublicas.some((rota) => path === rota || path.startsWith(rota + '/'))

  const session = await decrypt(req.cookies.get('session')?.value)

  if (!ehPublica && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  // Não roda em assets estáticos nem nas rotas de API (a API valida via DAL).
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
