# Auditoria de Segurança — RelatoriosKOB

> Documento em construção. Auditoria read-only conduzida por etapas.
> Segredos sempre mascarados. Cada item marcado como **verificado**, **hipótese** ou **não verificado**.

Data de início: 2026-06-27
Escopo declarado pelo solicitante: SaaS multi-tenant em produção (VPS própria), até 30 empresas, até 5 usuários/empresa, ~90 usuários simultâneos. Isolamento entre empresas é requisito crítico. Atacante principal: usuário autenticado de uma empresa tentando acessar dados de outra.

---

## ETAPA 0 — Identificação da Stack (verificado)

### Linguagens / runtime
- **TypeScript** (strict via tsconfig) — `typescript ^5`.
- **Node.js** no ambiente de auditoria: `v22.22.2`. Em produção o container usa **node:20-slim** (evidência: `Dockerfile`).
- Gerenciador de pacotes: **npm** (`package-lock.json`, `npm` 10.9.7).

### Framework / app
- **Next.js 16.2.9** (App Router, Turbopack) — `next`.
- **React 19.2.4**.
- **TailwindCSS v4** (`@tailwindcss/postcss`).
- Renderização de PDF: **@react-pdf/renderer ^4.5.1**.
- Extração de PDF: **pdf-parse ^2.4.5** (usa pdfjs-dist + @napi-rs/canvas).
- Matemática monetária: **decimal.js ^10.6.0**.
- Validação: **zod ^4.4.3**.
- Sessão/JWT: **jose ^6.2.3**. Hash de senha: **bcryptjs ^3.0.3**.
- Testes: **vitest ^4.1.9** (28 testes).

### Banco de dados
- **PostgreSQL 16** (container `postgres:16-alpine`, serviço `db` no compose).
- ORM: **Prisma 7** (`@prisma/client ^7.8.0`, `prisma ^7.8.0`) com **driver adapter** `@prisma/adapter-pg` + `pg`.
- Conexão: `src/lib/db.ts` cria `PrismaClient` com `PrismaPg({ connectionString: process.env.DATABASE_URL })` (singleton).
- Config de migrate/seed: `prisma.config.ts` (URL via `env('DATABASE_URL')`).
- Migrations: `prisma/migrations/20260626172945_init`.

### Modelos (prisma/schema.prisma)
- `User { id, email(unique), passwordHash, nome, role(SUPER_ADMIN|USER), isActive, createdAt }`
- `Client { id, nome, cnpj?, createdAt }`
- `CfopMapping { id, cfop(unique), descricao, categoria, natureza, ativo }`
- `Report { id, periodo?, somaGeralEntradas, somaGeralSaidas, percentualX, dados(Json), userId, clientId? }`
- `AuditLog { id, acao, detalhe?, userId? }`

> ⚠️ **Observação preliminar crítica (a detalhar na Etapa 2):** NÃO existe entidade de "empresa/tenant/organization" nem coluna de tenant nos modelos. `User` não pertence a nenhuma empresa; `Client` é global. Ou seja, o modelo de dados atual é **single-tenant** (uma firma — a KOB — com vários usuários), e **não** implementa o isolamento por empresa exigido no escopo. Isso será aprofundado na Etapa 2 (Isolamento multi-tenant).

### Estrutura de pastas
- **Frontend + Backend juntos** (Next.js App Router) em `src/`:
  - `src/app/**` — páginas (`/`, `/login`, `/comparativo`, `/clientes`, `/historico`, `/admin`, `/admin/cfop`, `/admin/usuarios`) e **rotas de API** (`src/app/api/process`, `api/comparativo`, `api/comparativo/pdf`, `api/report/pdf`).
  - `src/components/**` — componentes (client/server).
  - `src/lib/**` — lógica: `session.ts`, `dal.ts`, `auth-actions.ts`, `user-actions.ts`, `client-actions.ts`, `cfop-*`, `simples.ts`, `comparativo.ts`, `calculations.ts`, `extract.ts`, `pdf/**`.
  - `proxy.ts` (raiz) — checagem otimista de sessão (equivalente ao middleware nesta versão do Next).
- **Infra:** `Dockerfile` (multi-stage), `docker-compose.yml` (serviços `db` + `relatorioskob`), `docker-entrypoint.sh` (aguarda DB, `prisma migrate deploy`, `prisma db seed`, `npm run start`).
- **CI/CD:** `.github/workflows/deploy.yml` (push em `main` → testes → rsync → SSH → `docker compose up -d --build` no VPS). Gera `.env` no VPS a partir de GitHub Secrets.
- **Scripts:** `prisma/seed.ts`.

### Como é servido em produção
- Container Next.js (`npm run start`) exposto em **`127.0.0.1:3000`** (apenas loopback — evidência: `docker-compose.yml` `ports: 127.0.0.1:3000:3000`).
- Há um **proxy reverso no host** (fora deste repositório) que publica `kobdigital.online` → `127.0.0.1:3000`. **Não verificado** neste repositório qual é (nginx/caddy/traefik); precisa ser inspecionado no VPS.
- VPS compartilhada com **vários outros projetos** (supabase, evolution, etc. — verificado via `docker ps`). IP público: `2.25.129.43` (verificado).
- HSTS/headers de segurança definidos em `next.config.ts` (a confirmar na Etapa 2).

### Arquivos de configuração relevantes
- `.env.example` (versionado — **a inspecionar se contém valor real ou placeholder**), `.env` (ignorado pelo git — `.gitignore` linha 34 `.env*`, com exceção `!.env.example`).
- `Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`, `next.config.ts`, `prisma.config.ts`, `.github/workflows/deploy.yml`.

---

_Próximas etapas (1, 2, 3) e relatório final serão preenchidos mediante autorização._
