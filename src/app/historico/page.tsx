import { exigirUsuario } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { AppHeader } from '@/components/AppHeader'
import { BaixarPdfButton } from '@/components/BaixarPdfButton'
import { ComparativoDownloadButton } from '@/components/ComparativoDownloadButton'
import { formatarMoedaBR } from '@/lib/pdf/format'
import type { RelatorioResposta } from '@/lib/types'
import type { ComparativoResultado } from '@/lib/comparativo'

export const dynamic = 'force-dynamic'

export default async function HistoricoPage() {
  const usuario = await exigirUsuario()
  const ehAdmin = usuario.role === 'SUPER_ADMIN'

  // Super Admin vê todos os relatórios; usuário comum vê apenas os seus.
  const reports = await prisma.report.findMany({
    where: ehAdmin ? {} : { userId: usuario.id },
    orderBy: { createdAt: 'desc' },
    include: { client: true, user: true },
    take: 200,
  })

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader usuario={usuario} />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Histórico de relatórios</h1>
          <p className="text-gray-600">
            {ehAdmin ? 'Todos os relatórios gerados.' : 'Relatórios que você gerou.'}
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {reports.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum relatório gerado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="px-2 py-2 font-medium">Data</th>
                    <th className="px-2 py-2 font-medium">Cliente</th>
                    <th className="px-2 py-2 font-medium">Período</th>
                    {ehAdmin && <th className="px-2 py-2 font-medium">Usuário</th>}
                    <th className="px-2 py-2 text-right font-medium">Entradas</th>
                    <th className="px-2 py-2 text-right font-medium">Saídas</th>
                    <th className="px-2 py-2 text-right font-medium">Perc. X</th>
                    <th className="px-2 py-2 text-right font-medium">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((r) => {
                    const bruto = r.dados as unknown as { tipo?: string }
                    const ehComparativo = bruto?.tipo === 'comparativo'
                    return (
                      <tr key={r.id}>
                        <td className="px-2 py-2 text-gray-700">
                          {r.createdAt.toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-2 py-2 text-gray-900">{r.client?.nome ?? '—'}</td>
                        <td className="px-2 py-2 text-gray-700">{r.periodo ?? '—'}</td>
                        {ehAdmin && <td className="px-2 py-2 text-gray-700">{r.user.nome}</td>}
                        <td className="px-2 py-2 text-right text-gray-700">
                          R$ {formatarMoedaBR(r.somaGeralEntradas)}
                        </td>
                        <td className="px-2 py-2 text-right text-gray-700">
                          R$ {formatarMoedaBR(r.somaGeralSaidas)}
                        </td>
                        <td className="px-2 py-2 text-right font-medium text-gray-900">
                          {ehComparativo
                            ? `R$ ${formatarMoedaBR(r.percentualX)}`
                            : `${formatarMoedaBR(r.percentualX)}%`}
                        </td>
                        <td className="px-2 py-2">
                          {ehComparativo ? (
                            <ComparativoDownloadButton
                              dados={r.dados as unknown as ComparativoResultado}
                              cliente={r.client?.nome}
                              cnpj={(r.dados as unknown as { cnpj?: string }).cnpj}
                              periodo={r.periodo ?? undefined}
                              nomeArquivo={`comparativo-${r.client?.nome ?? 'cfop'}-${r.createdAt
                                .toISOString()
                                .slice(0, 10)}.pdf`}
                            />
                          ) : (
                            <BaixarPdfButton
                              relatorio={r.dados as unknown as RelatorioResposta}
                              cliente={r.client?.nome}
                              periodo={r.periodo ?? undefined}
                              nomeArquivo={`relatorio-${r.client?.nome ?? 'cfop'}-${r.createdAt
                                .toISOString()
                                .slice(0, 10)}.pdf`}
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
