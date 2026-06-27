import { NextResponse } from 'next/server'
import { obterUsuarioAtual } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { apurar, ItemExtraido } from '@/lib/calculations'
import { extrairItensDoTexto, extrairTextoDoPdf } from '@/lib/extract'
import { carregarBuscadorCfop } from '@/lib/cfop-repo'
import { detectarCliente } from '@/lib/detect-client'
import { gerarResumoHumanizado } from '@/lib/humanize'
import { CATEGORIAS_ORDEM, CATEGORIA_LABEL } from '@/lib/cfop'
import { ErroUsuario, mensagemDeErroSegura } from '@/lib/errors'

const TAMANHO_MAXIMO_BYTES = 15 * 1024 * 1024 // 15MB por arquivo
const PDF_MAGIC_BYTES = '%PDF'

async function lerEValidarPdf(file: File): Promise<ArrayBuffer> {
  if (file.size === 0) {
    throw new ErroUsuario(`Arquivo "${file.name}" está vazio.`)
  }
  if (file.size > TAMANHO_MAXIMO_BYTES) {
    throw new ErroUsuario(`Arquivo "${file.name}" excede o limite de 15MB.`)
  }

  const buffer = await file.arrayBuffer()
  const header = new Uint8Array(buffer.slice(0, 4))
  const headerStr = String.fromCharCode(...header)

  if (headerStr !== PDF_MAGIC_BYTES) {
    throw new ErroUsuario(`Arquivo "${file.name}" não é um PDF válido.`)
  }

  return buffer
}

export async function POST(request: Request) {
  try {
    const usuario = await obterUsuarioAtual()
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })
    }

    const formData = await request.formData()
    const arquivo1 = formData.get('pdf1')
    const arquivo2 = formData.get('pdf2')
    const clientIdBruto = formData.get('clientId')
    const periodoBruto = formData.get('periodo')
    const clientId = typeof clientIdBruto === 'string' && clientIdBruto ? clientIdBruto : null
    const periodo = typeof periodoBruto === 'string' && periodoBruto.trim() ? periodoBruto.trim() : null

    if (!(arquivo1 instanceof File)) {
      return NextResponse.json(
        { erro: 'Envie ao menos um arquivo PDF no campo "pdf1".' },
        { status: 400 }
      )
    }

    const arquivos = [arquivo1, ...(arquivo2 instanceof File ? [arquivo2] : [])]

    const buffers = await Promise.all(arquivos.map(lerEValidarPdf))
    const textos = await Promise.all(buffers.map(extrairTextoDoPdf))

    const buscarCfop = await carregarBuscadorCfop()
    const itens: ItemExtraido[] = textos.flatMap((texto) => extrairItensDoTexto(texto, buscarCfop))

    if (itens.length === 0) {
      return NextResponse.json(
        { erro: 'Nenhum CFOP reconhecido foi encontrado nos PDFs enviados.' },
        { status: 422 }
      )
    }

    const apuracao = apurar(itens)
    const resumoHumanizado = gerarResumoHumanizado(
      apuracao.percentualX,
      apuracao.somaGeralEntradas,
      apuracao.somaGeralSaidas
    )

    const categorias = CATEGORIAS_ORDEM.map((categoria) => {
      const resumo = apuracao.categorias[categoria]
      return {
        categoria,
        label: CATEGORIA_LABEL[categoria],
        itens: resumo.itens.map((item) => ({
          cfop: item.cfop,
          descricao: item.descricao,
          valor: item.valor.toFixed(2),
        })),
        total: resumo.total.toFixed(2),
      }
    })

    const relatorio = {
      categorias,
      somaGeralEntradas: apuracao.somaGeralEntradas.toFixed(2),
      somaGeralSaidas: apuracao.somaGeralSaidas.toFixed(2),
      percentualX: apuracao.percentualX.toFixed(2),
      resumoHumanizado,
    }

    // Define o cliente do relatório. Prioridade para o que o usuário escolheu;
    // se não escolheu, tenta reconhecer o CNPJ/razão social dentro do PDF e,
    // se não existir, cadastra o cliente automaticamente.
    let clientIdValido: string | null = clientId
      ? (await prisma.client.findUnique({ where: { id: clientId } }))?.id ?? null
      : null

    let clienteReconhecido: { nome: string; cnpj: string; novo: boolean } | null = null

    if (!clientIdValido) {
      const detectado = detectarCliente(textos.join('\n'))
      if (detectado) {
        const existente = await prisma.client.findFirst({ where: { cnpj: detectado.cnpj } })
        if (existente) {
          clientIdValido = existente.id
          clienteReconhecido = { nome: existente.nome, cnpj: detectado.cnpj, novo: false }
        } else {
          const nome = detectado.nome ?? `Cliente ${detectado.cnpj}`
          const criado = await prisma.client.create({
            data: { nome, cnpj: detectado.cnpj },
          })
          clientIdValido = criado.id
          clienteReconhecido = { nome, cnpj: detectado.cnpj, novo: true }
        }
      }
    }

    const salvo = await prisma.report.create({
      data: {
        periodo,
        somaGeralEntradas: relatorio.somaGeralEntradas,
        somaGeralSaidas: relatorio.somaGeralSaidas,
        percentualX: relatorio.percentualX,
        dados: relatorio,
        userId: usuario.id,
        clientId: clientIdValido,
      },
      select: { id: true },
    })

    return NextResponse.json({ ...relatorio, reportId: salvo.id, clienteReconhecido })
  } catch (error) {
    return NextResponse.json(
      { erro: mensagemDeErroSegura(error, 'api/process') },
      { status: 400 }
    )
  }
}
