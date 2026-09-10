import "dotenv/config";
import config from "./payload.config";
import { getPayload } from "payload";

/**
 * One-time data migration for the category/tags swap:
 *
 * - `category` is now a predefined multi-select (popular, latest, featured,
 *   trending, high-rated). Old free-text category values are dropped.
 * - `tags` is now free-form. Predefined keywords that used to live in tags
 *   (featured, popular, latest, ...) are moved into `category`.
 *
 * Run with: npm run migrate:category-tags
 */

const PREDEFINED = [
  "popular",
  "latest",
  "featured",
  "trending",
  "high-rated",
] as const;

type CategoryValue = (typeof PREDEFINED)[number];

const normalizeCategoryValue = (value: unknown): CategoryValue | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");
  return (PREDEFINED as readonly string[]).includes(normalized)
    ? (normalized as CategoryValue)
    : null;
};

const migrateCollection = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: "blogs" | "case-studies",
) => {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1000,
    overrideAccess: true,
  });

  for (const doc of result.docs) {
    const tagStrings: string[] = (doc.tags ?? [])
      .map((t: any) => (typeof t?.tag === "string" ? t.tag.trim().toLowerCase() : null))
      .filter((t): t is string => Boolean(t));

    const categoryFromField = normalizeCategoryValue(doc.category);
    const categoryFromTags = tagStrings
      .map((tag) => normalizeCategoryValue(tag.replace(/\s+/g, "-")))
      .filter((c): c is CategoryValue => Boolean(c));

    const newCategory = Array.from(
      new Set(
        [categoryFromField, ...categoryFromTags].filter(Boolean) as CategoryValue[],
      ),
    );
    const newTags = tagStrings
      .filter((tag) => !normalizeCategoryValue(tag.replace(/\s+/g, "-")))
      .map((tag) => ({ tag }));

    const oldCategory = Array.isArray(doc.category)
      ? doc.category
      : doc.category
        ? [doc.category]
        : [];
    const oldTags = doc.tags ?? [];

    const categoryChanged =
      oldCategory.length !== newCategory.length ||
      newCategory.some((c) => !oldCategory.includes(c));
    const tagsChanged =
      oldTags.length !== newTags.length ||
      newTags.some((t: any, i) => oldTags[i]?.tag !== t.tag);

    if (!categoryChanged && !tagsChanged) continue;

    try {
      await payload.update({
        collection,
        id: doc.id,
        data: {
          ...(categoryChanged ? { category: newCategory } : {}),
          ...(tagsChanged ? { tags: newTags } : {}),
        },
        overrideAccess: true,
      });
      console.log(
        `Updated ${collection} "${doc.title}": category=[${newCategory.join(", ")}], tags=[${newTags.map((t: any) => t.tag).join(", ")}]`,
      );
    } catch (error) {
      console.error(`Error updating ${collection} "${doc.title}":`, error);
    }
  }

  console.log(`Migrated ${result.docs.length} ${collection} document(s).`);
};

const run = async () => {
  const payload = await getPayload({ config });
  console.log("Starting category/tags migration...");
  await migrateCollection(payload, "blogs");
  await migrateCollection(payload, "case-studies");
  console.log("Category/tags migration completed!");
};

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});