/**
 * Normalizes markdown content that admins paste from external tools
 * (chat assistants, docs, etc.) so images render correctly.
 *
 * Two recurring problems are repaired:
 * 1. Escaped-link image syntax produced when quoting markdown elsewhere:
 *      ![Alt]\([https://x/a.webp](https://x/a.webp)\)   ->  ![Alt](https://x/a.webp)
 *      ![Alt]\((https://x/a.webp)\)                     ->  ![Alt](https://x/a.webp)
 * 2. Signed Supabase storage URLs (`/storage/v1/object/sign/...?token=...`),
 *    whose tokens expire and break published images. They are rewritten to
 *    the bucket's public URL form, which never expires.
 */

export function normalizeMarkdownContent(content: string): string {
    if (!content) return content
    let next = content

    // ![Alt]\([text](url)\) and ![Alt]\((url)\) -> ![Alt](url)
    next = next.replace(
        /!\[([^\]]*)\]\\\(\[?([^)\]]*)\]?\(([^)]*)\)\\\)/g,
        (_m, alt: string, _text: string, url: string) => `![${alt}](${url})`,
    )

    // Signed Supabase URLs -> public bucket URLs (strip expiring token).
    // Covers both host forms: <project>.supabase.co and <project>.storage.supabase.co.
    next = next.replace(
        /(https?:\/\/)([^\s\/)"'<>]+?)(?:\.storage)?\.supabase\.co\/storage\/v1\/object\/sign\/([^\s)"'<>]+)/g,
        (_m, proto: string, project: string, pathAndQuery: string) => {
            const path = pathAndQuery.split('?')[0]
            return `${proto}${project}.supabase.co/storage/v1/object/public/${path}`
        },
    )

    return next
}