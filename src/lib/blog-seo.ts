const SCHEMA_CONTEXT = 'https://schema.org'

const allowedSchemaTypes = {
  article: new Set(['Article', 'BlogPosting', 'NewsArticle']),
  faq: new Set(['FAQPage']),
} as const

type SchemaKind = keyof typeof allowedSchemaTypes

export function normalizeBlogSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateBlogSchema(value: unknown, kind: SchemaKind): true | string {
  if (value === undefined || value === null || value === '') return true
  if (typeof value !== 'string') return 'Schema must be JSON text.'

  let schema: unknown
  try {
    schema = JSON.parse(value)
  } catch {
    return 'Schema must be valid JSON.'
  }

  if (!schema || Array.isArray(schema) || typeof schema !== 'object') {
    return 'Schema must be a JSON object.'
  }

  const record = schema as Record<string, unknown>
  if (record['@context'] !== SCHEMA_CONTEXT) {
    return `Schema @context must be "${SCHEMA_CONTEXT}".`
  }

  const type = record['@type']
  if (typeof type !== 'string' || !allowedSchemaTypes[kind].has(type as never)) {
    return `${kind === 'article' ? 'Article' : 'FAQ'} schema @type must be one of: ${[...allowedSchemaTypes[kind]].join(', ')}.`
  }

  return true
}

export function updatePublicationDate({
  status,
  previousStatus,
  publishedAt,
}: {
  status: string
  previousStatus?: string
  publishedAt?: string | null
}): string | null | undefined {
  if (status === 'published') {
    return publishedAt ?? new Date().toISOString()
  }

  if (previousStatus === 'published') return null
  return publishedAt
}
