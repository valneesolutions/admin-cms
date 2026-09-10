import type { CollectionConfig } from 'payload'
import { normalizeBlogSlug, updatePublicationDate, validateBlogSchema } from '../../lib/blog-seo.ts'

export const Articles: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'author', 'updatedAt'],
    components: {
      edit: {
        beforeDocumentControls: ['@/components/BlogPreviewTabs#BlogPreviewTabs'],
      },
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const source = typeof data.slug === 'string' && data.slug ? data.slug : data.title
        if (typeof source === 'string') data.slug = normalizeBlogSlug(source)
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data) return data
        const status = data.status ?? originalDoc?.status ?? 'draft'
        data.status = status
        const publishedAt = updatePublicationDate({
          status,
          previousStatus: originalDoc?.status,
          publishedAt: data.publishedAt ?? originalDoc?.publishedAt,
        })
        if (publishedAt !== undefined) data.publishedAt = publishedAt
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The public URL will be /blogs/{slug}. It is normalized automatically when saved.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set automatically when the article is first published.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'article-authors',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Popular', value: 'popular' },
        { label: 'Latest', value: 'latest' },
        { label: 'Featured', value: 'featured' },
        { label: 'Trending', value: 'trending' },
        { label: 'High Rated', value: 'high-rated' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Pick one or more predefined categories.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Excerpt',
      admin: { description: 'A short summary for article cards and the SEO preview.' },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Markdown Content',
      admin: {
        description: 'Write or paste Markdown content. This remains the API body format.',
        rows: 20,
        components: {
          Field: '@/components/MarkdownEditorField#MarkdownEditorField',
        },
      },
    },
    {
      name: 'livePreview',
      type: 'ui',
      admin: {
        components: { Field: '@/components/BlogLiveMarkdownPreview#BlogLiveMarkdownPreview' },
      },
    },
    {
      name: 'seoHealth',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '@/components/BlogSEOHealth#BlogSEOHealth' },
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      label: 'SEO title',
      admin: { position: 'sidebar', description: 'Recommended length: 40–60 characters. Uses the article title when blank.' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'SEO description',
      admin: { position: 'sidebar', description: 'Recommended length: 120–160 characters. Uses the excerpt when blank.' },
    },
    {
      name: 'articleSchema',
      type: 'code',
      label: 'Article JSON-LD',
      validate: (value) => validateBlogSchema(value, 'article'),
      admin: {
        position: 'sidebar',
        language: 'json',
        description: 'Optional schema.org Article, BlogPosting, or NewsArticle JSON-LD.',
      },
    },
    {
      name: 'faqSchema',
      type: 'code',
      label: 'FAQ JSON-LD',
      validate: (value) => validateBlogSchema(value, 'faq'),
      admin: {
        position: 'sidebar',
        language: 'json',
        description: 'Optional schema.org FAQPage JSON-LD.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      labels: { singular: 'Tag', plural: 'Tags' },
      fields: [{ name: 'tag', type: 'text', label: 'Tag' }],
      admin: {
        description: 'Add any free-form tags you want.',
      },
    },
    {
      name: 'readingTime',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'authorName',
      type: 'text',
      admin: { hidden: true },
      access: { read: () => false },
    },
  ],
}
