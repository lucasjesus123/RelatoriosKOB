'use client'

import { FormEvent, useState } from 'react'
import type { ComparativoResultado } from '@/lib/comparativo'
import { formatarCfop } from '@/lib/pdf/format'

interface ClienteOpcao {
  id: string
  nome: string
}
interface ClienteReconhecido {
  nome: string
  cnpj: string
  novo: boolean
}
type Resposta = ComparativoResultado & {
  cnpj: string | null
  periodo: string | null
  reportId: string
  clienteReconhecido: ClienteReconhecido | null
}

function moeda(v: string): string {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ComparativoForm({ clientes }: { clientes: ClienteOpcao[] }) {
  const [pdfCfop, setPdfCfop] = useState<File | null>(null)
  const [pdfSimples, setPdfSimples] = useState<File | null>(null)
  const [clienteId, setClienteId] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [baixando, setBaixando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [res, setRes] = useState<Resposta | null>(null)

  const clienteNome = clientes.find((c) => c.id === clienteId)?.nome ?? ''

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!pdfCfop || !pdfSimples) {
      setErro('Envie os dois PDFs: o de CFOPs e o do Simples Nacional.')
      return
    }
    setCarregando(true)
    setErro(null)
    setRes(null)
    try {
      const fd = new FormData()
      fd.append('pdfCfop', pdfCfop)
      fd.append('pdfSimples', pdfSimples)
      if (clienteId) fd.append('clientId', clienteId)
      if (periodo) fd.append('periodo', periodo)
      const resp = await fetch('/api/comparativo', { method: 'POST', body: fd })
      const dados = await resp.json()
      if (!resp.ok || 'erro' in dados) {
        setErro(dados.erro ?? 'Erro ao processar os PDFs.')
        return
      }
      setRes(dados as Resposta)
    } catch {
      setErro('Não foi possível processar os PDFs. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  async function baixarPdf() {
    if (!res) return
    setBaixando(true)
    try {
      const resp = await fetch('/api/comparativo/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dados: res,
          cliente: clienteNome || res.clienteReconhecido?.nome || '',
          cnpj: res.cnpj ?? res.clienteReconhecido?.cnpj ?? '',
          periodo: res.periodo ?? periodo,
        }),
      })
      if (!resp.ok) {
        setErro('Falha ao gerar o PDF.')
        return
      }
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'comparativo-entradas-saidas.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">PDF 1 — CFOPs (Resumo das Operações)</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfCfop(e.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-gray-300 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">PDF 2 — Simples Nacional</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfSimples(e.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-gray-300 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Cliente (opcional)</span>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              <option value="">— Detectar automaticamente pelo PDF —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Período (opcional)</span>
            <input
              type="text"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              placeholder="Ex.: 01/2026"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {carregando ? 'Processando...' : 'Gerar comparativo'}
        </button>
        {erro && <p className="text-sm font-medium text-red-600">{erro}</p>}
      </form>

      {res && (
        <div className="space-y-6">
          {res.clienteReconhecido && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              Cliente reconhecido pelo PDF: <strong>{res.clienteReconhecido.nome}</strong> (CNPJ{' '}
              {res.clienteReconhecido.cnpj}){res.clienteReconhecido.novo ? ' — cadastrado automaticamente.' : '.'}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Comparativo gerado. Baixe o PDF para enviar ao cliente.</p>
            <button
              type="button"
              onClick={baixarPdf}
              disabled={baixando}
              className="shrink-0 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {baixando ? 'Gerando PDF...' : '↓ Baixar PDF'}
            </button>
          </div>

          <Grupo titulo="Entradas" itens={res.entradas} total={res.totalEntradas} />
          <Grupo titulo="Saídas (mercadorias)" itens={res.saidasMercadorias} total={res.totalSaidasMercadorias} />

          <section className="grid gap-4 sm:grid-cols-3">
            <Card titulo="Total de Entradas" valor={res.totalEntradas} />
            <Card titulo="Total de Saídas" valor={res.totalSaidas} />
            <Card titulo="Resultado (Saídas − Entradas)" valor={res.resultado} destaque />
          </section>

          {res.resumo && res.resumo.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Resumo do período</h2>
              {res.resumo.map((p, i) => (
                <p key={i} className="mb-2 text-sm leading-relaxed text-gray-700">
                  {p}
                </p>
              ))}
            </section>
          )}

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Valor do Simples Nacional (DAS)</p>
            <p className="text-3xl font-bold text-orange-600">R$ {moeda(res.valorSimples)}</p>
            <p className="mt-1 text-sm text-gray-600">Serviços (Simples): R$ {moeda(res.servicos)}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {res.temComercio && (
                <div className="rounded-lg bg-[#1d2c52] p-4 text-center text-white">
                  <p className="text-xs text-blue-200">% efetiva Vendas Comércio</p>
                  <p className="text-3xl font-bold">{moeda(res.percComercio)}%</p>
                </div>
              )}
              {res.temIndustria && (
                <div className="rounded-lg bg-[#1d2c52] p-4 text-center text-white">
                  <p className="text-xs text-blue-200">% efetiva Vendas Indústria</p>
                  <p className="text-3xl font-bold">{moeda(res.percIndustria)}%</p>
                </div>
              )}
              {res.temServicos && Number(res.servicos) > 0 && (
                <div className="rounded-lg bg-[#1d2c52] p-4 text-center text-white">
                  <p className="text-xs text-blue-200">% efetiva Serviços</p>
                  <p className="text-3xl font-bold">{moeda(res.percServicos)}%</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function Grupo({
  titulo,
  itens,
  total,
}: {
  titulo: string
  itens: { cfop: string; descricao: string; valor: string }[]
  total: string
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum lançamento.</p>
      ) : (
        <ul className="space-y-1 text-sm text-gray-700">
          {itens.map((i, idx) => (
            <li key={`${i.cfop}-${idx}`}>
              CFOP {formatarCfop(i.cfop)} — {i.descricao} — R$ {moeda(i.valor)}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 font-semibold text-gray-900">TOTAL: R$ {moeda(total)}</p>
    </section>
  )
}

function Card({ titulo, valor, destaque }: { titulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${destaque ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <p className="text-xs uppercase text-gray-500">{titulo}</p>
      <p className="text-xl font-bold text-gray-900">R$ {moeda(valor)}</p>
    </div>
  )
}
