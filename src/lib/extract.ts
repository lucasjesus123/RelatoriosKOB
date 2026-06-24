import { classificarLinha, ItemExtraido } from './calculations'

// Casa códigos CFOP no formato "1-101", "1.101" ou "1101" (um dígito de 1 a 7 seguido de 3 dígitos).
const CFOP_REGEX = /\b([1-7])[-.]?(\d{3})\b/
// Casa valores monetários no formato brasileiro: 1.234,56 ou 1234,56.
const VALOR_REGEX = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g

export function extrairItensDoTexto(texto: string): ItemExtraido[] {
  const itens: ItemExtraido[] = []
  const linhas = texto.split(/\r?\n/)

  for (const linha of linhas) {
    const cfopMatch = linha.match(CFOP_REGEX)
    if (!cfopMatch) continue

    const cfop = `${cfopMatch[1]}-${cfopMatch[2]}`

    const valoresMatches = [...linha.matchAll(VALOR_REGEX)]
    if (valoresMatches.length === 0) continue

    // Quando há mais de um valor na linha (ex: quantidade, unitário, total), usa o último,
    // que normalmente é o valor total da linha em relatórios de CFOP.
    const valorBruto = valoresMatches[valoresMatches.length - 1][1]

    const item = classificarLinha(cfop, valorBruto)
    if (item) itens.push(item)
  }

  return itens
}

export async function extrairTextoDoPdf(buffer: ArrayBuffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const resultado = await parser.getText()
    return resultado.text
  } finally {
    await parser.destroy()
  }
}
