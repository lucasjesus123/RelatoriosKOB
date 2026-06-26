import { exigirUsuario } from '@/lib/dal'
import { AppHeader } from '@/components/AppHeader'
import { RelatorioApuracao } from '@/components/RelatorioApuracao'

export default async function Home() {
  const usuario = await exigirUsuario()

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <AppHeader usuario={usuario} />
      <RelatorioApuracao />
    </div>
  )
}
