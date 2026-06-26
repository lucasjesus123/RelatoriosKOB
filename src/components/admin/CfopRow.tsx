'use client'

import { useActionState } from 'react'
import { atualizarCfop, alternarAtivoCfop, type CfopActionState } from '@/lib/cfop-admin-actions'
import { CATEGORIA_OPCOES, NATUREZA_OPCOES } from './opcoes'

export interface CfopRowData {
  id: string
  cfop: string
  descricao: string
  categoria: string
  natureza: string
  ativo: boolean
}

export function CfopRow({ item }: { item: CfopRowData }) {
  const [state, action, pending] = useActionState<CfopActionState | undefined, FormData>(atualizarCfop, undefined)

  return (
    <tr className={item.ativo ? '' : 'opacity-50'}>
      <td className="px-2 py-2 align-top">
        <form id={`f-${item.id}`} action={action} className="contents">
          <input type="hidden" name="id" value={item.id} />
          <input
            name="cfop"
            defaultValue={item.cfop}
            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        </form>
      </td>
      <td className="px-2 py-2 align-top">
        <input
          form={`f-${item.id}`}
          name="descricao"
          defaultValue={item.descricao}
          className="w-full min-w-[200px] rounded-md border border-gray-300 px-2 py-1 text-sm"
        />
      </td>
      <td className="px-2 py-2 align-top">
        <select
          form={`f-${item.id}`}
          name="categoria"
          defaultValue={item.categoria}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          {CATEGORIA_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 align-top">
        <select
          form={`f-${item.id}`}
          name="natureza"
          defaultValue={item.natureza}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          {NATUREZA_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 align-top">
        <div className="flex items-center gap-2">
          <button
            type="submit"
            form={`f-${item.id}`}
            disabled={pending}
            className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? '...' : 'Salvar'}
          </button>
          <form action={alternarAtivoCfop}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                item.ativo
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {item.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </form>
        </div>
        {(state?.erro || state?.ok) && (
          <p className={`mt-1 text-xs ${state.erro ? 'text-red-600' : 'text-green-600'}`}>
            {state.erro ?? state.ok}
          </p>
        )}
      </td>
    </tr>
  )
}
