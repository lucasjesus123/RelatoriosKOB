import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Not using output: "standalone" — its dependency tracing misses the
  // dynamically-required native @napi-rs/canvas binary that pdfjs-dist
  // needs for DOMMatrix in Node, so the full node_modules is shipped instead.
};

export default nextConfig;
