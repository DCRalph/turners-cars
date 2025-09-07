/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["content.tgstatic.co.nz"],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
    ],
  },
};

export default config;
