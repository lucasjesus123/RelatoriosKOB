import { CfopCategoria } from './cfop'

export interface ItemRelatorio {
  cfop: string
  descricao: string
  valor: string
}

export interface CategoriaRelatorio {
  categoria: CfopCategoria
  label: string
  itens: ItemRelatorio[]
  total: string
}

export interface RelatorioResposta {
  categorias: CategoriaRelatorio[]
  somaGeralEntradas: string
  somaGeralSaidas: string
  percentualX: string
  resumoHumanizado: string[]
}

export interface RelatorioErro {
  erro: string
}
