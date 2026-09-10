'use client'

import { toast } from '@payloadcms/ui'
import React from 'react'

type MediaUrlCellProps = {
    cellData?: unknown
}

export const MediaUrlCell: React.FC<MediaUrlCellProps> = ({ cellData }) => {
    const url = typeof cellData === 'string' ? cellData : ''

    if (!url) {
        return <span>—</span>
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success('Media URL copied to clipboard')
        } catch {
            toast.error('Could not copy URL')
        }
    }

    return (
        <button
            type="button"
            onClick={copy}
            title={`${url} (click to copy)`}
            style={{
                display: 'block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--theme-elevation-500)',
                cursor: 'copy',
                font: 'inherit',
            }}
        >
            {url}
        </button>
    )
}
