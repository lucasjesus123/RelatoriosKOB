import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { obterUsuarioAtual } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { extrairTextoDoPdf } from '@/lib/extract'
import { carregarBuscadorCfop } from '@/lib/cfop-repo'
import { extrairCfopsDoResumo } from '@/lib/cfop-resumo'
import { parseSimplesNacional, parseSimplesIdentificacao } from '@/lib/simples'
import { montarComparativo } from '@/lib/comparativo'
import { gerarResumoComparativo } from '@/lib/humanize-comparativo'

export const runtime = 'nodejs'

const TAMANHO_MAXIMO_BYTES = 15 * 1024 * 1024
const PDF_MAGIC_BYTES = '%PDF'

async function lerEValidarPdf(file: File): Promise<ArrayBuffer> {
  if (file.size === 0) throw new Error(`Arquivo "${file.name}" está vazio.`)
  if (file.size > TAMANHO_MAXIMO_BYTES) throw new Error(`Arquivo "${file.name}" excede o limite de 15MB.`)
  const buffer = await file.arrayBuffer()
  const header = String.fromCharCode(...new Uint8Array(buffer.slice(0, 4)))
  if (header !== PDF_MAGIC_BYTES) throw new Error(`Arquivo "${file.name}" não é um PDF válido.`)
  return buffer
}

export async function POST(request: Request) {
  try {
    const usuario = await obterUsuarioAtual()
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })
    }

    const formData = await request.formData()
    const pdfCfop = formData.get('pdfCfop')
    const pdfSimples = formData.get('pdfSimples')
    const clientIdBruto = formData.get('clientId')
    const periodoBruto = formData.get('periodo')

    if (!(pdfCfop instanceof File)) {
      return NextResponse.json({ erro: 'Envie o PDF de CFOPs no campo "pdfCfop".' }, { status: 400 })
    }
    if (!(pdfSimples instanceof File)) {
      return NextResponse.json({ erro: 'Envie o PDF do Simples Nacional no campo "pdfSimples".' }, { status: 400 })
    }

    const [bufCfop, bufSimples] = await Promise.all([lerEValidarPdf(pdfCfop), lerEValidarPdf(pdfSimples)])
    const [textoCfop, textoSimples] = await Promise.all([
      extrairTextoDoPdf(bufCfop),
      extrairTextoDoPdf(bufSimples),
    ])

    const buscarCfop = await carregarBuscadorCfop()
    const itens = extrairCfopsDoResumo(textoCfop, buscarCfop)
    const simples = parseSimplesNacional(textoSimples)
    const comparativo = montarComparativo(itens, simples)
    comparativo.resumo = gerarResumoComparativo(comparativo)

    if (itens.length === 0 && simples.valorSimples.isZero()) {
      return NextResponse.json(
        { erro: 'Não consegui reconhecer CFOPs nem dados do Simples Nacional nos PDFs enviados.' },
        { status: 422 }
      )
    }

    // Identificação do cliente (do extrato do Simples) e período.
    const ident = parseSimplesIdentificacao(textoSimples)
    const periodo =
      (typeof periodoBruto === 'string' && periodoBruto.trim()) || ident.periodo || null

    // Cliente: escolha manual tem prioridade; senão usa o CNPJ do extrato.
    let clientId = typeof clientIdBruto === 'string' && clientIdBruto ? clientIdBruto : null
    if (clientId) {
      clientId = (await prisma.client.findUnique({ where: { id: clientId } }))?.id ?? null
    }
    let clienteReconhecido: { nome: string; cnpj: string; novo: boolean } | null = null
    if (!clientId && ident.cnpj) {
      const existente = await prisma.client.findFirst({ where: { cnpj: ident.cnpj } })
      if (existente) {
        clientId = existente.id
        clienteReconhecido = { nome: existente.nome, cnpj: ident.cnpj, novo: false }
      } else {
        const nome = ident.empresa ?? `Cliente ${ident.cnpj}`
        const criado = await prisma.client.create({ data: { nome, cnpj: ident.cnpj } })
        clientId = criado.id
        clienteReconhecido = { nome, cnpj: ident.cnpj, novo: true }
      }
    }

    const dados = {
      tipo: 'comparativo' as const,
      ...comparativo,
      cnpj: ident.cnpj ?? null,
    }

    const salvo = await prisma.report.create({
      data: {
        periodo,
        somaGeralEntradas: comparativo.totalEntradas,
        somaGeralSaidas: comparativo.totalSaidas,
        percentualX: comparativo.resultado,
        dados: dados as unknown as Prisma.InputJsonValue,
        userId: usuario.id,
        clientId,
      },
      select: { id: true },
    })

    return NextResponse.json({
      ...comparativo,
      cnpj: ident.cnpj ?? null,
      periodo,
      reportId: salvo.id,
      clienteReconhecido,
    })
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido ao processar os PDFs.'
    return NextResponse.json({ erro: mensagem }, { status: 400 })
  }
}
