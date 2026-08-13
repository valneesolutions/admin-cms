import * as addBlogSeoAndAuthor from './20260811_140000_add_blog_seo_and_author.ts'

export const migrations = [
  {
    up: addBlogSeoAndAuthor.up,
    down: addBlogSeoAndAuthor.down,
    name: '20260811_140000_add_blog_seo_and_author',
  },
]
