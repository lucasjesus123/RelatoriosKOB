import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { obterUsuarioAtual } from '@/lib/dal'
import { RelatorioPDF } from '@/lib/pdf/RelatorioPDF'
import type { RelatorioResposta } from '@/lib/types'

export const runtime = 'nodejs'

// Lê o logo da KOB de public/ e devolve como data URI; se não existir,
// retorna null e o PDF usa o texto "KOB" como fallback.
async function carregarLogo(): Promise<string | null> {
  // Prefere a versão branca do logo (cabeçalho é azul-marinho).
  const candidatos = [
    'logo-kob-branco.png',
    'logo-kob-branco.jpg',
    'logo-kob.png',
    'logo-kob.jpg',
    'logo-kob.jpeg',
  ]
  for (const nome of candidatos) {
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
  if (!usuario) {
    return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })
  }

  let body: { relatorio?: RelatorioResposta; cliente?: string; periodo?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 })
  }

  const relatorio = body.relatorio
  if (!relatorio || !Array.isArray(relatorio.categorias)) {
    return NextResponse.json({ erro: 'Relatório ausente ou inválido.' }, { status: 400 })
  }

  const logoSrc = await carregarLogo()

  const buffer = await renderToBuffer(
    RelatorioPDF({
      relatorio,
      meta: {
        cliente: body.cliente?.trim() || undefined,
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
      'Content-Disposition': 'attachment; filename="relatorio-apuracao-cfop.pdf"',
    },
  })
}
