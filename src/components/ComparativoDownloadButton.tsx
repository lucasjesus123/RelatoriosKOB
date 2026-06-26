'use client'

import { useState } from 'react'
import type { ComparativoResultado } from '@/lib/comparativo'

export function ComparativoDownloadButton({
  dados,
  cliente,
  cnpj,
  periodo,
  nomeArquivo = 'comparativo-entradas-saidas.pdf',
}: {
  dados: ComparativoResultado
  cliente?: string
  cnpj?: string
  periodo?: string
  nomeArquivo?: string
}) {
  const [baixando, setBaixando] = useState(false)

  async function baixar() {
    setBaixando(true)
    try {
      const resp = await fetch('/api/comparativo/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados, cliente, cnpj, periodo }),
      })
      if (!resp.ok) return
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeArquivo
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setBaixando(false)
    }
  }

  return (
    <button
      type="button"
      onClick={baixar}
      disabled={baixando}
      className="shrink-0 rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
    >
      {baixando ? 'Gerando...' : '↓ PDF'}
    </button>
  )
}
