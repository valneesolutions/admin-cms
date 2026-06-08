import { CollectionConfig } from 'payload'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status'],
  },
  access: {
    read: () => true,
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
        description: 'URL identifier (e.g., signalmint-casestudy)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Cover Image',
    },
    {
      name: 'category',
      type: 'text',
      defaultValue: 'Case Study',
      admin: { width: '50%' },
    },
    {
      name: 'reading_time',
      type: 'text',
      defaultValue: '5 min',
      admin: { width: '50%' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'left_description',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'code',
      required: true,
      label: 'Content (Markdown)',
      admin: {
        language: 'markdown',
        description: 'Write your case study here using Markdown.',
      },
    },
    {
      name: 'page_url',
      type: 'text',
      label: 'Landing Page URL (Live Link)',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'author_name',
      type: 'text',
      defaultValue: 'Valnee Team',
      admin: { position: 'sidebar' },
    },
    {
      name: 'author_image',
      type: 'text',
      defaultValue: '/valneeLogo.svg',
      admin: { position: 'sidebar' },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
