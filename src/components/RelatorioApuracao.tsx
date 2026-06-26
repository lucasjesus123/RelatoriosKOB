'use client'

import { FormEvent, useState } from 'react'
import { GraficoApuracao } from './GraficoApuracao'
import type { RelatorioErro, RelatorioResposta } from '@/lib/types'

function formatarMoeda(valor: string): string {
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface ClienteOpcao {
  id: string
  nome: string
}

interface ClienteReconhecido {
  nome: string
  cnpj: string
  novo: boolean
}

export function RelatorioApuracao({ clientes }: { clientes: ClienteOpcao[] }) {
  const [arquivo1, setArquivo1] = useState<File | null>(null)
  const [arquivo2, setArquivo2] = useState<File | null>(null)
  const [clienteId, setClienteId] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [clienteReconhecido, setClienteReconhecido] = useState<ClienteReconhecido | null>(null)

  const clienteNome = clientes.find((c) => c.id === clienteId)?.nome ?? ''
  const [carregando, setCarregando] = useState(false)
  const [baixandoPdf, setBaixandoPdf] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [relatorio, setRelatorio] = useState<RelatorioResposta | null>(null)

  async function baixarPdf() {
    if (!relatorio) return
    setBaixandoPdf(true)
    setErro(null)
    try {
      const resposta = await fetch('/api/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relatorio,
          cliente: clienteNome || clienteReconhecido?.nome || '',
          periodo,
        }),
      })
      if (!resposta.ok) {
        setErro('Não foi possível gerar o PDF. Tente novamente.')
        return
      }
      const blob = await resposta.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'relatorio-apuracao-cfop.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setErro('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setBaixandoPdf(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!arquivo1) {
      setErro('Selecione ao menos um arquivo PDF antes de enviar.')
      return
    }

    setCarregando(true)
    setErro(null)
    setRelatorio(null)
    setClienteReconhecido(null)

    try {
      const formData = new FormData()
      formData.append('pdf1', arquivo1)
      if (arquivo2) {
        formData.append('pdf2', arquivo2)
      }
      if (clienteId) formData.append('clientId', clienteId)
      if (periodo) formData.append('periodo', periodo)

      const resposta = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      const dados = (await resposta.json()) as
        | (RelatorioResposta & { clienteReconhecido?: ClienteReconhecido | null })
        | RelatorioErro

      if (!resposta.ok || 'erro' in dados) {
        setErro('erro' in dados ? dados.erro : 'Erro ao processar os arquivos.')
        return
      }

      setRelatorio(dados)
      setClienteReconhecido(dados.clienteReconhecido ?? null)
    } catch {
      setErro('Não foi possível processar os arquivos. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const totalServicos =
    relatorio?.categorias.find((c) => c.categoria === 'SERVICOS')?.total ?? '0.00'

  const percentualNum = relatorio ? Number(relatorio.percentualX) : 0

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Apuração de CFOPs</h1>
        <p className="text-gray-600">
          Envie um ou dois PDFs com a listagem de CFOPs e valores para gerar o relatório de apuração.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">PDF 1</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setArquivo1(e.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-gray-300 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white file:hover:bg-blue-700"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">PDF 2 (opcional)</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setArquivo2(e.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-gray-300 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white file:hover:bg-blue-700"
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
              placeholder="Ex.: Janeiro/2026"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando ? 'Processando...' : 'Gerar relatório'}
        </button>

        {erro && <p className="text-sm font-medium text-red-600">{erro}</p>}
      </form>

      {relatorio && (
        <div className="space-y-8">
          {clienteReconhecido && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              Cliente reconhecido automaticamente pelo PDF:{' '}
              <strong>{clienteReconhecido.nome}</strong> (CNPJ {clienteReconhecido.cnpj})
              {clienteReconhecido.novo
                ? ' — cadastrado automaticamente.'
                : ' — vinculado ao cadastro existente.'}
            </div>
          )}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Relatório gerado. Baixe o PDF formatado para enviar ao cliente.</p>
            <button
              type="button"
              onClick={baixarPdf}
              disabled={baixandoPdf}
              className="shrink-0 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {baixandoPdf ? 'Gerando PDF...' : '↓ Baixar PDF'}
            </button>
          </div>

          {relatorio.categorias.map((categoria) => (
            <section key={categoria.categoria} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">{categoria.label}</h2>
              {categoria.itens.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum lançamento encontrado nesta categoria.</p>
              ) : (
                <ul className="space-y-1 text-sm text-gray-700">
                  {categoria.itens.map((item, idx) => (
                    <li key={`${item.cfop}-${idx}`}>
                      CFOP {item.cfop} - {item.descricao} - R$ {formatarMoeda(item.valor)}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 font-semibold text-gray-900">
                SOMA TOTAL DA CATEGORIA: R$ {formatarMoeda(categoria.total)}
              </p>
            </section>
          ))}

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-gray-900">
              SOMA GERAL ENTRADAS: R$ {formatarMoeda(relatorio.somaGeralEntradas)}
            </p>
            <p className="font-semibold text-gray-900">
              SOMA GERAL SAÍDAS: R$ {formatarMoeda(relatorio.somaGeralSaidas)}
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Gráfico comparativo</h2>
            <GraficoApuracao
              somaGeralEntradas={relatorio.somaGeralEntradas}
              somaGeralSaidas={relatorio.somaGeralSaidas}
              totalServicos={totalServicos}
            />
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Resumo</h2>
            {relatorio.resumoHumanizado.map((paragrafo, idx) => (
              <p key={idx} className="text-gray-700">{paragrafo}</p>
            ))}
            <p
              className={`text-center text-3xl font-bold ${
                percentualNum > 0 ? 'text-green-600' : percentualNum < 0 ? 'text-amber-600' : 'text-gray-900'
              }`}
            >
              PERCENTUAL X: {formatarMoeda(relatorio.percentualX)}%
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
