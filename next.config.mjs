import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for Vercel deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure for Vercel deployment
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Don't modify any styling
  compiler: {
    removeConsole: false,
  },
  // Keep webpack config minimal to preserve existing behavior
  webpack: (config, { isServer }) => {
    // Preserve existing module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    
    // Handle SVG files as URLs for static assets
    config.module.rules.push({
      test: /\.svg$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]'
      }
    });
    
    return config;
  },
}

export default nextConfig;