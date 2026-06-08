import config from '@/payload.config'
import '@payloadcms/next/css'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap'
import '../../styles/custom-admin.scss'
import { myServerFunction } from './server-functions'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={myServerFunction}
  >
    {children}
  </RootLayout>
)

export default Layout
