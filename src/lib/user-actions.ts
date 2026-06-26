'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from './db'
import { exigirPerfil } from './dal'

const UsuarioSchema = z.object({
  nome: z.string().trim().min(2, { message: 'Informe o nome.' }),
  email: z.string().email({ message: 'E-mail inválido.' }).trim().toLowerCase(),
  senha: z.string().min(8, { message: 'A senha deve ter ao menos 8 caracteres.' }),
  role: z.enum(['SUPER_ADMIN', 'USER']),
})

export interface UsuarioActionState {
  erro?: string
  ok?: string
}

export async function criarUsuario(
  _prev: UsuarioActionState | undefined,
  formData: FormData
): Promise<UsuarioActionState> {
  const admin = await exigirPerfil('SUPER_ADMIN')

  const parsed = UsuarioSchema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    senha: formData.get('senha'),
    role: formData.get('role'),
  })
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { nome, email, senha, role } = parsed.data

  const existente = await prisma.user.findUnique({ where: { email } })
  if (existente) {
    return { erro: `Já existe um usuário com o e-mail ${email}.` }
  }

  const passwordHash = await bcrypt.hash(senha, 12)
  await prisma.user.create({ data: { nome, email, passwordHash, role } })
  await prisma.auditLog.create({
    data: { acao: 'USUARIO_CRIAR', detalhe: `${email} (${role})`, userId: admin.id },
  })

  revalidatePath('/admin/usuarios')
  return { ok: `Usuário ${email} criado.` }
}

export async function alternarAtivoUsuario(formData: FormData): Promise<void> {
  const admin = await exigirPerfil('SUPER_ADMIN')
  const id = String(formData.get('id') ?? '')
  if (!id) return

  // Segurança: não permitir desativar a própria conta.
  if (id === admin.id) return

  const alvo = await prisma.user.findUnique({ where: { id } })
  if (!alvo) return

  await prisma.user.update({ where: { id }, data: { isActive: !alvo.isActive } })
  await prisma.auditLog.create({
    data: {
      acao: alvo.isActive ? 'USUARIO_DESATIVAR' : 'USUARIO_ATIVAR',
      detalhe: alvo.email,
      userId: admin.id,
    },
  })

  revalidatePath('/admin/usuarios')
}
