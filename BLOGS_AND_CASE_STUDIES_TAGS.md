# Blogs and Case Studies: Tags and Filters Documentation

This document outlines the tagging and filtering system for both **Blogs** and **Case Studies** in the Valnee Solutions website.

---

## 📝 Blogs System

### Filter Categories (Tabs)
The blogs page has the following filter categories displayed as tabs:
- **All** - Shows all blog posts
- **Featured** - Shows featured blog posts
- **Latest** - Shows latest blog posts
- **Trending** - Shows trending blog posts
- **High rated** - Shows high-rated blog posts

### CMS Tags that Drive Filters

Blog posts are tagged in the CMS (Payload CMS) with the following tags that map to filter flags:

| CMS Tag | Boolean Flag | Filter Tab | Purpose |
|---------|--------------|------------|---------|
| `featured` | `isFeatured` | Featured | Main hero blog on the page |
| `latest` | `isLatest` | Latest | Recent blog posts |
| `trending` | `isTrending` | Trending | Currently popular/trending posts |
| `high rated` or `high-rated` | `isHighRated` | High rated | Highly rated content |
| `popular` | `isPopular` | (Sidebar) | Used for view-count-based popular posts |

### Popular Blogs Sidebar

The **Popular Blogs** sidebar (right side of the hero section on the blogs page) displays:
- Top 4 blogs sorted by view count (`blog.views`)
- Excludes the featured blog to avoid duplication
- These blogs are determined algorithmically, NOT by the `popular` tag
- Blogs with the `popular` CMS tag will have `isPopular: true` but this doesn't affect the sidebar

### Tag Display on Cards

Tags that appear on blog cards are filtered to exclude the filter-driving tags. The following tags are **hidden** from display:
- `featured`
- `latest`
- `trending`
- `high rated`
- `high-rated`
- `popular`

Any other tags will appear as "highlight" badges on the blog cards.

### Fallback Logic

If no blogs have the specific filter tags, the system applies fallbacks in `prepareBlogList()`:

1. **Featured**: If no blog has `isFeatured: true`, the first blog in the list is marked as featured
2. **Latest**: If no blog has `isLatest: true`, blogs 1-4 (excluding the featured one) are marked as latest

### Current Implementation Files

- **Type Definition**: `lib/blogs.ts` - `BlogPost` type
- **Tag Mapping**: `lib/blogs.ts` - `mapCmsPostToBlogPost()` function
- **Fallback Logic**: `lib/blogs.ts` - `prepareBlogList()` function
- **Filtering & Display**: `components/blogs/BlogsClient.tsx`

---

## 💼 Case Studies System

### Filter Categories (Tabs)
The work/case studies page has dynamic filter categories:

**Primary Categories (Fixed Order):**
1. **All** - Shows all case studies
2. **Web App** - Web application projects
3. **App** - Mobile/desktop applications
4. **Landing Pages** - Landing page projects
5. **MVPs** - Minimum Viable Products

**Additional Categories:**
- Any other categories found in case studies are added alphabetically after the primary categories

### Category Sources

Case study categories come from multiple sources:

#### 1. PROJECT_META (Static Configuration)
Defined in `components/work/WorkClient.tsx`:

```typescript
const PROJECT_META: Record<string, ProjectMeta> = {
  "saga-ai": {
    title: "Saga AI",
    subtitle: "AI Optimization & Search Visibility",
    categories: ["Web App"],
    image: "/saga.png",
    liveUrl: "",
  },
  "thyne": {
    title: "Thyne",
    subtitle: "Real-time IoT medical dashboards",
    categories: ["App", "Web App"],
    image: "/thyne_container.webp",
    liveUrl: "",
  },
  "zoci": {
    title: "Zoci",
    subtitle: "Premium Shopify jewelry storefront",
    categories: ["Landing Pages"],
    image: "/zoci_container.webp",
    liveUrl: "",
  },
};
```

#### 2. PROJECT_TAXONOMY (CMS Override)
Also in `components/work/WorkClient.tsx`, for case studies from CMS:

```typescript
const PROJECT_TAXONOMY: Record<string, { categories: string[]; liveUrl?: string }> = {
  "thyne-ai-case-study": {
    categories: ["App", "Web App"],
    liveUrl: "https://play.google.com/store/apps/details?id=chawla_solution.com.thyne_jewls",
  },
  "project-pluto": { categories: ["App", "MVPs"] },
  "layers-landingpage-casestudy": { categories: ["Landing Pages"] },
  "optirank-platform-casestudy": { categories: ["Web App"] },
  "ghostwriter-ai-case-study": { categories: ["Web App", "MVPs"] },
};
```

#### 3. CMS Category Field
If not overridden by PROJECT_META or PROJECT_TAXONOMY, the case study's `category` field from the CMS is used.

### Category Resolution Priority

When determining a case study's categories, the system uses this priority order:

1. **PROJECT_TAXONOMY** (if a matching slug exists)
2. **PROJECT_META** (if a matching slug exists)
3. **CMS category field** (if it exists and is not "Case Study")
4. Empty array (if no category is found)

Note: "Case Study" is a placeholder category in the CMS and is dropped (not shown) on the frontend.

### Current Case Studies (Static Data)

From `lib/casestudies.ts`:

1. **saga-ai**
   - Category: AI Optimization
   - CMS Categories: (not in PROJECT_TAXONOMY, uses PROJECT_META)
   - PROJECT_META: ["Web App"]

2. **thyne**
   - Category: Infrastructure
   - PROJECT_META: ["App", "Web App"]
   - PROJECT_TAXONOMY: ["App", "Web App"]

3. **zoci**
   - Category: eCommerce
   - PROJECT_META: ["Landing Pages"]

### Featured Work

The featured work (hero section) currently displays `projects[4]` (the 5th project in the list).

### Current Implementation Files

- **Type Definition**: `lib/casestudies.ts` - `CaseStudy` type
- **Static Data**: `lib/casestudies.ts` - `rawCaseStudies` array
- **Category Resolution**: `components/work/WorkClient.tsx` - `useMemo` for projects mapping
- **Filter Logic**: `components/work/WorkClient.tsx` - `filteredProjects` computation

---

## 📊 Summary Tables

### Blogs Tags Matrix

| Blog Title | Likely Tags | isFeatured | isLatest | isTrending | isHighRated | isPopular |
|------------|-------------|------------|----------|------------|-------------|-----------|
| Why Custom Software Development Is Cheaper Than You Think in the Long Run | featured | true | false | false | false | false |
| How to Validate a Startup Idea Before Spending Money on Development | popular, latest | false | true | false | false | (by views) |
| Why Startups Need a Technical Partner, Not Just Developers | popular, latest | false | true | false | false | (by views) |
| What "Founder-Friendly Tech" Actually Means | popular, latest | false | true | false | false | (by views) |
| Why Non-Technical Founders Often Build Better MVPs | popular, latest | false | true | false | false | (by views) |

**Note**: The 4 blogs in the Popular sidebar are determined by view count, not by the `popular` tag. However, they may also have the `popular` tag in CMS, which will now be properly handled.

### Case Studies Categories Matrix

| Case Study | CMS Category | PROJECT_META Categories | PROJECT_TAXONOMY Categories | Final Display Categories |
|------------|---------------|--------------------------|----------------------------|--------------------------|
| saga-ai | AI Optimization | ["Web App"] | - | ["Web App"] |
| thyne | Infrastructure | ["App", "Web App"] | ["App", "Web App"] | ["App", "Web App"] |
| zoci | eCommerce | ["Landing Pages"] | - | ["Landing Pages"] |
| thyne-ai-case-study | - | - | ["App", "Web App"] | ["App", "Web App"] |
| project-pluto | - | - | ["App", "MVPs"] | ["App", "MVPs"] |
| layers-landingpage-casestudy | - | - | ["Landing Pages"] | ["Landing Pages"] |
| optirank-platform-casestudy | - | - | ["Web App"] | ["Web App"] |
| ghostwriter-ai-case-study | - | - | ["Web App", "MVPs"] | ["Web App", "MVPs"] |

---

## 🔧 Technical Notes

### Adding New Blog Filter Tags

To add a new filter tag (e.g., "Most Viewed"):

1. Add the boolean flag to `BlogPost` type in `lib/blogs.ts`:
   ```typescript
   isMostViewed?: boolean;
   ```

2. Add the tag mapping in `mapCmsPostToBlogPost()`:
   ```typescript
   isMostViewed: tagNames.includes("most viewed") || tagNames.includes("most-viewed"),
   ```

3. Add to FILTER_TAGS in `components/blogs/BlogsClient.tsx`:
   ```typescript
   const FILTER_TAGS = new Set([
     "featured",
     "latest",
     "trending",
     "high rated",
     "high-rated",
     "popular",
     "most viewed",
     "most-viewed",
   ]);
   ```

4. Add the category to the tabs array:
   ```typescript
   const categories = ["All", "Featured", "Latest", "Trending", "High rated", "Most Viewed"];
   ```

5. Add the filter logic in `sortedAndFilteredBlogs`:
   ```typescript
   } else if (selectedCategory === "Most Viewed") {
     result = result.filter(
       (blog) => blog.isMostViewed || blog.category === "Most Viewed",
     );
   }
   ```

### Adding New Case Study Categories

To add a new case study category (e.g., "Saas"):

1. Add to CATEGORY_ORDER in `components/work/WorkClient.tsx`:
   ```typescript
   const CATEGORY_ORDER = ["Web App", "App", "Landing Pages", "MVPs", "Saas"];
   ```

2. Update PROJECT_META or PROJECT_TAXONOMY for specific case studies to include the new category:
   ```typescript
   "some-slug": {
     categories: ["Saas", "Web App"],
     // ...
   }
   ```

---

## 🎯 Key Differences

| Aspect | Blogs | Case Studies |
|--------|-------|--------------|
| **Filter Mechanism** | Tag-based (featured, latest, trending, high rated, popular) | Category-based (Web App, App, Landing Pages, MVPs) |
| **Data Source** | Dynamic from CMS API | Mixed: Static data + CMS API |
| **Tag Display** | Non-filter tags show as highlights | Categories always show on cards |
| **Popular/Sidebar** | View-count based | N/A |
| **Featured Hero** | First blog or tagged featured | projects[4] (5th item) |
| **Fallback** | Auto-assigns featured/latest | Uses static category or CMS field |

---

*Documentation generated on: 2026-08-31*
*Last updated: After implementing isPopular flag for blogs*
