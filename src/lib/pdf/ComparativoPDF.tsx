import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
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
  logoImg: { width: 110, height: 42, objectFit: 'contain' },
  logoKOB: { color: COR.branco, fontSize: 22, fontFamily: 'Helvetica-Bold', letterSpacing: 2 },
  logoTag: { color: '#aebfd2', fontSize: 6, letterSpacing: 1.5, marginTop: 1 },
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
  simplesWrap: { marginTop: 16, borderRadius: 6, borderWidth: 1, borderColor: COR.cinzaClaro, padding: 14 },
  simplesValor: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: COR.laranja },
  pctRow: { flexDirection: 'row', gap: 24, marginTop: 8 },
  pct: { fontSize: 10, color: COR.texto },
  pctNum: { fontFamily: 'Helvetica-Bold', color: COR.marinho },
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
          <View>
            {meta.logoSrc ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={meta.logoSrc} style={styles.logoImg} />
            ) : (
              <View>
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

          <View style={styles.simplesWrap} wrap={false}>
            <Text style={styles.totalLabel}>VALOR DO SIMPLES NACIONAL (DAS)</Text>
            <Text style={styles.simplesValor}>R$ {formatarMoedaBR(dados.valorSimples)}</Text>
            <View style={styles.pctRow}>
              {dados.temComercio && (
                <Text style={styles.pct}>
                  % efetiva Vendas Comércio:{' '}
                  <Text style={styles.pctNum}>{formatarMoedaBR(dados.percComercio)}%</Text>
                </Text>
              )}
              {dados.temIndustria && (
                <Text style={styles.pct}>
                  % efetiva Vendas Indústria:{' '}
                  <Text style={styles.pctNum}>{formatarMoedaBR(dados.percIndustria)}%</Text>
                </Text>
              )}
              {dados.temServicos && (
                <Text style={styles.pct}>
                  % efetiva Serviços: <Text style={styles.pctNum}>{formatarMoedaBR(dados.percServicos)}%</Text>
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerTxt}>KOB Contabilidade Estratégica — Relatório gerado automaticamente</Text>
          <Text
            style={styles.footerTxt}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
