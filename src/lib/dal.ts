import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import type { Role, User } from '@prisma/client'
import { getSession } from './session'
import { prisma } from './db'

// Camada de acesso a dados (DAL): centraliza a verificação de autenticação e
// autorização perto da fonte de dados, como recomenda o guia do Next.js.
// É o ponto de defesa real — o proxy.ts faz apenas a checagem otimista.

export type UsuarioSeguro = Omit<User, 'passwordHash'>

export const obterUsuarioAtual = cache(async (): Promise<UsuarioSeguro | null> => {
  const session = await getSession()
  if (!session?.userId) return null

  const usuario = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  if (!usuario || !usuario.isActive) return null

  const { passwordHash: _omit, ...seguro } = usuario
  void _omit
  return seguro
})

export async function exigirUsuario(): Promise<UsuarioSeguro> {
  const usuario = await obterUsuarioAtual()
  if (!usuario) redirect('/login')
  return usuario
}

export async function exigirPerfil(role: Role): Promise<UsuarioSeguro> {
  const usuario = await exigirUsuario()
  if (usuario.role !== role) redirect('/')
  return usuario
}
