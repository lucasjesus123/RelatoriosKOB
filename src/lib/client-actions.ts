'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from './db'
import { exigirUsuario } from './dal'

const ClienteSchema = z.object({
  nome: z.string().trim().min(2, { message: 'Informe o nome do cliente.' }),
  cnpj: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
})

export interface ClienteActionState {
  erro?: string
  ok?: string
}

export async function criarCliente(
  _prev: ClienteActionState | undefined,
  formData: FormData
): Promise<ClienteActionState> {
  await exigirUsuario()

  const parsed = ClienteSchema.safeParse({
    nome: formData.get('nome'),
    cnpj: formData.get('cnpj'),
  })
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await prisma.client.create({
    data: { nome: parsed.data.nome, cnpj: parsed.data.cnpj ?? null },
  })

  revalidatePath('/clientes')
  revalidatePath('/')
  return { ok: `Cliente "${parsed.data.nome}" cadastrado.` }
}
