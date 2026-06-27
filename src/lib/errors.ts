// Erro cuja mensagem é segura para exibir ao usuário (validação de entrada).
// Erros que NÃO são ErroUsuario são tratados como internos: a mensagem real
// é registrada no servidor e o cliente recebe um texto genérico.
export class ErroUsuario extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ErroUsuario'
  }
}

// Padroniza a resposta de erro de uma rota de API sem vazar detalhes internos.
export function mensagemDeErroSegura(error: unknown, contexto: string): string {
  if (error instanceof ErroUsuario) return error.message
  // Log completo só no servidor (não vai para o cliente).
  console.error(`[${contexto}]`, error)
  return 'Não foi possível processar a solicitação. Verifique os arquivos e tente novamente.'
}
