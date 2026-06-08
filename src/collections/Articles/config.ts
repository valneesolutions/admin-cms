import { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
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
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [({ value, data }) => {
          if (!value && data?.title) {
            return data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
          }
          return value
        }],
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Markdown Content',
      admin: {
        description: 'Paste your Markdown code here (like GitHub readme).',
        rows: 20,
      },
    },
    {
      name: 'summary',
      type: 'textarea',
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
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'authorName',
      type: 'text',
    },
    {
      name: 'readingTime',
      type: 'text',
    },
  ],
}
