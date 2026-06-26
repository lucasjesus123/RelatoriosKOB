'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '@/lib/auth-actions'

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState | undefined, FormData>(login, undefined)

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">E-mail</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Senha</span>
        <input
          type="password"
          name="senha"
          autoComplete="current-password"
          required
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </label>

      {state?.erro && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {state.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
