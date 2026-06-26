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

## Deploy automático (GitHub Actions → VPS)

`.github/workflows/deploy.yml` faz, a cada push em `main`: `rsync` do projeto para a VPS →
`docker compose up -d --build` (via `scripts/vps-sync.sh`).

Secrets do repositório (Settings → Secrets and variables → Actions):

| Secret | Valor |
|---|---|
| `SSH_PRIVATE_KEY` | chave privada com acesso ao usuário `deploy` na VPS |
| `VPS_HOST` | `2.25.129.43` |
| `VPS_USER` | `deploy` |
| `VPS_PORT` | `22` |
| `VPS_TARGET` | `/var/www/relatorioskob` |

Na VPS, crie o diretório de destino antes do primeiro deploy:

```bash
mkdir -p /var/www/relatorioskob
chown deploy:deploy /var/www/relatorioskob
```

### Nginx + SSL (domínio kobdigital.online)

Rodar na VPS, como root, depois do primeiro deploy (container já escutando em `127.0.0.1:3000`):

```bash
cat > /etc/nginx/sites-available/relatorioskob <<'EOF'
server {
    listen 80;
    server_name kobdigital.online www.kobdigital.online;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/relatorioskob /etc/nginx/sites-enabled/relatorioskob
nginx -t && systemctl reload nginx
certbot --nginx -d kobdigital.online -d www.kobdigital.online -m diego@agentesintegrados.com.br --agree-tos --redirect
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
