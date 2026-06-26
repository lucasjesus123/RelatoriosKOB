'use client'

import { useActionState } from 'react'
import { criarUsuario, type UsuarioActionState } from '@/lib/user-actions'

export function UsuarioCreateForm() {
  const [state, action, pending] = useActionState<UsuarioActionState | undefined, FormData>(
    criarUsuario,
    undefined
  )

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_150px_auto] sm:items-end">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">Nome</span>
        <input name="nome" required className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">E-mail</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">Senha</span>
        <input
          name="senha"
          type="text"
          required
          placeholder="mín. 8 caracteres"
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-600">Perfil</span>
        <select name="role" className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm">
          <option value="USER">Usuário</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? 'Criando...' : 'Criar'}
      </button>
      {(state?.erro || state?.ok) && (
        <p className={`sm:col-span-5 text-sm ${state.erro ? 'text-red-600' : 'text-green-600'}`}>
          {state.erro ?? state.ok}
        </p>
      )}
    </form>
  )
}
