# Blogs & Case Studies Layout Documentation

This document describes the layout structure, spacing, margins, and padding for the blogs and case studies sections of the Valnee Light website.

## Table of Contents
1. [File Locations](#file-locations)
2. [Page Structure](#page-structure)
3. [Spacing System](#spacing-system)
4. [Blogs Page Layout](#blogs-page-layout)
5. [Case Studies Page Layout](#case-studies-page-layout)
6. [ReactMarkdown Components](#reactmarkdown-components)
7. [Hyperlinks Styling](#hyperlinks-styling)
8. [TOC (Table of Contents)](#toc-table-of-contents)

---

## File Locations

### Blogs
- **Listing Page**: `app/blogs/page.tsx`
- **Single Post**: `app/blogs/[slug]/page.tsx`
- **Components**: `components/blogs/` (TableOfContents.tsx, SummariseWithAI.tsx, BlogsClient.tsx)

### Case Studies
- **Listing Page**: `app/case-studies/page.tsx`
- **Single Post**: `app/case-studies/[slug]/page.tsx`
- **Components**: `components/case-studies/` (CaseStudyCover.tsx)

### Global Styles
- **CSS**: `app/globals.css` (contains blue hyperlink styling)

---

## Page Structure

Both blogs and case studies follow a three-column layout on desktop:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Hero Section                              │
│  (Dark background with cover image and title/metadata)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│  │          │  │                     │  │                │ │
│  │   TOC    │  │      Content        │  │   Sidebar      │ │
│  │ (240px) │  │   (flexible)        │  │  (280px)       │ │
│  │          │  │                     │  │                │ │
│  └──────────┘  └─────────────────────┘  └────────────────┘ │
│                                                                 │
│  On mobile: Single column, TOC hidden, content + sidebar stacked  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Spacing System

### Sectional Spacing
- **Value**: 150px total between sections
- **Implementation**: `py-[75px]` on section (75px top + 75px bottom)
- **Files**: Both `app/blogs/[slug]/page.tsx` and `app/case-studies/[slug]/page.tsx`

### Heading to Paragraph
- **Value**: 20px
- **Implementation**: Headings (h1/h2/h3) have `mb-[20px]`, paragraphs have `mt-0`
- **Result**: 20px + 0px = 20px gap

### Subparagraphs (Between Paragraphs)
- **Value**: 12px
- **Implementation**: Paragraphs, lists, and other content elements have `mb-3` (12px bottom), `mt-0` (0 top)
- **Result**: 12px + 0px = 12px gap

---

## Blogs Page Layout

### Single Blog Post (`app/blogs/[slug]/page.tsx`)

#### Section Structure
```tsx
<section className="border-t border-gray-150 bg-white py-[75px] text-[#1b1b1b]">
  <div className="fixed-page-margin grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] md:grid-cols-[1fr_280px] gap-6">
    <!-- Left: TOC -->
    <!-- Center: Content -->
    <!-- Right: Sidebar -->
  </div>
</section>
```

#### Spacing Breakdown
| Element | Class | Spacing Value | Purpose |
|---------|-------|---------------|---------|
| Section | `py-[75px]` | 75px top + 75px bottom | Sectional spacing (150px total between sections) |
| Grid | `gap-6` | 24px | Gap between grid columns/rows |
| Article | `gap-2` | 8px | Gap between article children |
| Sidebar | `gap-2` | 8px | Gap between sidebar items |
| TOC | `gap-4` | 16px | Gap between TOC items |
| TOC Container | `gap-2` | 8px | Gap inside TOC container |

#### Content Spacing (ReactMarkdown Components)
| Element | Top Margin | Bottom Margin | Total Gap |
|---------|-----------|---------------|-----------|
| h1 | `mt-0` | `mb-[20px]` | 20px to next element |
| h2 | `mt-0` | `mb-[20px]` | 20px to next element |
| h3 | `mt-0` | `mb-[20px]` | 20px to next element |
| p | `mt-0` | `mb-3` | 12px between paragraphs |
| ul | `mt-0` | `mb-3` | 12px between lists |
| ol | `mt-0` | `mb-3` | 12px between lists |
| li | - | - | Uses `leading-[1.6]` |
| blockquote | `mt-0` | `mb-3` | 12px after blockquote |
| table | `mt-0` | `mb-3` | 12px after table |
| img | `mt-0` | `mb-3` | 12px after image |
| hr | `mt-0` | `mb-3` | 12px after hr |

#### Sidebar Items
1. **SummariseWithAI** - Full width component
2. **CTA Card** - `rounded-[18px] border border-[#e8ddcf] bg-[#faf7f2] p-5`
3. **Suggested Articles** - Conditional, only shown when suggestions exist

---

## Case Studies Page Layout

### Single Case Study (`app/case-studies/[slug]/page.tsx`)

#### Section Structure
```tsx
<section className="bg-white py-[75px] text-[#1b1b1b] border-t border-gray-150">
  <div className="fixed-page-margin grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] md:grid-cols-[1fr_280px] gap-6">
    <!-- Left: TOC -->
    <!-- Center: Content -->
    <!-- Right: Sidebar -->
  </div>
</section>
```

#### Spacing Breakdown
| Element | Class | Spacing Value | Purpose |
|---------|-------|---------------|---------|
| Section | `py-[75px]` | 75px top + 75px bottom | Sectional spacing (150px total between sections) |
| Grid | `gap-6` | 24px | Gap between grid columns/rows |
| Article | `gap-6` | 24px | Gap between article children |
| TOC | `gap-4` | 16px | Gap between TOC items |

#### Content Spacing (ReactMarkdown Components)
| Element | Top Margin | Bottom Margin | Total Gap |
|---------|-----------|---------------|-----------|
| h1 | `mt-0` | `mb-[20px]` | 20px to next element |
| h2 | `mt-0` | `mb-[20px]` | 20px to next element (includes `border-b border-gray-100 pb-2`) |
| h3 | `mt-0` | `mb-[20px]` | 20px to next element |
| p | `mt-0` | `mb-3` | 12px between paragraphs |
| ul | `mt-0` | `mb-3` | 12px between lists |
| ol | `mt-0` | `mb-3` | 12px between lists |
| li | - | - | Uses `leading-relaxed` |
| blockquote | `mt-0` | `mb-3` | 12px after blockquote |
| table | `mt-0` | `mb-3` | 12px after table |
| img | `mt-0` | `mb-3` | 12px after image |
| video | `mt-0` | `mb-3` | 12px after video |

#### Sidebar Items
1. **Follow Us** - Social media links
2. **Consultation Booking** - CTA card with "Book a Free Call" button
3. **Related Projects** - Suggested case studies

---

## ReactMarkdown Components

Both blogs and case studies use `ReactMarkdown` with `remarkGfm` plugin for rendering markdown content. Custom components are defined for each HTML element to ensure consistent styling.

### Common Pattern
```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    h1: ({ children, ...props }) => <h1 className="..." {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 className="..." {...props}>{children}</h2>,
    p: (props) => <p className="..." {...props} />,
    // ... other elements
  }}
>
  {markdown}
</ReactMarkdown>
```

### Blogs: Additional Components
- **img**: Wrapped in a flex container with `my-0 mb-3` (actually `mt-0 mb-3`)
- **hr**: `mt-0 mb-3` with border styling

### Case Studies: Additional Components
- **h1 in markdown**: `mb-[20px]` (different from the page's main h1)
- **h2 in markdown**: Includes `border-b border-gray-100 pb-2` for underline
- **h3 in markdown**: `mb-[20px]`
- **img**: Handles both CMS images and videos
- **video**: `mt-0 mb-3` with max height constraints

---

## Hyperlinks Styling

### Inline Styles (ReactMarkdown)
Both blogs and case studies define link styling in their ReactMarkdown components:

```tsx
a: ({ node, ...props }) => {
  const href = props.href || "";
  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className="text-[#0066cc] font-semibold underline hover:text-[#0052a3]"
        {...props}
      />
    );
  }
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#0066cc] font-semibold underline hover:text-[#0052a3]"
      {...props}
    />
  );
}
```

### Global CSS (app/globals.css)
Ensures links are blue even in HTML content (not processed by ReactMarkdown):

```css
/* Blue hyperlinks for blogs and case studies */
.blog-article a,
.case-study-article a,
.markdown-body a,
.html-body a {
  color: #0066cc !important;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.blog-article a:hover,
.case-study-article a:hover,
.markdown-body a:hover,
.html-body a:hover {
  color: #0052a3 !important;
}
```

### Color Values
| State | Color | Hex Code |
|-------|-------|----------|
| Normal | Blue | `#0066cc` |
| Hover | Darker Blue | `#0052a3` |

---

## TOC (Table of Contents)

### Blogs
```tsx
<aside className="sticky top-24 hidden h-fit max-h-[calc(100vh-6rem)] flex-col gap-4 lg:flex overflow-y-auto">
  {toc.length > 0 && (
    <div className="flex flex-col gap-2">
      <h2 className="m-0 text-[0.95rem] font-bold text-black">On This Page</h2>
      <TableOfContents toc={toc} />
    </div>
  )}
</aside>
```

- **Position**: Sticky at 24px from top (accounting for navbar)
- **Height**: `h-fit max-h-[calc(100vh-6rem)]` (fits content, max viewport - 96px)
- **Scrollable**: `overflow-y-auto` when content exceeds max height
- **Visibility**: Hidden on mobile (`hidden lg:flex`)

### Case Studies
```tsx
<aside className="hidden lg:flex flex-col gap-4 sticky top-24 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
  <div>
    <h3 className="text-[0.95rem] font-bold text-black mb-4">On This Page</h3>
    <TableOfContents toc={toc} />
  </div>
</aside>
```

- Same styling as blogs but with `h3` instead of `h2` for the title

---

## Summary

| Spacing Type | Value | Implementation |
|--------------|-------|----------------|
| Sectional | 150px | `py-[75px]` on section |
| Heading to Paragraph | 20px | Headings: `mb-[20px]`, Paragraphs: `mt-0` |
| Subparagraphs | 12px | Content elements: `mb-3`, `mt-0` |
| Grid Gap | 24px | `gap-6` on grid |
| TOC Item Gap | 16px | `gap-4` on TOC container |

| Color | Element | Value |
|-------|---------|-------|
| Links | Normal | `#0066cc` (blue) |
| Links | Hover | `#0052a3` (darker blue) |
| Text | Body | `#2d2d2d` (dark gray) |
| Text | Section | `#1b1b1b` (slightly lighter) |
