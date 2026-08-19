import 'dotenv/config'
import config from './payload.config'
import { getPayload } from 'payload'

const migrateArticleAuthors = async () => {
  const payload = await getPayload({ config })
  let page = 1

  while (true) {
    const articles = await payload.find({
      collection: 'blogs',
      depth: 0,
      limit: 100,
      page,
      overrideAccess: true,
    })

    for (const article of articles.docs) {
      if (article.author) continue

      const legacyName = typeof article.authorName === 'string' && article.authorName.trim()
        ? article.authorName.trim()
        : 'Admin'
      const existing = await payload.find({
        collection: 'article-authors',
        depth: 0,
        limit: 1,
        where: { name: { equals: legacyName } },
        overrideAccess: true,
      })
      const author = existing.docs[0] ?? await payload.create({
        collection: 'article-authors',
        data: { name: legacyName },
        overrideAccess: true,
      })

      await payload.update({
        collection: 'blogs',
        id: article.id,
        data: { author: author.id },
        overrideAccess: true,
      })
    }

    if (!articles.hasNextPage) break
    page += 1
  }

  console.log('Article author migration completed.')
}

migrateArticleAuthors().catch((error) => {
  console.error('Article author migration failed:', error)
  process.exit(1)
})
