import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet, Svg, Path, Circle } from '@react-pdf/renderer'
import type { ComparativoResultado } from '@/lib/comparativo'
import { formatarMoedaBR, formatarCfop } from './format'

const COR = {
  marinho: '#1d2c52',
  marinhoEsc: '#15203c',
  laranja: '#e8722a',
  laranjaClaro: '#fbe7d8',
  azulClaro: '#eef1f7',
  cinza: '#5b6b7b',
  cinzaClaro: '#d9e1ea',
  texto: '#1c2733',
  branco: '#ffffff',
}

export interface ComparativoPDFMeta {
  cliente?: string
  cnpj?: string
  periodo?: string
  dataGeracao: string
  logoSrc?: string | null
}

const styles = StyleSheet.create({
  page: { paddingBottom: 40, fontSize: 9, color: COR.texto, fontFamily: 'Helvetica' },
  header: {
    backgroundColor: COR.marinho,
    paddingHorizontal: 28,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Placa branca atrás do logo: o logo (preto) fica perfeito sobre o cabeçalho marinho.
  logoPlate: {
    backgroundColor: COR.branco,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: { width: 120, height: 44, objectFit: 'contain' },
  logoKOB: { color: COR.marinho, fontSize: 22, fontFamily: 'Helvetica-Bold', letterSpacing: 2 },
  logoTag: { color: COR.cinza, fontSize: 6, letterSpacing: 1.5, marginTop: 1 },
  title: { color: COR.branco, fontSize: 15, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  subtitle: { color: '#aebfd2', fontSize: 9, marginTop: 2, textAlign: 'right' },
  metaBar: {
    backgroundColor: COR.marinhoEsc,
    paddingHorizontal: 28,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metaText: { color: '#cdd8e6', fontSize: 8 },
  body: { paddingHorizontal: 28, paddingTop: 16 },
  sectionTitle: {
    color: COR.laranja,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    marginTop: 10,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: COR.marinho,
    color: COR.branco,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  th: { fontFamily: 'Helvetica-Bold', fontSize: 8 },
  row: {
    flexDirection: 'row',
    paddingVertical: 2.5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COR.cinzaClaro,
  },
  rowAlt: { backgroundColor: COR.azulClaro },
  cCfop: { width: '16%' },
  cDesc: { width: '62%' },
  cValor: { width: '22%', textAlign: 'right' },
  subtotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 3,
    paddingHorizontal: 4,
    backgroundColor: COR.laranjaClaro,
  },
  subtotalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginRight: 8 },
  subtotalValor: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: COR.marinho },
  vazio: { fontSize: 8, color: COR.cinza, fontStyle: 'italic', paddingVertical: 3, paddingHorizontal: 4 },
  totaisWrap: { flexDirection: 'row', gap: 8, marginTop: 14 },
  totalCard: { flex: 1, borderRadius: 4, padding: 10, borderWidth: 1, borderColor: COR.cinzaClaro },
  totalLabel: { fontSize: 7, color: COR.cinza, marginBottom: 3 },
  totalValor: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: COR.marinho },
  resultadoCard: { flex: 1, borderRadius: 4, padding: 10, backgroundColor: COR.marinho },
  resultadoLabel: { fontSize: 7, color: '#aebfd2', marginBottom: 3 },
  resultadoValor: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: COR.branco },
  // Gráfico de pizza + legenda
  graficoWrap: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 16 },
  legenda: { flexDirection: 'column', gap: 6 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaQuad: { width: 10, height: 10, borderRadius: 2 },
  legendaTxt: { fontSize: 9, color: COR.texto },
  legendaVal: { fontSize: 8, color: COR.cinza },

  // Resumo humanizado
  resumoWrap: { marginTop: 16 },
  resumoParag: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 6, textAlign: 'justify', color: COR.texto },

  simplesWrap: { marginTop: 16, borderRadius: 6, borderWidth: 1, borderColor: COR.cinzaClaro, padding: 14 },
  simplesValor: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: COR.laranja },
  // Porcentagens efetivas em destaque (cards grandes)
  pctRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pctCard: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: COR.marinho,
    alignItems: 'center',
  },
  pctCardLabel: { fontSize: 8, color: '#aebfd2', marginBottom: 4, textAlign: 'center' },
  pctCardNum: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: COR.branco },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: COR.cinzaClaro,
    paddingTop: 6,
  },
  footerTxt: { fontSize: 7, color: COR.cinza },
})

interface FatiaPizza {
  label: string
  valor: number
  cor: string
}

function arco(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0x = cx + r * Math.cos(a0)
  const p0y = cy + r * Math.sin(a0)
  const p1x = cx + r * Math.cos(a1)
  const p1y = cy + r * Math.sin(a1)
  const largeArc = a1 - a0 > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${p0x} ${p0y} A ${r} ${r} 0 ${largeArc} 1 ${p1x} ${p1y} Z`
}

function GraficoPizza({ fatias }: { fatias: FatiaPizza[] }) {
  const total = fatias.reduce((s, f) => s + f.valor, 0)
  const r = 55
  const size = r * 2
  let ang = -Math.PI / 2 // começa no topo
  const paths = fatias
    .filter((f) => f.valor > 0)
    .map((f) => {
      const frac = total > 0 ? f.valor / total : 0
      const a0 = ang
      const a1 = ang + frac * 2 * Math.PI
      ang = a1
      return { d: arco(r, r, r, a0, Math.min(a1, a0 + 2 * Math.PI - 0.0001)), cor: f.cor }
    })

  return (
    <Svg width={size} height={size}>
      {total > 0 ? (
        paths.map((p, i) => <Path key={i} d={p.d} fill={p.cor} />)
      ) : (
        <Circle cx={r} cy={r} r={r} fill={COR.cinzaClaro} />
      )}
    </Svg>
  )
}

function Tabela({
  titulo,
  itens,
  total,
  labelTotal,
}: {
  titulo: string
  itens: { cfop: string; descricao: string; valor: string }[]
  total: string
  labelTotal: string
}) {
  return (
    <View wrap={false}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      <View style={styles.tableHead}>
        <Text style={[styles.th, styles.cCfop]}>CFOP</Text>
        <Text style={[styles.th, styles.cDesc]}>Descrição</Text>
        <Text style={[styles.th, styles.cValor]}>Valor (R$)</Text>
      </View>
      {itens.length === 0 ? (
        <Text style={styles.vazio}>Nenhum lançamento nesta categoria.</Text>
      ) : (
        itens.map((item, i) => (
          <View key={`${item.cfop}-${i}`} style={[styles.row, ...(i % 2 === 1 ? [styles.rowAlt] : [])]}>
            <Text style={styles.cCfop}>{formatarCfop(item.cfop)}</Text>
            <Text style={styles.cDesc}>{item.descricao}</Text>
            <Text style={styles.cValor}>{formatarMoedaBR(item.valor)}</Text>
          </View>
        ))
      )}
      <View style={styles.subtotal}>
        <Text style={styles.subtotalLabel}>{labelTotal}</Text>
        <Text style={styles.subtotalValor}>R$ {formatarMoedaBR(total)}</Text>
      </View>
    </View>
  )
}

export function ComparativoPDF({
  dados,
  meta,
}: {
  dados: ComparativoResultado
  meta: ComparativoPDFMeta
}) {
  return (
    <Document title="Comparativo de Entradas e Saídas" author="KOB Contabilidade Estratégica">
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.logoPlate}>
            {meta.logoSrc ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={meta.logoSrc} style={styles.logoImg} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.logoKOB}>KOB</Text>
                <Text style={styles.logoTag}>CONTABILIDADE ESTRATÉGICA</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.title}>Comparativo de Entradas e Saídas</Text>
            <Text style={styles.subtitle}>Apuração mensal — Simples Nacional</Text>
          </View>
        </View>

        <View style={styles.metaBar} fixed>
          <Text style={styles.metaText}>Cliente: {meta.cliente || '—'}</Text>
          <Text style={styles.metaText}>CNPJ: {meta.cnpj || '—'}</Text>
          <Text style={styles.metaText}>Período: {meta.periodo || '—'}</Text>
          <Text style={styles.metaText}>Gerado em: {meta.dataGeracao}</Text>
        </View>

        <View style={styles.body}>
          <Tabela titulo="Entradas" itens={dados.entradas} total={dados.totalEntradas} labelTotal="TOTAL DE ENTRADAS" />
          <Tabela
            titulo="Saídas (mercadorias)"
            itens={dados.saidasMercadorias}
            total={dados.totalSaidasMercadorias}
            labelTotal="TOTAL DE SAÍDAS (MERCADORIAS)"
          />

          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.subtotal}>
            <Text style={styles.subtotalLabel}>RECEITA DE SERVIÇOS (SIMPLES NACIONAL)</Text>
            <Text style={styles.subtotalValor}>R$ {formatarMoedaBR(dados.servicos)}</Text>
          </View>

          <View style={styles.totaisWrap} wrap={false}>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>TOTAL DE ENTRADAS</Text>
              <Text style={styles.totalValor}>R$ {formatarMoedaBR(dados.totalEntradas)}</Text>
            </View>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>TOTAL DE SAÍDAS</Text>
              <Text style={styles.totalValor}>R$ {formatarMoedaBR(dados.totalSaidas)}</Text>
            </View>
            <View style={styles.resultadoCard}>
              <Text style={styles.resultadoLabel}>RESULTADO (SAÍDAS − ENTRADAS)</Text>
              <Text style={styles.resultadoValor}>R$ {formatarMoedaBR(dados.resultado)}</Text>
            </View>
          </View>

          {/* Gráfico de pizza: composição do movimento */}
          <Text style={styles.sectionTitle}>Distribuição do movimento</Text>
          <View style={styles.graficoWrap} wrap={false}>
            <GraficoPizza
              fatias={[
                { label: 'Entradas (compras)', valor: Number(dados.totalEntradas), cor: COR.marinho },
                { label: 'Saídas (mercadorias)', valor: Number(dados.totalSaidasMercadorias), cor: COR.laranja },
                { label: 'Serviços', valor: Number(dados.servicos), cor: COR.cinza },
              ]}
            />
            <View style={styles.legenda}>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaQuad, { backgroundColor: COR.marinho }]} />
                <Text style={styles.legendaTxt}>
                  Entradas (compras) — <Text style={{ color: COR.cinza }}>R$ {formatarMoedaBR(dados.totalEntradas)}</Text>
                </Text>
              </View>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaQuad, { backgroundColor: COR.laranja }]} />
                <Text style={styles.legendaTxt}>
                  Saídas (mercadorias) —{' '}
                  <Text style={{ color: COR.cinza }}>R$ {formatarMoedaBR(dados.totalSaidasMercadorias)}</Text>
                </Text>
              </View>
              {dados.temServicos && Number(dados.servicos) > 0 && (
                <View style={styles.legendaItem}>
                  <View style={[styles.legendaQuad, { backgroundColor: COR.cinza }]} />
                  <Text style={styles.legendaTxt}>
                    Serviços — <Text style={{ color: COR.cinza }}>R$ {formatarMoedaBR(dados.servicos)}</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Resumo humanizado */}
          {dados.resumo && dados.resumo.length > 0 && (
            <View style={styles.resumoWrap} wrap={false}>
              <Text style={styles.sectionTitle}>Resumo do período</Text>
              {dados.resumo.map((p, i) => (
                <Text key={i} style={styles.resumoParag}>
                  {p}
                </Text>
              ))}
            </View>
          )}

          {/* Valor do Simples + porcentagens em destaque */}
          <View style={styles.simplesWrap} wrap={false}>
            <Text style={styles.totalLabel}>VALOR DO SIMPLES NACIONAL (DAS)</Text>
            <Text style={styles.simplesValor}>R$ {formatarMoedaBR(dados.valorSimples)}</Text>
            <View style={styles.pctRow}>
              {dados.temComercio && (
                <View style={styles.pctCard}>
                  <Text style={styles.pctCardLabel}>% EFETIVA{'\n'}VENDAS COMÉRCIO</Text>
                  <Text style={styles.pctCardNum}>{formatarMoedaBR(dados.percComercio)}%</Text>
                </View>
              )}
              {dados.temIndustria && (
                <View style={styles.pctCard}>
                  <Text style={styles.pctCardLabel}>% EFETIVA{'\n'}VENDAS INDÚSTRIA</Text>
                  <Text style={styles.pctCardNum}>{formatarMoedaBR(dados.percIndustria)}%</Text>
                </View>
              )}
              {dados.temServicos && Number(dados.servicos) > 0 && (
                <View style={styles.pctCard}>
                  <Text style={styles.pctCardLabel}>% EFETIVA{'\n'}SERVIÇOS</Text>
                  <Text style={styles.pctCardNum}>{formatarMoedaBR(dados.percServicos)}%</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerTxt}>
            KOB Contabilidade Estratégica — Relatório Analítico e Estratégico KOB
          </Text>
          <Text
            style={styles.footerTxt}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
