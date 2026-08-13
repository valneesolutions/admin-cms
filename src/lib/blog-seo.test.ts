import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBlogSlug, updatePublicationDate, validateBlogSchema } from './blog-seo'

test('normalizes blog slugs consistently', () => {
  assert.equal(normalizeBlogSlug('  SEO: A Guide_to Growth!  '), 'seo-a-guide-to-growth')
})

test('validates supported article and FAQ JSON-LD', () => {
  assert.equal(validateBlogSchema('{"@context":"https://schema.org","@type":"BlogPosting"}', 'article'), true)
  assert.equal(validateBlogSchema('{"@context":"https://schema.org","@type":"FAQPage"}', 'faq'), true)
  assert.match(String(validateBlogSchema('{"@context":"https://schema.org","@type":"WebPage"}', 'article')), /must be one of/)
  assert.equal(validateBlogSchema('{not json}', 'faq'), 'Schema must be valid JSON.')
})

test('preserves, creates, and clears publication dates for state transitions', () => {
  const date = '2026-08-11T10:00:00.000Z'
  assert.equal(updatePublicationDate({ status: 'published', previousStatus: 'published', publishedAt: date }), date)
  assert.equal(updatePublicationDate({ status: 'draft', previousStatus: 'published', publishedAt: date }), null)
  assert.match(String(updatePublicationDate({ status: 'published', previousStatus: 'draft' })), /^\d{4}-\d{2}-\d{2}T/)
})
