export type MediaUrlSource = {
    mediaUrl?: string | null
    url?: string | null
    filename?: string | null
}

/**
 * Best stable URL for a media doc, usable in markdown.
 * Prefers the server-computed public bucket URL (`mediaUrl`), then converts
 * a stored S3-gateway URL to its public form, and finally falls back to the
 * Payload file route.
 */
export function getPublicMediaURL(doc: MediaUrlSource): string {
    if (doc?.mediaUrl) return doc.mediaUrl
    const url = doc?.url
    if (url && url.includes('/storage/v1/s3/')) {
        return url.replace(
            '.storage.supabase.co/storage/v1/s3/',
            '.supabase.co/storage/v1/object/public/',
        )
    }
    if (doc?.filename) return `/api/media/file/${encodeURIComponent(doc.filename)}`
    return url || ''
}

/** Markdown image snippet for a media doc, e.g. ![alt](public-url). */
export function getMediaImageMarkdown(doc: MediaUrlSource & { alt?: string | null }): string {
    const url = getPublicMediaURL(doc)
    if (!url) return ''
    const alt =
        doc?.alt?.trim() ||
        doc?.filename?.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') ||
        'image'
    return `![${alt}](${url})`
}
