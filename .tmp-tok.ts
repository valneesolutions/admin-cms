import { getPayload } from 'payload'
import config from './src/payload.config.ts'
const payload = await getPayload({ config })
const doc = await payload.findByID({ collection: 'case-studies', id: 6, overrideAccess: true, depth: 0 })
const m = (doc.content as string).match(/token=[A-Za-z0-9._-]+/)
console.log(m ? m[0] : '')
process.exit(0)
