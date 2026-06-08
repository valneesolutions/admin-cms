import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    // Set SKIP_ENV_VALIDATION=true in CI or during `next build` if you
    // don't want to provide env vars at build time. Validation still runs
    // when the server actually starts.
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    server: {
        DATABASE_URI: z.string().url().min(1),
        PAYLOAD_SECRET: z.string().min(1),
        CMS_SEED_ADMIN_EMAIL: z.email(),
        CMS_SEED_ADMIN_PASSWORD: z.string().min(1),
    },
    client: {},
    runtimeEnv: {
        DATABASE_URI: process.env.DATABASE_URI,
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
        CMS_SEED_ADMIN_EMAIL: process.env.CMS_SEED_ADMIN_EMAIL,
        CMS_SEED_ADMIN_PASSWORD: process.env.CMS_SEED_ADMIN_PASSWORD,
    },
})
