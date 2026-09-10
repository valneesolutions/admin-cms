import type { CollectionConfig } from "payload";

import { normalizeMarkdownContent } from "../lib/normalize-markdown.ts";

export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status"],
    components: {
      edit: {
        beforeDocumentControls: [
          "@/components/CaseStudyPreviewTabs#CaseStudyPreviewTabs",
        ],
      },
    },
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        // Repair image syntax pasted from external tools (escaped links,
        // signed Supabase URLs) so published markdown always renders.
        if (typeof data.content === "string") {
          data.content = normalizeMarkdownContent(data.content);
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "URL identifier (e.g., signalmint-casestudy)",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Thumbnail Image",
      admin: {
        description: "Shown on the case studies listing / cards.",
      },
    },
    {
      name: "cover_image",
      type: "upload",
      relationTo: "media",
      label: "Cover Image",
      admin: {
        description:
          "Banner image shown inside the case study page. Leave empty to reuse the thumbnail image.",
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            if (value) return value;
            const fallback = (siblingData as { image?: unknown })?.image;
            if (!fallback) return value;
            return typeof fallback === "object"
              ? (fallback as { id?: unknown }).id
              : fallback;
          },
        ],
      },
    },
    {
      name: "category",
      type: "select",
      hasMany: true,
      options: [
        { label: "Popular", value: "popular" },
        { label: "Latest", value: "latest" },
        { label: "Featured", value: "featured" },
        { label: "Trending", value: "trending" },
        { label: "High Rated", value: "high-rated" },
      ],
      admin: {
        width: "50%",
        description: "Pick one or more predefined categories.",
      },
    },
    {
      name: "reading_time",
      type: "text",
      defaultValue: "5 min",
      admin: { width: "50%" },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "left_description",
      type: "textarea",
    },
    {
      name: "content",
      type: "textarea",
      required: true,
      label: "Content (Markdown)",
      admin: {
        rows: 20,
        description: "Write your case study here using Markdown.",
        components: {
          Field: "@/components/MarkdownEditorField#MarkdownEditorField",
        },
      },
    },
    {
      name: "livePreview",
      type: "ui",
      admin: {
        components: {
          Field:
            "@/components/CaseStudyLiveMarkdownPreview#CaseStudyLiveMarkdownPreview",
        },
      },
    },
    {
      name: "page_url",
      type: "text",
      label: "Landing Page URL (Live Link)",
    },
    {
      name: "tags",
      type: "array",
      label: "Tags",
      labels: { singular: "Tag", plural: "Tags" },
      fields: [
        {
          name: "tag",
          type: "text",
          label: "Tag",
        },
      ],
      admin: {
        description: "Add any free-form tags you want.",
      },
    },
    {
      name: "author_name",
      type: "text",
      defaultValue: "Valnee Team",
      admin: { position: "sidebar" },
    },
    {
      name: "author_image",
      type: "text",
      defaultValue: "/valneeLogo.svg",
      admin: { position: "sidebar" },
    },
    {
      name: "is_active",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar" },
      defaultValue: () => new Date().toISOString(),
    },
  ],
};
