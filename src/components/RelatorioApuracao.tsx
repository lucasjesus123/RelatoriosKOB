'use client'

import { FormEvent, useState } from 'react'
import { GraficoApuracao } from './GraficoApuracao'
import type { RelatorioErro, RelatorioResposta } from '@/lib/types'

function formatarMoeda(valor: string): string {
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function RelatorioApuracao() {
  const [arquivo1, setArquivo1] = useState<File | null>(null)
  const [arquivo2, setArquivo2] = useState<File | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [relatorio, setRelatorio] = useState<RelatorioResposta | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!arquivo1 || !arquivo2) {
      setErro('Selecione os dois arquivos PDF antes de enviar.')
      return
    }

    setCarregando(true)
    setErro(null)
    setRelatorio(null)

    try {
      const formData = new FormData()
      formData.append('pdf1', arquivo1)
      formData.append('pdf2', arquivo2)

      const resposta = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      const dados = (await resposta.json()) as RelatorioResposta | RelatorioErro

      if (!resposta.ok || 'erro' in dados) {
        setErro('erro' in dados ? dados.erro : 'Erro ao processar os arquivos.')
        return
      }

      setRelatorio(dados)
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
          Envie os dois PDFs com a listagem de CFOPs e valores para gerar o relatório de apuração.
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
            <span className="mb-1 block text-sm font-medium text-gray-700">PDF 2</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setArquivo2(e.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-gray-300 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white file:hover:bg-blue-700"
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
