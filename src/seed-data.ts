import "dotenv/config";
import config from "./payload.config";
import { getPayload } from "payload";

/**
 * Seed script for Blogs and Case Studies data
 *
 * This script populates the database with:
 * - 5 blogs with predefined categories (featured, popular, latest) for filtering
 * - 8 case studies with correct slugs for category mapping
 *
 * The tags and categories follow the specifications in BLOGS_AND_CASE_STUDIES_TAGS.md
 *
 * Run with: npm run seed:data
 */

// Blog seed data based on BLOGS_AND_CASE_STUDIES_TAGS.md
const blogsSeedData: Array<Record<string, any>> = [
  {
    title:
      "Why Custom Software Development Is Cheaper Than You Think in the Long Run",
    slug: "why-custom-software-development-is-cheaper",
    status: "published",
    publishedAt: "2024-01-15T10:00:00.000Z",
    author: null, // Will be set after author is created
    category: ["featured"],
    summary:
      "Discover how custom software development can save you money in the long term compared to off-the-shelf solutions.",
    content:
      "# Why Custom Software Development Is Cheaper Than You Think in the Long Run\n\nContent here...",
    coverImage: null, // Will need to be set with actual media ID
    tags: [{ tag: "development" }, { tag: "cost-saving" }],
    readingTime: "8 min",
    metaTitle: "Why Custom Software Development Is Cheaper Than You Think",
    metaDescription:
      "Discover how custom software development can save you money in the long term.",
  },
  {
    title:
      "How to Validate a Startup Idea Before Spending Money on Development",
    slug: "how-to-validate-startup-idea",
    status: "published",
    publishedAt: "2024-02-20T10:00:00.000Z",
    author: null,
    category: ["popular", "latest"],
    summary:
      "Learn effective strategies to validate your startup idea before investing in development.",
    content:
      "# How to Validate a Startup Idea Before Spending Money on Development\n\nContent here...",
    coverImage: null,
    tags: [{ tag: "startup" }, { tag: "validation" }],
    readingTime: "10 min",
    metaTitle: "How to Validate a Startup Idea Before Spending Money",
    metaDescription:
      "Learn effective strategies to validate your startup idea.",
  },
  {
    title: "Why Startups Need a Technical Partner, Not Just Developers",
    slug: "why-startups-need-technical-partner",
    status: "published",
    publishedAt: "2024-03-10T10:00:00.000Z",
    author: null,
    category: ["popular", "latest"],
    summary:
      "Understand why having a technical partner is crucial for startup success beyond just hiring developers.",
    content:
      "# Why Startups Need a Technical Partner, Not Just Developers\n\nContent here...",
    coverImage: null,
    tags: [{ tag: "startup" }, { tag: "partnership" }],
    readingTime: "12 min",
    metaTitle: "Why Startups Need a Technical Partner, Not Just Developers",
    metaDescription:
      "Understand why having a technical partner is crucial for startup success.",
  },
  {
    title: "What 'Founder-Friendly Tech' Actually Means",
    slug: "what-founder-friendly-tech-means",
    status: "published",
    publishedAt: "2024-04-05T10:00:00.000Z",
    author: null,
    category: ["popular", "latest"],
    summary:
      "Explore the true meaning of founder-friendly technology and how it benefits your startup.",
    content: "# What 'Founder-Friendly Tech' Actually Means\n\nContent here...",
    coverImage: null,
    tags: [{ tag: "technology" }, { tag: "founders" }],
    readingTime: "7 min",
    metaTitle: "What 'Founder-Friendly Tech' Actually Means",
    metaDescription: "Explore the true meaning of founder-friendly technology.",
  },
  {
    title: "Why Non-Technical Founders Often Build Better MVPs",
    slug: "why-non-technical-founders-build-better-mvps",
    status: "published",
    publishedAt: "2024-05-12T10:00:00.000Z",
    author: null,
    category: ["popular", "latest"],
    summary:
      "Discover why non-technical founders often create superior MVPs and how to leverage this advantage.",
    content:
      "# Why Non-Technical Founders Often Build Better MVPs\n\nContent here...",
    coverImage: null,
    tags: [{ tag: "mvp" }, { tag: "non-technical" }],
    readingTime: "9 min",
    metaTitle: "Why Non-Technical Founders Often Build Better MVPs",
    metaDescription:
      "Discover why non-technical founders often create superior MVPs.",
  },
];

// Case Studies seed data based on BLOGS_AND_CASE_STUDIES_TAGS.md
const caseStudiesSeedData: Array<Record<string, any>> = [
  {
    title: "Saga AI",
    slug: "saga-ai",
    image: null, // Will need to be set with actual media ID
    cover_image: null,
    category: [],
    reading_time: "8 min",
    description: "AI Optimization & Search Visibility platform",
    left_description:
      "Advanced AI-powered optimization tools for better search visibility.",
    content:
      "# Saga AI\n\nAI Optimization & Search Visibility platform content...",
    page_url: "",
    tags: [
      { tag: "web-app" },
      { tag: "ai" },
      { tag: "optimization" },
      { tag: "search" },
    ],
    author_name: "Valnee Team",
    author_image: "/valneeLogo.svg",
    is_active: true,
    publishedAt: "2024-01-01T10:00:00.000Z",
  },
  {
    title: "Thyne",
    slug: "thyne",
    image: null,
    cover_image: null,
    category: [],
    reading_time: "10 min",
    description: "Real-time IoT medical dashboards",
    left_description:
      "Real-time monitoring and IoT medical dashboard solutions.",
    content: "# Thyne\n\nReal-time IoT medical dashboards content...",
    page_url: "",
    tags: [
      { tag: "app" },
      { tag: "web-app" },
      { tag: "iot" },
      { tag: "medical" },
      { tag: "dashboard" },
    ],
    author_name: "Valnee Team",
    author_image: "/valneeLogo.svg",
    is_active: true,
    publishedAt: "2024-02-01T10:00:00.000Z",
  },
  {
    title: "Zoci",
    slug: "zoci",
    image: null,
    cover_image: null,
    category: [],
    reading_time: "5 min",
    description: "Premium Shopify jewelry storefront",
    left_description:
      "Beautiful and high-converting Shopify storefront for premium jewelry brands.",
    content: "# Zoci\n\nPremium Shopify jewelry storefront content...",
    page_url: "",
    tags: [
      { tag: "landing-pages" },
      { tag: "ecommerce" },
      { tag: "shopify" },
      { tag: "jewelry" },
    ],
    author_name: "Valnee Team",
    author_image: "/valneeLogo.svg",
    is_active: true,
    publishedAt: "2024-03-01T10:00:00.000Z",
  },
  {
    title: "Thyne AI Case Study",
    slug: "thyne-ai-case-study",
    image: null,
    cover_image: null,
    category: [],
    reading_time: "12 min",
    description: "AI-powered medical IoT platform",
    left_description:
      "Comprehensive case study of the Thyne AI platform with real-time IoT capabilities.",
    content:
      "# Thyne AI Case Study\n\nAI-powered medical IoT platform content...",
    page_url:
      "https://play.google.com/store/apps/details?id=chawla_solution.com.thyne_jewls",
    tags: [
      { tag: "app" },
      { tag: "web-app" },
      { tag: "ai" },
      { tag: "iot" },
      { tag: "medical" },
      { tag: "case-study" },
    ],
    author_name: "Valnee Team",
    author_image: "/valneeLogo.svg",
    is_active: true,
    publishedAt: "2024-04-01T10:00:00.000Z",
  },
  {
    title: "Project Pluto",
    slug: "project-pluto",
    image: null,
    cover_image: null,
    category: [],
    reading_time: "7 min",
    description: "Innovative MVP development project",
    left_description:
      "Rapid prototyping and MVP development for innovative startups.",
    content: "# Project Pluto\n\nInnovative MVP development project content...",
    page_url: "",
    tags: [
      { tag: "app" },
      { tag: "mvps" },
      { tag: "prototype" },
      { tag: "startup" },
    ],
    author_name: "Valnee Team",
    author_image: "/valneeLogo.svg",
    is_active: true,
    publishedAt: "2024-05-01T10:00:00.000Z",
  },
  {
    title: "Layers Landing Page Case Study",
    slug: "layers-landingpage-casestudy",
    image: null,
    cover_image: null,
    category: [],
    reading_time: "6 min",
    description: "High-converting landing page design",
    left_description:
      "Case study of a high-converting landing page that drives conversions.",
    content:
      "# Layers Landing Page Case Study\n\nHigh-converting landing page design content...",
    page_url: "",
    tags: [
      { tag: "landing-pages" },
      { tag: "design" },
      { tag: "conversion" },
      { tag: "case-study" },
    ],
    author_name: "Valnee Team",
    author_image: "/valneeLogo.svg",
    is_active: true,
    publishedAt: "2024-06-01T10:00:00.000Z",
  },
  {
    title: "Optirank Platform Case Study",
    slug: "optirank-platform-casestudy",
    image: null,
    cover_image: null,
    category: [],
    reading_time: "9 min",
    description: "SEO optimization and ranking platform",
    left_description:
      "Comprehensive SEO platform for improving search rankings.",
    content:
      "# Optirank Platform Case Study\n\nSEO optimization and ranking platform content...",
    page_url: "",
    tags: [
      { tag: "web-app" },
      { tag: "seo" },
      { tag: "ranking" },
      { tag: "platform" },
      { tag: "case-study" },
    ],
    author_name: "Valnee Team",
    author_image: "/valneeLogo.svg",
    is_active: true,
    publishedAt: "2024-07-01T10:00:00.000Z",
  },
  {
    title: "Ghostwriter AI Case Study",
    slug: "ghostwriter-ai-case-study",
    image: null,
    cover_image: null,
    category: [],
    reading_time: "8 min",
    description: "AI-powered content creation platform",
    left_description:
      "Case study of an AI-powered content creation and ghostwriting platform.",
    content:
      "# Ghostwriter AI Case Study\n\nAI-powered content creation platform content...",
    page_url: "",
    tags: [
      { tag: "web-app" },
      { tag: "mvps" },
      { tag: "ai" },
      { tag: "content" },
      { tag: "ghostwriting" },
      { tag: "case-study" },
    ],
    author_name: "Valnee Team",
    author_image: "/valneeLogo.svg",
    is_active: true,
    publishedAt: "2024-08-01T10:00:00.000Z",
  },
];

const seedData = async () => {
  const payload = await getPayload({ config });

  console.log("Starting seed data process...");

  // First, check if data already exists
  const existingBlogs = await payload.find({
    collection: "blogs",
    depth: 0,
    limit: 100,
    overrideAccess: true,
  });

  const existingCaseStudies = await payload.find({
    collection: "case-studies",
    depth: 0,
    limit: 100,
    overrideAccess: true,
  });

  // Get existing media for placeholder images
  const existingMedia = await payload.find({
    collection: "media",
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });

  const placeholderImageId = existingMedia.docs[0]?.id;

  console.log(`Found ${existingBlogs.docs.length} existing blogs`);
  console.log(`Found ${existingCaseStudies.docs.length} existing case studies`);
  console.log(`Found ${existingMedia.docs.length} existing media items`);

  // Get or create author
  let authorId: number;
  const authorSearch = await payload.find({
    collection: "article-authors",
    depth: 0,
    limit: 1,
    where: { name: { equals: "Valnee Team" } },
    overrideAccess: true,
  });

  if (!authorSearch.docs[0]) {
    const newAuthor = await payload.create({
      collection: "article-authors",
      data: { name: "Valnee Team" },
      overrideAccess: true,
    });
    authorId = newAuthor.id;
    console.log("Created author:", newAuthor.name);
  } else {
    authorId = authorSearch.docs[0].id;
    console.log("Using existing author:", authorSearch.docs[0].name);
  }

  // Seed blogs
  for (const blogData of blogsSeedData) {
    const existing = await payload.find({
      collection: "blogs",
      depth: 0,
      limit: 1,
      where: { slug: { equals: blogData.slug } },
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      console.log(`Blog already exists: ${blogData.title} (${blogData.slug})`);

      // Check if existing blog needs tag updates
      const existingBlog = existing.docs[0];
      const existingTagStrings =
        existingBlog.tags?.map((t: any) => t.tag) || [];
      const requiredTags = blogData.tags?.map((t: any) => t.tag) || [];

      const missingTags = requiredTags.filter(
        (tag: string) => !existingTagStrings.includes(tag),
      );

      if (missingTags.length > 0) {
        try {
          const updatedTags = [
            ...(existingBlog.tags || []),
            ...missingTags.map((tag: string) => ({ tag })),
          ];
          await payload.update({
            collection: "blogs",
            id: existingBlog.id,
            data: { tags: updatedTags },
            overrideAccess: true,
          });
          console.log(
            `Updated blog tags for ${existingBlog.title}: added ${missingTags.join(", ")}`,
          );
        } catch (error) {
          console.error(`Error updating blog ${existingBlog.title}:`, error);
        }
      }
      continue;
    }

    if (!placeholderImageId) {
      console.log(
        `Skipping blog creation for ${blogData.title} - no placeholder image available`,
      );
      continue;
    }

    const data = {
      ...blogData,
      author: authorId,
      coverImage: placeholderImageId,
    };

    try {
      const created = await payload.create({
        collection: "blogs",
        data,
        draft: true,
        overrideAccess: true,
      });
      console.log(
        `Created blog: ${created.title} (${created.slug}) with tags:`,
        blogData.tags?.map((t: any) => t.tag).join(", "),
      );
    } catch (error) {
      console.error(`Error creating blog ${blogData.title}:`, error);
    }
  }

  // Seed case studies
  for (const caseStudyData of caseStudiesSeedData) {
    const existing = await payload.find({
      collection: "case-studies",
      depth: 0,
      limit: 1,
      where: { slug: { equals: caseStudyData.slug } },
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      console.log(
        `Case study already exists: ${caseStudyData.title} (${caseStudyData.slug})`,
      );

      const existingCaseStudy = existing.docs[0];
      const updates: Record<string, any> = {};

      // Check category (now a multi-select, stored as an array)
      const existingCategory: string[] = Array.isArray(
        existingCaseStudy.category,
      )
        ? existingCaseStudy.category
        : existingCaseStudy.category
          ? [existingCaseStudy.category]
          : [];
      const requiredCategory: string[] = caseStudyData.category || [];
      const categoryChanged =
        existingCategory.length !== requiredCategory.length ||
        requiredCategory.some((c) => !existingCategory.includes(c));

      if (categoryChanged) {
        updates.category = requiredCategory;
      }

      // Check tags
      const existingTagStrings =
        existingCaseStudy.tags?.map((t: any) => t.tag) || [];
      const requiredTags = caseStudyData.tags?.map((t: any) => t.tag) || [];
      const missingTags = requiredTags.filter(
        (tag: string) => !existingTagStrings.includes(tag),
      );

      if (missingTags.length > 0) {
        updates.tags = [
          ...(existingCaseStudy.tags || []),
          ...missingTags.map((tag: string) => ({ tag })),
        ];
      }

      // Apply updates if needed
      if (Object.keys(updates).length > 0) {
        try {
          await payload.update({
            collection: "case-studies",
            id: existingCaseStudy.id,
            data: updates,
            overrideAccess: true,
          });
          const updateMessages = [];
          if (updates.category)
            updateMessages.push(`category: ${caseStudyData.category}`);
          if (updates.tags)
            updateMessages.push(`tags: added ${missingTags.join(", ")}`);
          console.log(
            `Updated case study ${existingCaseStudy.title}: ${updateMessages.join(", ")}`,
          );
        } catch (error) {
          console.error(
            `Error updating case study ${caseStudyData.title}:`,
            error,
          );
        }
      }
      continue;
    }

    if (!placeholderImageId) {
      console.log(
        `Skipping case study creation for ${caseStudyData.title} - no placeholder image available`,
      );
      continue;
    }

    try {
      const created = await payload.create({
        collection: "case-studies",
        data: {
          ...caseStudyData,
          image: placeholderImageId,
        },
        draft: true,
        overrideAccess: true,
      });
      console.log(
        `Created case study: ${created.title} (${created.slug}) with category: ${created.category}`,
      );
    } catch (error) {
      console.error(`Error creating case study ${caseStudyData.title}:`, error);
    }
  }

  if (!placeholderImageId) {
    console.log(
      "\nWARNING: No media found in database. New blogs/case studies were not created.",
    );
    console.log(
      "To create missing records, upload at least one image to the media library first.",
    );
  }

  console.log("\nSeed data process completed!");
  console.log(
    "\nExisting records were updated with tags/categories as needed.",
  );
  console.log(
    'To check which blogs/case studies were updated, look for "Updated" messages above.',
  );
};

seedData().catch((error) => {
  console.error("Seed data failed:", error);
  process.exit(1);
});
