/**
 * Builds the stable public Supabase object URL for an uploaded filename.
 * Requires the storage bucket to be public so the URL resolves without a
 * signed token (signed tokens expire and break published content).
 */
export function buildSupabasePublicURL(filename: string): string {
    const endpoint = process.env.S3_ENDPOINT ?? ''
    const bucket = process.env.S3_BUCKET ?? ''
    const match = endpoint.match(/^https:\/\/([^.]+)\.storage\.supabase\.co/)
    if (!match || !bucket || !filename) return ''
    return `https://${match[1]}.supabase.co/storage/v1/object/public/${bucket}/${encodeURIComponent(
        filename,
    )}`
}
