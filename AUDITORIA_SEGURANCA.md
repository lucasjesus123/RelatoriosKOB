# Auditoria de Segurança — RelatoriosKOB

Auditoria conduzida em modo read-only (exceto este arquivo) e, em seguida,
**blindagem aplicada** com autorização do responsável. Segredos sempre mascarados.
Cada item marcado como **verificado**, **hipótese** ou **não verificado**.

Data: 2026-06-27

---

## 1. Sumário executivo

- **Estado geral:** bom para o uso real pretendido (uma firma — KOB — com seus usuários internos). As bases de segurança estão presentes: senhas com hash forte, sessão em cookie httpOnly/Secure, RBAC, validação de entrada, headers de segurança e, após esta blindagem, sanitização de erros e CSP.
- **Ponto de atenção arquitetural (importante):** o sistema é **single-tenant** (feito para a KOB). Ele **NÃO implementa isolamento entre múltiplas empresas**. Se um dia for vendido como SaaS para 30 empresas distintas que não podem se ver, será necessário adicionar isolamento por tenant (hoje a tabela `Client` é global). Para o uso atual (KOB), isso é por design e aceitável.
- **3 riscos mais relevantes encontrados (todos corrigidos nesta rodada):**
  1. Vazamento de mensagens internas de erro para o cliente (ex.: erro do parser de PDF). — **corrigido**
  2. Ausência de Content-Security-Policy. — **corrigido**
  3. Exposição da tecnologia via header `X-Powered-By`. — **corrigido**
- **Adequação para produção:** adequado para o uso atual (single-tenant). **Não** está pronto para operar como SaaS multi-empresa sem antes implementar isolamento por tenant.

---

## 2. Stack identificada (verificado)

TypeScript + **Next.js 16.2.9** (App Router; frontend e backend juntos). **PostgreSQL 16** via **Prisma 7** (driver adapter `@prisma/adapter-pg` + `pg`). Auth com **jose** (JWT em cookie httpOnly) + **bcryptjs**. Validação com **zod**. PDFs com `@react-pdf/renderer` e `pdf-parse`. Servido por container Docker em `127.0.0.1:3000`, atrás de **nginx** no host (TLS via Let's Encrypt). Deploy via GitHub Actions (testes → rsync/SSH → `docker compose up`). VPS compartilhada com outros projetos.

---

## 3. Vulnerabilidades encontradas

### SEC-001 — Vazamento de detalhes internos em erros — **CORRIGIDO**
- Severidade: **MÉDIA**
- Categoria: Exposição de informação / tratamento de erro
- Arquivos: `src/app/api/process/route.ts`, `src/app/api/comparativo/route.ts`
- Evidência (antes): `catch (error) { ... erro: error.message ... }` devolvia a mensagem bruta da exceção ao cliente (ex.: erro interno do `pdf-parse`).
- Risco: revela detalhes de implementação/dependências; ajuda um atacante a mapear o sistema.
- Correção aplicada: criado `src/lib/errors.ts` (`ErroUsuario` + `mensagemDeErroSegura`). Mensagens de validação seguras continuam visíveis; erros inesperados são **logados no servidor** e o cliente recebe texto genérico.
- Status: **verificado** (corrigido e testado).

### SEC-002 — Header `X-Powered-By: Next.js` exposto — **CORRIGIDO**
- Severidade: **BAIXA**
- Arquivo: `next.config.ts`
- Correção: `poweredByHeader: false`. Status: **verificado** (header ausente em smoke test).

### SEC-003 — Ausência de Content-Security-Policy — **CORRIGIDO**
- Severidade: **MÉDIA**
- Arquivo: `next.config.ts`
- Correção: adicionada CSP (default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; etc.) + `Cross-Origin-Opener-Policy: same-origin`. `'unsafe-inline'` em script/style é necessário para Next/Tailwind sem nonce; risco mitigado pois o app **não** usa `dangerouslySetInnerHTML` (verificado por grep) e o React escapa a saída.
- Status: **verificado** (CSP presente; app carrega normalmente).

### SEC-004 — Isolamento multi-tenant ausente — **NÃO corrigido (decisão de produto)**
- Severidade: **ALTA** *se* o objetivo for SaaS multi-empresa; **N/A** para o uso single-tenant atual.
- Evidência: `prisma/schema.prisma` não tem entidade de empresa/tenant; `User` não tem `companyId`; `src/app/clientes/page.tsx` lista **todos** os clientes para qualquer usuário; `/api/process` e `/api/comparativo` criam/buscam `Client` por CNPJ globalmente.
- Cenário (se multi-empresa): usuário da Empresa A veria, no seletor de clientes e no auto-cadastro por CNPJ, dados da Empresa B.
- Observação: NÃO há IDOR por ID na URL (não existem endpoints `GET /recurso/:id`); o histórico filtra por `userId` (`src/app/historico/page.tsx`) e o Super Admin vê tudo — coerente com firma única.
- Recomendação (se evoluir para SaaS): adicionar tabela `Company`, `companyId` em `User`/`Client`/`Report`, escopo por tenant em todas as queries e, idealmente, RLS no Postgres.
- Status: **verificado** (lacuna real para multi-tenant; aceitável para single-tenant).

---

## 4. Resultado das ferramentas automáticas

- **gitleaks / trufflehog / semgrep / osv-scanner / trivy:** **NÃO instalados** no ambiente. Não foram instalados (sem autorização). Comandos para rodar futuramente:
  - `gitleaks detect --source . --log-opts="--all" -v`
  - `semgrep --config auto .`
  - `osv-scanner -r .`
  - Impacto da ausência: a varredura de segredos e a análise estática automatizada não puderam ser executadas; foi feita **revisão manual** (grep por segredos/`eval`/`dangerouslySetInnerHTML`/`child_process` — nenhum achado) e inspeção do `.gitignore` e do histórico (sem `.env` versionado, sem chaves privadas).
- **npm audit (runtime):** 5 vulnerabilidades **moderadas**, todas **transitivas de build/CLI**: `postcss` (via Next, processamento de CSS em build) e `@hono/node-server` (via `@prisma/dev`, CLI). **Sem impacto no runtime de produção**. **Não** aplicar `npm audit fix --force` (rebaixaria Next/Prisma e quebraria o app). Acompanhar atualização do Next/Prisma.

---

## 5. Análise multi-tenant

- O isolamento entre empresas **não está implementado** porque o sistema é single-tenant (uma firma).
- Onde *hoje* há separação: por **usuário** no histórico (`where userId`); por **papel** (USER vs SUPER_ADMIN) nas rotas admin (`exigirPerfil('SUPER_ADMIN')`).
- Depende do **backend** (DAL + server actions), não do frontend. Não há RLS no banco.
- Risco de IDOR por ID: **não encontrado** (sem endpoints que buscam recurso por id vindo do cliente).
- Para considerar isolamento multi-empresa aceitável: ver recomendação em SEC-004.

---

## 6. Autenticação / Autorização (verificado)

- Login: `src/lib/auth-actions.ts` — zod, bcrypt `compare`, mensagem genérica ("E-mail ou senha incorretos"), **rate limit** (5 tentativas/15min por e-mail, em memória).
- Sessão: `src/lib/session.ts` — JWT HS256 (jose), cookie `session` **httpOnly**, **secure** em produção, **sameSite=lax**, expira em 7 dias. `SESSION_SECRET` obrigatório (sem fallback inseguro).
- Autorização: `src/lib/dal.ts` (`obterUsuarioAtual`/`exigirUsuario`/`exigirPerfil`) faz verificação no banco a cada request, checando `isActive` (desativação tem efeito imediato). Todas as rotas de API validam sessão; ações de admin exigem `SUPER_ADMIN`; não é possível desativar a própria conta.
- Senhas: bcrypt custo **12**. Hash nunca retornado ao cliente (`UsuarioSeguro` remove `passwordHash`).
- CSRF: cookie **sameSite=lax** + Server Actions do Next (proteção de Origin) → risco baixo. (Hipótese: ok para o modelo atual.)

---

## 7. Escalabilidade (alvo ~90 usuários simultâneos)

- **Banco:** Prisma com pool padrão do `pg`. Para 90 usuários a carga é baixa; recomenda-se definir `connection_limit` na `DATABASE_URL` e índices em `Report(userId, createdAt)` e `Client(cnpj)` (hoje sem índice explícito além de unique). **Hipótese:** suficiente para o alvo.
- **Processos pesados (PDF):** parsing e geração de PDF rodam **no mesmo processo web** (síncrono por request). Com muitos uploads simultâneos pode haver pico de CPU/memória (até 15MB/arquivo em memória). Mitigação futura: fila/worker. **Hipótese** (não medido).
- **Infra:** healthcheck do `db` no compose; `restart: unless-stopped`. **Não verificado:** backup automático do Postgres, monitoramento (CPU/mem/disco), firewall/fail2ban no VPS — recomenda-se confirmar.
- **Stack:** adequada ao alvo; **não há motivo técnico para troca de stack**.

---

## 8. Plano de correção priorizado

### Corrigir imediatamente (impedem produção segura)
- (feito) SEC-001 sanitização de erros · SEC-003 CSP · SEC-002 header.

### Corrigir antes de escalar / virar SaaS multi-empresa
- SEC-004 isolamento multi-tenant (se aplicável ao modelo de negócio).
- Confirmar **backup automático** do Postgres + teste de restore.
- Definir `connection_limit` e índices `Report(userId, createdAt)` / `Client(cnpj)`.

### Melhorias recomendadas
- Rodar gitleaks/semgrep/osv em CI.
- Monitoramento de recursos no VPS; fail2ban no SSH.
- Mover geração de PDF para fila se o volume crescer.

### Pode esperar
- Vulnerabilidades moderadas transitivas (postcss/@hono) — resolver via update natural de Next/Prisma.

---

## 9. Correções aplicadas nesta rodada (blindagem)
- `src/lib/errors.ts` (novo) — erros seguros.
- `src/app/api/process/route.ts` e `src/app/api/comparativo/route.ts` — uso de `ErroUsuario` + `mensagemDeErroSegura`.
- `next.config.ts` — `poweredByHeader: false`, CSP, `Cross-Origin-Opener-Policy`.
- Testes (29) e build verdes; smoke test confirma CSP ativo e app funcional.
