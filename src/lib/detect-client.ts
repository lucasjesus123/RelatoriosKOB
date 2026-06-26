export interface ClienteDetectado {
  cnpj: string // formatado: 00.000.000/0001-00
  nome: string | null
}

// CNPJ com ou sem pontuação: 00.000.000/0001-00 ou 00000000000100.
const CNPJ_REGEX = /(\d{2})\.?(\d{3})\.?(\d{3})\/?(\d{4})-?(\d{2})/

const ROTULOS_NOME =
  /(?:raz[ãa]o\s+social|nome\s+empresarial|nome\s+do\s+contribuinte|contribuinte|emitente|empresa)\s*[:\-]?\s*(.+)/i

function formatarCnpj(d: string[]): string {
  return `${d[1]}.${d[2]}.${d[3]}/${d[4]}-${d[5]}`
}

function limparNome(bruto: string): string | null {
  const nome = bruto
    .replace(/cnpj.*/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[|;]+/g, ' ')
    .trim()
  // Evita capturar lixo: precisa ter ao menos uma letra e tamanho razoável.
  if (nome.length < 3 || !/[a-zA-ZÀ-ÿ]/.test(nome)) return null
  return nome.slice(0, 120)
}

// Tenta identificar o cliente (CNPJ + razão social) a partir do texto do PDF.
// Estratégia tolerante a layouts: acha o primeiro CNPJ e busca o nome por
// rótulo conhecido, ou na mesma linha / linha anterior ao CNPJ.
export function detectarCliente(texto: string): ClienteDetectado | null {
  const match = texto.match(CNPJ_REGEX)
  if (!match) return null

  const cnpj = formatarCnpj(match)
  const linhas = texto.split(/\r?\n/)

  // 1) Procura por rótulo explícito em qualquer linha.
  for (const linha of linhas) {
    const m = linha.match(ROTULOS_NOME)
    if (m) {
      const nome = limparNome(m[1])
      if (nome) return { cnpj, nome }
    }
  }

  // 2) Procura a linha que contém o CNPJ e usa o texto antes dele.
  const idxLinhaCnpj = linhas.findIndex((l) => CNPJ_REGEX.test(l))
  if (idxLinhaCnpj >= 0) {
    const linha = linhas[idxLinhaCnpj]
    const antes = limparNome(linha.split(CNPJ_REGEX)[0] ?? '')
    if (antes) return { cnpj, nome: antes }

    // 3) Usa a linha anterior não vazia.
    for (let i = idxLinhaCnpj - 1; i >= 0 && i >= idxLinhaCnpj - 3; i--) {
      const nome = limparNome(linhas[i])
      if (nome) return { cnpj, nome }
    }
  }

  // CNPJ encontrado, mas sem nome confiável.
  return { cnpj, nome: null }
}
