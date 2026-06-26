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
};

export default nextConfig;
