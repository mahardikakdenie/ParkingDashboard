/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Disable body size limit for API routes to support long-running SSE streams.
  // Without this, Next.js may prematurely terminate large or streaming responses.
  experimental: {
    serverActions: {
      bodySizeLimit: undefined,
    },
  },
};

export default nextConfig;
