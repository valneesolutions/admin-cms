import type { CollectionConfig } from 'payload'
import { getPublicMediaURL } from '@/lib/media-url.ts'
import { buildSupabasePublicURL } from './lib/public-url.ts'
import { generateBlurDataURL, isEligibleForBlurDataURL } from './lib/generate-blur-data.ts'

export const Media: CollectionConfig = {
    slug: 'media',
    access: {
        read: () => true,
    },
    admin: {
        defaultColumns: ['filename', 'mediaUrl', 'alt', 'updatedAt'],
        listSearchableFields: ['filename', 'alt'],
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
        },
        {
            name: 'mediaUrl',
            type: 'text',
            label: 'Media URL',
            virtual: true,
            admin: {
                readOnly: true,
                description:
                    'Public Supabase bucket URL. In the list view, click the URL to copy it.',
                components: {
                    Cell: '@/collections/Media/MediaUrlCell#MediaUrlCell',
                },
            },
            hooks: {
                afterRead: [
                    ({ data }) => {
                        const filename = data?.filename ?? ''
                        return (
                            buildSupabasePublicURL(filename) ||
                            getPublicMediaURL({ filename })
                        )
                    },
                ],
            },
        },
        {
            name: 'blurDataUrl',
            type: 'text',
            admin: { hidden: true },
        },
    ],
    upload: true,
    hooks: {
        beforeChange: [
            async ({ operation, data, req }) => {
                if (operation !== 'create') return data
                if (!isEligibleForBlurDataURL(req.file?.mimetype)) return data
                const base64 = await generateBlurDataURL(req.file?.data)
                if (!base64) return data
                data.blurDataUrl = base64
                console.log(`Generated blur data URL for ${data.filename}`)
                return data
            },
        ],
    },
}
