# RelatoriosKOB

Ferramenta de apuração de CFOP: extrai dados de PDFs, calcula totais com `decimal.js` e exibe um relatório com gráfico.

## Estrutura

- `src/app/api/process/route.ts` — endpoint que recebe o PDF e processa
- `src/components/RelatorioApuracao.tsx` — tela do relatório
- `src/components/GraficoApuracao.tsx` — gráfico (recharts)
- `src/lib/extract.ts` — extração de texto/dados do PDF
- `src/lib/cfop.ts` — regras de CFOP
- `src/lib/calculations.ts` — cálculos de apuração
- `src/lib/humanize.ts` — formatação para exibição
- `src/lib/types.ts` — tipos compartilhados

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Deploy em VPS com Docker

Pré-requisitos na VPS: Docker e Docker Compose instalados.

```bash
git clone <url-do-repo>
cd RelatoriosKOB
docker compose up -d --build
```

A aplicação ficará disponível na porta `3000`. Para usar um domínio com HTTPS, coloque um proxy reverso (ex.: Nginx ou Caddy) na frente apontando para `localhost:3000`.

Para atualizar após novos commits:

```bash
git pull
docker compose up -d --build
```

## Deploy em VPS sem Docker

```bash
npm install
npm run build
npm run start
```

Recomenda-se usar um gerenciador de processos (ex.: `pm2`) para manter a aplicação ativa:

```bash
npm install -g pm2
pm2 start npm --name relatorioskob -- start
pm2 save
```
