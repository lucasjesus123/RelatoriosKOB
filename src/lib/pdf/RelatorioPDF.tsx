import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Rect,
} from '@react-pdf/renderer'
import type { RelatorioResposta } from '@/lib/types'
import { formatarMoedaBR } from './format'

// Paleta inspirada na identidade do relatório de referência: azul-marinho
// sóbrio com destaque em laranja.
// Azul-marinho da identidade da KOB Contabilidade Estratégica.
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
  verde: '#1f9d57',
  vermelho: '#c0392b',
}

export interface RelatorioPDFMeta {
  cliente?: string
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
  logoBox: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { width: 110, height: 42, objectFit: 'contain' },
  logoFallback: { flexDirection: 'column' },
  logoFallbackKOB: {
    color: COR.branco,
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  logoFallbackTag: {
    color: '#aebfd2',
    fontSize: 6,
    letterSpacing: 1.5,
    marginTop: 1,
  },
  headerRight: { alignItems: 'flex-end' },
  title: { color: COR.branco, fontSize: 16, fontFamily: 'Helvetica-Bold' },
  subtitle: { color: '#aebfd2', fontSize: 9, marginTop: 2 },
  metaBar: {
    backgroundColor: COR.marinhoEsc,
    paddingHorizontal: 28,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  row: { flexDirection: 'row', paddingVertical: 2.5, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: COR.cinzaClaro },
  rowAlt: { backgroundColor: COR.azulClaro },
  cCfop: { width: '14%' },
  cDesc: { width: '64%' },
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

  totaisWrap: { flexDirection: 'row', gap: 10, marginTop: 14 },
  totalCard: { flex: 1, borderRadius: 4, padding: 10, borderWidth: 1, borderColor: COR.cinzaClaro },
  totalLabel: { fontSize: 8, color: COR.cinza, marginBottom: 3 },
  totalValor: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: COR.marinho },

  graficoWrap: { marginTop: 16 },
  legenda: { flexDirection: 'row', gap: 14, marginTop: 6 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendaQuad: { width: 8, height: 8, borderRadius: 2 },
  legendaTxt: { fontSize: 8, color: COR.cinza },

  resumoWrap: { marginTop: 16 },
  resumoParag: { fontSize: 9, lineHeight: 1.5, marginBottom: 6, textAlign: 'justify' },

  percentBox: {
    marginTop: 14,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COR.marinho,
  },
  percentLabel: { color: '#aebfd2', fontSize: 9, marginBottom: 2 },
  percentValor: { fontSize: 24, fontFamily: 'Helvetica-Bold' },

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

function Tabela({ categoria }: { categoria: RelatorioResposta['categorias'][number] }) {
  return (
    <View wrap={false}>
      <Text style={styles.sectionTitle}>{categoria.label}</Text>
      <View style={styles.tableHead}>
        <Text style={[styles.th, styles.cCfop]}>CFOP</Text>
        <Text style={[styles.th, styles.cDesc]}>Descrição</Text>
        <Text style={[styles.th, styles.cValor]}>Valor (R$)</Text>
      </View>
      {categoria.itens.length === 0 ? (
        <Text style={styles.vazio}>Nenhum lançamento nesta categoria.</Text>
      ) : (
        categoria.itens.map((item, i) => (
          <View key={`${item.cfop}-${i}`} style={[styles.row, ...(i % 2 === 1 ? [styles.rowAlt] : [])]}>
            <Text style={styles.cCfop}>{item.cfop}</Text>
            <Text style={styles.cDesc}>{item.descricao}</Text>
            <Text style={styles.cValor}>{formatarMoedaBR(item.valor)}</Text>
          </View>
        ))
      )}
      <View style={styles.subtotal}>
        <Text style={styles.subtotalLabel}>SOMA TOTAL DA CATEGORIA</Text>
        <Text style={styles.subtotalValor}>R$ {formatarMoedaBR(categoria.total)}</Text>
      </View>
    </View>
  )
}

function GraficoBarras({ entradas, saidas, servicos }: { entradas: number; saidas: number; servicos: number }) {
  const largura = 480
  const altura = 130
  const baseY = altura - 18
  const maxV = Math.max(entradas, saidas, servicos, 1)
  const barras = [
    { label: 'Entradas', valor: entradas, cor: COR.marinho },
    { label: 'Saídas', valor: saidas, cor: COR.laranja },
    { label: 'Serviços', valor: servicos, cor: COR.cinza },
  ]
  const larguraBarra = 70
  const espaco = (largura - barras.length * larguraBarra) / (barras.length + 1)

  return (
    <Svg width={largura} height={altura}>
      <Rect x={0} y={baseY} width={largura} height={1} fill={COR.cinzaClaro} />
      {barras.map((b, i) => {
        const h = (b.valor / maxV) * (baseY - 10)
        const x = espaco + i * (larguraBarra + espaco)
        const y = baseY - h
        return (
          <React.Fragment key={b.label}>
            <Rect x={x} y={y} width={larguraBarra} height={h} fill={b.cor} />
          </React.Fragment>
        )
      })}
    </Svg>
  )
}

export function RelatorioPDF({ relatorio, meta }: { relatorio: RelatorioResposta; meta: RelatorioPDFMeta }) {
  const entradas = Number(relatorio.somaGeralEntradas)
  const saidas = Number(relatorio.somaGeralSaidas)
  const servicos = Number(
    relatorio.categorias.find((c) => c.categoria === 'SERVICOS')?.total ?? '0'
  )
  const percent = Number(relatorio.percentualX)

  return (
    <Document title="Relatório de Apuração de CFOP" author="KOB Digital">
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho com logo */}
        <View style={styles.header} fixed>
          <View style={styles.logoBox}>
            {meta.logoSrc ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={meta.logoSrc} style={styles.logoImg} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackKOB}>KOB</Text>
                <Text style={styles.logoFallbackTag}>CONTABILIDADE ESTRATÉGICA</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>Relatório de Apuração de CFOP</Text>
            <Text style={styles.subtitle}>KOB Digital — Apuração fiscal</Text>
          </View>
        </View>

        <View style={styles.metaBar} fixed>
          <Text style={styles.metaText}>Cliente: {meta.cliente || '—'}</Text>
          <Text style={styles.metaText}>Período: {meta.periodo || '—'}</Text>
          <Text style={styles.metaText}>Gerado em: {meta.dataGeracao}</Text>
        </View>

        <View style={styles.body}>
          {relatorio.categorias.map((c) => (
            <Tabela key={c.categoria} categoria={c} />
          ))}

          {/* Totais gerais */}
          <View style={styles.totaisWrap} wrap={false}>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>SOMA GERAL ENTRADAS</Text>
              <Text style={styles.totalValor}>R$ {formatarMoedaBR(relatorio.somaGeralEntradas)}</Text>
            </View>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>SOMA GERAL SAÍDAS</Text>
              <Text style={styles.totalValor}>R$ {formatarMoedaBR(relatorio.somaGeralSaidas)}</Text>
            </View>
          </View>

          {/* Gráfico */}
          <View style={styles.graficoWrap} wrap={false}>
            <Text style={styles.sectionTitle}>Comparativo Entradas × Saídas</Text>
            <GraficoBarras entradas={entradas} saidas={saidas} servicos={servicos} />
            <View style={styles.legenda}>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaQuad, { backgroundColor: COR.marinho }]} />
                <Text style={styles.legendaTxt}>Entradas</Text>
              </View>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaQuad, { backgroundColor: COR.laranja }]} />
                <Text style={styles.legendaTxt}>Saídas</Text>
              </View>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaQuad, { backgroundColor: COR.cinza }]} />
                <Text style={styles.legendaTxt}>Serviços</Text>
              </View>
            </View>
          </View>

          {/* Resumo humanizado */}
          <View style={styles.resumoWrap} wrap={false}>
            <Text style={styles.sectionTitle}>Resumo da apuração</Text>
            {relatorio.resumoHumanizado.map((p, i) => (
              <Text key={i} style={styles.resumoParag}>
                {p}
              </Text>
            ))}
          </View>

          {/* Percentual X */}
          <View style={styles.percentBox} wrap={false}>
            <Text style={styles.percentLabel}>PERCENTUAL X</Text>
            <Text
              style={[
                styles.percentValor,
                { color: percent > 0 ? '#7fe0a8' : percent < 0 ? '#f3b07a' : COR.branco },
              ]}
            >
              {formatarMoedaBR(relatorio.percentualX)}%
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerTxt}>KOB Digital — Relatório gerado automaticamente</Text>
          <Text
            style={styles.footerTxt}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
