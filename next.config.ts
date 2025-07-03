import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Add any other config options you might already have here

  eslint: {
    // Skip ESLint checks during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  images: {
    // Disable image optimization in environments where the default
    // sharp-based optimizer isn’t available
    unoptimized: true,
  },
}

export default nextConfig
