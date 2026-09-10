import assert from 'node:assert/strict'
import { normalizeMarkdownContent } from './normalize-markdown.ts'

// Escaped nested-link form
assert.equal(
  normalizeMarkdownContent(
    '![Hiring an MVP Team in Mumbai: Costs, Risks & Alternatives]\\([https://x.s3.amazonaws.com/a.webp](https://x.s3.amazonaws.com/a.webp)\\)',
  ),
  '![Hiring an MVP Team in Mumbai: Costs, Risks & Alternatives](https://x.s3.amazonaws.com/a.webp)',
)

// Escaped bare-url form
assert.equal(
  normalizeMarkdownContent('![What “Founder-Friendly Tech” Actually Means]\\((https://s.supabase.co/storage/v1/object/public/new_blogs/Blog.webp)\\)'),
  '![What “Founder-Friendly Tech” Actually Means](https://s.supabase.co/storage/v1/object/public/new_blogs/Blog.webp)',
)

// Signed supabase URL -> public, token stripped
assert.equal(
  normalizeMarkdownContent(
    '![img](https://mfaebogwihppaoyyclzs.supabase.co/storage/v1/object/sign/new_blogs/image%2018.png?token=eyJabc.def_ghi)',
  ),
  '![img](https://mfaebogwihppaoyyclzs.supabase.co/storage/v1/object/public/new_blogs/image%2018.png)',
)

// Valid markdown untouched
const ok = '![alt](https://s.supabase.co/storage/v1/object/public/new_blogs/Blog.webp) and a [link](https://x.com/a_(b))'
assert.equal(normalizeMarkdownContent(ok), ok)

console.log('normalize-markdown tests passed')