import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['ajv'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'ajv/index.js': 'ajv',
    }
    return config
  },
}

export default withPayload(nextConfig)
