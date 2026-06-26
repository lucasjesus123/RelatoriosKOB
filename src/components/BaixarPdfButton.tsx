'use client'

import { useState } from 'react'
import type { RelatorioResposta } from '@/lib/types'

export function BaixarPdfButton({
  relatorio,
  cliente,
  periodo,
  nomeArquivo = 'relatorio-apuracao-cfop.pdf',
}: {
  relatorio: RelatorioResposta
  cliente?: string
  periodo?: string
  nomeArquivo?: string
}) {
  const [baixando, setBaixando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function baixar() {
    setBaixando(true)
    setErro(null)
    try {
      const resposta = await fetch('/api/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatorio, cliente, periodo }),
      })
      if (!resposta.ok) {
        setErro('Falha ao gerar PDF.')
        return
      }
      const blob = await resposta.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeArquivo
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setErro('Falha ao gerar PDF.')
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={baixar}
        disabled={baixando}
        className="shrink-0 rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {baixando ? 'Gerando...' : '↓ PDF'}
      </button>
      {erro && <span className="mt-1 text-xs text-red-600">{erro}</span>}
    </div>
  )
}
