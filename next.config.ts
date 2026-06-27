import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Not using output: "standalone" — its dependency tracing misses the
  // dynamically-required native @napi-rs/canvas binary that pdfjs-dist
  // needs for DOMMatrix in Node, so the full node_modules is shipped instead.

  // pdf-parse/pdfjs-dist must NOT be bundled by Turbopack/webpack: pdfjs-dist
  // resolves its worker file (pdf.worker.mjs) by a path relative to its own
  // location on disk, which breaks once it's bundled into .next/server/chunks.
  // Marking them external keeps them loaded straight from node_modules.
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "@napi-rs/canvas",
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "@react-pdf/renderer",
  ],

  // Remove o header "X-Powered-By: Next.js" (evita expor a tecnologia).
  poweredByHeader: false,

  // Cabeçalhos de segurança aplicados a todas as respostas.
  async headers() {
    // CSP conservadora: trava iframes (clickjacking), object/base, e restringe
    // origens. 'unsafe-inline' em script/style é necessário para o Next/Tailwind
    // funcionarem sem nonce; o app não renderiza HTML de usuário (sem XSS via dangerouslySetInnerHTML).
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
