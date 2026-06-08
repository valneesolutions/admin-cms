import 'dotenv/config'
import config from './payload.config'
import { getPayload } from 'payload'

const createAdmin = async () => {
  console.log('--- STARTING ADMIN CREATION ---')

  const payload = await getPayload({ config })
  console.log('✅ Payload initialized. Connected to DB.')

  const email = process.env.CMS_SEED_ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.CMS_SEED_ADMIN_PASSWORD || 'admin123'

  console.log(`Attempting to create user: ${email}`)

  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
  })

  if (existingUsers.totalDocs > 0) {
    console.log('⚠️ User already exists! No need to create.')
    process.exit(0)
  }

  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
    },
  })

  console.log('🎉 SUCCESS: Admin user created!')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('-------------------------------')
  process.exit(0)
}

createAdmin().catch((err) => {
  console.error('❌ FATAL ERROR:')
  console.error(err)
  process.exit(1)
})
