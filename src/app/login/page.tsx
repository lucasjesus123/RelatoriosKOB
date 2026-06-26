import { redirect } from 'next/navigation'
import { obterUsuarioAtual } from '@/lib/dal'
import { LoginForm } from '@/components/LoginForm'

export default async function LoginPage() {
  const usuario = await obterUsuarioAtual()
  if (usuario) redirect('/')

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900">RelatóriosKOB</h1>
          <p className="text-sm text-gray-600">Apuração fiscal por CFOP</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
