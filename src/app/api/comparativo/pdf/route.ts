import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { obterUsuarioAtual } from '@/lib/dal'
import { ComparativoPDF } from '@/lib/pdf/ComparativoPDF'
import type { ComparativoResultado } from '@/lib/comparativo'

export const runtime = 'nodejs'

async function carregarLogo(): Promise<string | null> {
  for (const nome of ['logo-kob-branco.png', 'logo-kob-branco.jpg', 'logo-kob.png', 'logo-kob.jpg']) {
    try {
      const buf = await readFile(path.join(process.cwd(), 'public', nome))
      const mime = nome.endsWith('.png') ? 'image/png' : 'image/jpeg'
      return `data:${mime};base64,${buf.toString('base64')}`
    } catch {
      // tenta o próximo
    }
  }
  return null
}

function dataHojeBR(): string {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export async function POST(request: Request) {
  const usuario = await obterUsuarioAtual()
  if (!usuario) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  let body: { dados?: ComparativoResultado; cliente?: string; cnpj?: string; periodo?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 })
  }

  if (!body.dados || !Array.isArray(body.dados.entradas)) {
    return NextResponse.json({ erro: 'Dados do comparativo ausentes.' }, { status: 400 })
  }

  const logoSrc = await carregarLogo()
  const buffer = await renderToBuffer(
    ComparativoPDF({
      dados: body.dados,
      meta: {
        cliente: body.cliente?.trim() || undefined,
        cnpj: body.cnpj?.trim() || undefined,
        periodo: body.periodo?.trim() || undefined,
        dataGeracao: dataHojeBR(),
        logoSrc,
      },
    })
  )

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="comparativo-entradas-saidas.pdf"',
    },
  })
}
