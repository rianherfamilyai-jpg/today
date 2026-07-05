import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project so it never walks up the
  // tree and adopts a stray parent lockfile. This template lives inside the
  // ai-code meta-repo; product repos spun up from it are standalone, where this
  // is a harmless no-op.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
