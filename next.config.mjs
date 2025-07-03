/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ensure the externals array exists
    if (!config.externals) {
      config.externals = [];
    }
    // Add 'canvas' to externals if it's a server build
    if (isServer) {
      config.externals.push({ canvas: "canvas" }); // required for the canvas to work
    }
    return config;
  },
}

export default nextConfig
