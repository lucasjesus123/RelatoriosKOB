'use client'

import { useActionState } from 'react'
import { criarCliente, type ClienteActionState } from '@/lib/client-actions'

export function ClienteCreateForm() {
  const [state, action, pending] = useActionState<ClienteActionState | undefined, FormData>(
    criarCliente,
    undefined
  )

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">Nome do cliente</span>
        <input
          name="nome"
          required
          placeholder="Empresa Exemplo LTDA"
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">CNPJ (opcional)</span>
        <input
          name="cnpj"
          placeholder="00.000.000/0001-00"
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? 'Salvando...' : 'Cadastrar'}
      </button>
      {(state?.erro || state?.ok) && (
        <p className={`sm:col-span-3 text-sm ${state.erro ? 'text-red-600' : 'text-green-600'}`}>
          {state.erro ?? state.ok}
        </p>
      )}
    </form>
  )
}
