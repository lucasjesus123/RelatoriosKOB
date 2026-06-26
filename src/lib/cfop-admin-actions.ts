'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from './db'
import { exigirPerfil } from './dal'

const CATEGORIAS = ['VENDAS', 'DEVOLUCAO_VENDAS', 'ENTRADAS', 'DEVOLUCAO_ENTRADAS', 'SERVICOS'] as const
const NATUREZAS = ['ENTRADA', 'SAIDA'] as const

const CfopSchema = z.object({
  cfop: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^0-9]/g, ''))
    .refine((v) => /^[1-7]\d{3}$/.test(v), { message: 'CFOP deve ter 4 dígitos (ex.: 1102, 5101).' }),
  descricao: z.string().trim().min(3, { message: 'Descrição muito curta.' }),
  categoria: z.enum(CATEGORIAS),
  natureza: z.enum(NATUREZAS),
})

export interface CfopActionState {
  erro?: string
  ok?: string
}

export async function criarCfop(_prev: CfopActionState | undefined, formData: FormData): Promise<CfopActionState> {
  const admin = await exigirPerfil('SUPER_ADMIN')

  const parsed = CfopSchema.safeParse({
    cfop: formData.get('cfop'),
    descricao: formData.get('descricao'),
    categoria: formData.get('categoria'),
    natureza: formData.get('natureza'),
  })
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { cfop, descricao, categoria, natureza } = parsed.data

  const existente = await prisma.cfopMapping.findUnique({ where: { cfop } })
  if (existente) {
    return { erro: `O CFOP ${cfop} já está cadastrado.` }
  }

  await prisma.cfopMapping.create({ data: { cfop, descricao, categoria, natureza, ativo: true } })
  await prisma.auditLog.create({
    data: { acao: 'CFOP_CRIAR', detalhe: cfop, userId: admin.id },
  })

  revalidatePath('/admin')
  return { ok: `CFOP ${cfop} adicionado.` }
}

export async function atualizarCfop(_prev: CfopActionState | undefined, formData: FormData): Promise<CfopActionState> {
  const admin = await exigirPerfil('SUPER_ADMIN')

  const id = String(formData.get('id') ?? '')
  if (!id) return { erro: 'Registro inválido.' }

  const parsed = CfopSchema.safeParse({
    cfop: formData.get('cfop'),
    descricao: formData.get('descricao'),
    categoria: formData.get('categoria'),
    natureza: formData.get('natureza'),
  })
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { cfop, descricao, categoria, natureza } = parsed.data

  // Impede colidir com outro registro que já use o mesmo código.
  const outro = await prisma.cfopMapping.findUnique({ where: { cfop } })
  if (outro && outro.id !== id) {
    return { erro: `O CFOP ${cfop} já pertence a outro registro.` }
  }

  await prisma.cfopMapping.update({
    where: { id },
    data: { cfop, descricao, categoria, natureza },
  })
  await prisma.auditLog.create({
    data: { acao: 'CFOP_EDITAR', detalhe: cfop, userId: admin.id },
  })

  revalidatePath('/admin')
  return { ok: `CFOP ${cfop} atualizado.` }
}

export async function alternarAtivoCfop(formData: FormData): Promise<void> {
  const admin = await exigirPerfil('SUPER_ADMIN')
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const atual = await prisma.cfopMapping.findUnique({ where: { id } })
  if (!atual) return

  await prisma.cfopMapping.update({ where: { id }, data: { ativo: !atual.ativo } })
  await prisma.auditLog.create({
    data: {
      acao: atual.ativo ? 'CFOP_DESATIVAR' : 'CFOP_ATIVAR',
      detalhe: atual.cfop,
      userId: admin.id,
    },
  })

  revalidatePath('/admin')
}
