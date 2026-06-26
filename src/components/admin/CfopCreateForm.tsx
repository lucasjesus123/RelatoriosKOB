'use client'

import { useActionState } from 'react'
import { criarCfop, type CfopActionState } from '@/lib/cfop-admin-actions'
import { CATEGORIA_OPCOES, NATUREZA_OPCOES } from './opcoes'

export function CfopCreateForm() {
  const [state, action, pending] = useActionState<CfopActionState | undefined, FormData>(criarCfop, undefined)

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[110px_1fr_180px_140px_auto] sm:items-end">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">CFOP</span>
        <input
          name="cfop"
          placeholder="5102"
          required
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">Descrição</span>
        <input
          name="descricao"
          placeholder="Venda de mercadoria..."
          required
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">Categoria</span>
        <select name="categoria" className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm">
          {CATEGORIA_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">Natureza</span>
        <select name="natureza" className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm">
          {NATUREZA_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? 'Salvando...' : 'Adicionar'}
      </button>

      {(state?.erro || state?.ok) && (
        <p className={`sm:col-span-5 text-sm ${state.erro ? 'text-red-600' : 'text-green-600'}`}>
          {state.erro ?? state.ok}
        </p>
      )}
    </form>
  )
}
