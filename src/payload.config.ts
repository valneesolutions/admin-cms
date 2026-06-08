// --- EMERGENCY FIX START ---
import { webcrypto } from 'node:crypto'
if (!global.crypto) {
//   @ts-expect-error -- Fixing type mismatch with Payload config
  global.crypto = webcrypto
}
if (typeof global.CacheStorage === 'undefined') {
    // @ts-expect-error -- Fixing type mismatch with Payload config
    global.CacheStorage = class CacheStorage {}
}
// --- EMERGENCY FIX END ---

import { postgresAdapter } from '@payloadcms/db-postgres'
import { FixedToolbarFeature, lexicalEditor, EXPERIMENTAL_TableFeature, UploadFeature } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import 'dotenv/config'

import { Users } from './collections/Users'
import { Media } from './collections/Media/config'
import { env } from './lib/env'
import { Articles } from './collections/Articles/config'
import { ArticleAuthors } from './collections/ArticleAuthors/config'
import { CaseStudies } from './collections/CaseStudies'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    routes: {
        admin: '/',
    },
    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
        meta: {
            titleSuffix: '- Valnee Admin',
            icons: [
                {
                    rel: 'icon',
                    type: 'image/svg+xml',
                    url: '/icon.svg',
                },
            ],
        },
        components: {
            graphics: {
                Logo: '@/components/AdminGraphics#Logo',
                Icon: '@/components/AdminGraphics#Icon',
            },
        },
    },
    collections: [Users, Media, Articles, ArticleAuthors, CaseStudies],
    editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
            ...defaultFeatures,
            FixedToolbarFeature(),
            EXPERIMENTAL_TableFeature(),
            UploadFeature({
                collections: {
                    media: {
                        fields: [
                            {
                                name: 'caption',
                                type: 'text',
                                label: 'Caption',
                            },
                        ],
                    },
                },
            }),
        ],
    }),
    secret: env.PAYLOAD_SECRET,
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: postgresAdapter({
        pool: {
            connectionString: env.DATABASE_URI,
            ssl: env.DATABASE_URI?.includes('pooler.supabase.com')
                ? { rejectUnauthorized: false }
                : undefined,
        },
        schemaName: 'payload_cms',
        migrationDir: path.resolve(dirname, 'migrations'),
    }),
    sharp,
    plugins: [
        s3Storage({
            collections: {
                media: true,
            },
            bucket: process.env.S3_BUCKET!,
            config: {
                credentials: {
                    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
                },
                region: process.env.S3_REGION,
                endpoint: process.env.S3_ENDPOINT,
                forcePathStyle: true,
            },
            clientUploads: true,
        }),
    ],
})
