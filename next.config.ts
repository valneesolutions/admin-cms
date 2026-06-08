import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default withPayload(nextConfig)
