'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from './db'
import { createSession, deleteSession, getSession } from './session'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Informe um e-mail válido.' }).trim().toLowerCase(),
  senha: z.string().min(1, { message: 'Informe a senha.' }),
})

export interface LoginState {
  erro?: string
}

// Rate limit simples em memória para frear força-bruta no login.
// (Em multi-instância, trocar por um store compartilhado — ver Fase 5.)
const tentativas = new Map<string, { count: number; ate: number }>()
const MAX_TENTATIVAS = 5
const JANELA_MS = 15 * 60 * 1000

function bloqueado(chave: string): boolean {
  const reg = tentativas.get(chave)
  if (!reg) return false
  if (Date.now() > reg.ate) {
    tentativas.delete(chave)
    return false
  }
  return reg.count >= MAX_TENTATIVAS
}

function registrarFalha(chave: string): void {
  const reg = tentativas.get(chave)
  if (!reg || Date.now() > reg.ate) {
    tentativas.set(chave, { count: 1, ate: Date.now() + JANELA_MS })
  } else {
    reg.count += 1
  }
}

export async function login(_prev: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    senha: formData.get('senha'),
  })

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { email, senha } = parsed.data

  if (bloqueado(email)) {
    return { erro: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }
  }

  const usuario = await prisma.user.findUnique({ where: { email } })

  // Mensagem genérica para não revelar se o e-mail existe.
  const credenciaisInvalidas = { erro: 'E-mail ou senha incorretos.' }

  if (!usuario || !usuario.isActive) {
    registrarFalha(email)
    return credenciaisInvalidas
  }

  const ok = await bcrypt.compare(senha, usuario.passwordHash)
  if (!ok) {
    registrarFalha(email)
    return credenciaisInvalidas
  }

  tentativas.delete(email)
  await createSession(usuario.id, usuario.role)
  await prisma.auditLog.create({
    data: { acao: 'LOGIN', userId: usuario.id },
  })

  redirect('/')
}

export async function logout(): Promise<void> {
  const session = await getSession()
  if (session?.userId) {
    await prisma.auditLog.create({ data: { acao: 'LOGOUT', userId: session.userId } })
  }
  await deleteSession()
  redirect('/login')
}
