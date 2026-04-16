import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Produces a self-contained `.next/standalone/server.js` during
  // `next build` so the production Docker image only needs Node.js and
  // the pruned dependency tree Next.js ships inside standalone/. Required
  // by the CranL Dockerfile deploy.
  output: "standalone",
  reactCompiler: true,
  turbopack: {
    root: __dirname,
    resolveAlias: {
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
