import { redirect } from 'next/navigation'
import Image from 'next/image'
import { obterUsuarioAtual } from '@/lib/dal'
import { LoginForm } from '@/components/LoginForm'

export default async function LoginPage() {
  const usuario = await obterUsuarioAtual()
  if (usuario) redirect('/')

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Fundo azul-marinho com brilho sutil */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: '#15203c',
          backgroundImage:
            'radial-gradient(900px 420px at 50% -120px, rgba(232,114,42,0.18), transparent 70%), linear-gradient(180deg, #1d2c52 0%, #15203c 100%)',
        }}
      />

      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/logo-kob.png" alt="KOB Contabilidade Estratégica" width={150} height={55} priority />
          <p className="text-sm text-gray-500">Sistema de Apuração Fiscal</p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-gray-400">
          KOB Contabilidade Estratégica
        </p>
      </div>
    </main>
  )
}
