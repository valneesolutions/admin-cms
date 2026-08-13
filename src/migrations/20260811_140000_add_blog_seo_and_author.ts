import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "payload_cms"."enum_blogs_status" AS ENUM ('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TABLE "payload_cms"."blogs"
      ADD COLUMN IF NOT EXISTS "status" "payload_cms"."enum_blogs_status" DEFAULT 'draft' NOT NULL,
      ADD COLUMN IF NOT EXISTS "author_id" integer,
      ADD COLUMN IF NOT EXISTS "category" varchar,
      ADD COLUMN IF NOT EXISTS "meta_title" varchar,
      ADD COLUMN IF NOT EXISTS "meta_description" varchar,
      ADD COLUMN IF NOT EXISTS "article_schema" varchar,
      ADD COLUMN IF NOT EXISTS "faq_schema" varchar;

    ALTER TABLE "payload_cms"."blogs" ALTER COLUMN "slug" SET NOT NULL;
    ALTER TABLE "payload_cms"."article_authors" ALTER COLUMN "name" SET NOT NULL;

    DO $$ BEGIN
      ALTER TABLE "payload_cms"."blogs"
        ADD CONSTRAINT "blogs_author_id_article_authors_id_fk"
        FOREIGN KEY ("author_id") REFERENCES "payload_cms"."article_authors"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "blogs_slug_idx" ON "payload_cms"."blogs" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "blogs_author_idx" ON "payload_cms"."blogs" USING btree ("author_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "article_authors_name_idx" ON "payload_cms"."article_authors" USING btree ("name");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_cms"."article_authors_name_idx";
    DROP INDEX IF EXISTS "payload_cms"."blogs_author_idx";
    DROP INDEX IF EXISTS "payload_cms"."blogs_slug_idx";
    ALTER TABLE "payload_cms"."blogs" DROP CONSTRAINT IF EXISTS "blogs_author_id_article_authors_id_fk";
    ALTER TABLE "payload_cms"."blogs"
      DROP COLUMN IF EXISTS "faq_schema",
      DROP COLUMN IF EXISTS "article_schema",
      DROP COLUMN IF EXISTS "meta_description",
      DROP COLUMN IF EXISTS "meta_title",
      DROP COLUMN IF EXISTS "category",
      DROP COLUMN IF EXISTS "author_id",
      DROP COLUMN IF EXISTS "status";
    DROP TYPE IF EXISTS "payload_cms"."enum_blogs_status";
  `)
}
