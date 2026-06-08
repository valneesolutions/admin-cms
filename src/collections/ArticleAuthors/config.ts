import type { CollectionConfig } from 'payload'

export const ArticleAuthors: CollectionConfig = {
  slug: 'article-authors',
  admin: { useAsTitle: 'name' },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}
