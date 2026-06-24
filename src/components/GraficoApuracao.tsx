'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface GraficoApuracaoProps {
  somaGeralEntradas: string
  somaGeralSaidas: string
  totalServicos: string
}

export function GraficoApuracao({
  somaGeralEntradas,
  somaGeralSaidas,
  totalServicos,
}: GraficoApuracaoProps) {
  const dados = [
    { nome: 'Entradas', valor: Number(somaGeralEntradas) },
    { nome: 'Saídas', valor: Number(somaGeralSaidas) },
    { nome: 'Serviços', valor: Number(totalServicos) },
  ]

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="nome" stroke="#374151" />
          <YAxis stroke="#374151" tickFormatter={(v) => `R$ ${v}`} />
          <Tooltip
            formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
          />
          <Bar dataKey="valor" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
