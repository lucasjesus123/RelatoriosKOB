import { NextResponse } from 'next/server'
import { apurar, ItemExtraido } from '@/lib/calculations'
import { extrairItensDoTexto, extrairTextoDoPdf } from '@/lib/extract'
import { gerarResumoHumanizado } from '@/lib/humanize'
import { CATEGORIAS_ORDEM, CATEGORIA_LABEL } from '@/lib/cfop'

const TAMANHO_MAXIMO_BYTES = 15 * 1024 * 1024 // 15MB por arquivo
const PDF_MAGIC_BYTES = '%PDF'

async function lerEValidarPdf(file: File): Promise<ArrayBuffer> {
  if (file.size === 0) {
    throw new Error(`Arquivo "${file.name}" está vazio.`)
  }
  if (file.size > TAMANHO_MAXIMO_BYTES) {
    throw new Error(`Arquivo "${file.name}" excede o limite de 15MB.`)
  }

  const buffer = await file.arrayBuffer()
  const header = new Uint8Array(buffer.slice(0, 4))
  const headerStr = String.fromCharCode(...header)

  if (headerStr !== PDF_MAGIC_BYTES) {
    throw new Error(`Arquivo "${file.name}" não é um PDF válido.`)
  }

  return buffer
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const arquivo1 = formData.get('pdf1')
    const arquivo2 = formData.get('pdf2')

    if (!(arquivo1 instanceof File) || !(arquivo2 instanceof File)) {
      return NextResponse.json(
        { erro: 'Envie os dois arquivos PDF nos campos "pdf1" e "pdf2".' },
        { status: 400 }
      )
    }

    const [buffer1, buffer2] = await Promise.all([
      lerEValidarPdf(arquivo1),
      lerEValidarPdf(arquivo2),
    ])

    const [texto1, texto2] = await Promise.all([
      extrairTextoDoPdf(buffer1),
      extrairTextoDoPdf(buffer2),
    ])

    const itens: ItemExtraido[] = [
      ...extrairItensDoTexto(texto1),
      ...extrairItensDoTexto(texto2),
    ]

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

    return NextResponse.json({
      categorias,
      somaGeralEntradas: apuracao.somaGeralEntradas.toFixed(2),
      somaGeralSaidas: apuracao.somaGeralSaidas.toFixed(2),
      percentualX: apuracao.percentualX.toFixed(2),
      resumoHumanizado,
    })
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido ao processar os PDFs.'
    return NextResponse.json({ erro: mensagem }, { status: 400 })
  }
}
