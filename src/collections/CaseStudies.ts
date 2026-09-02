import type { CollectionConfig } from "payload";

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
      type: "text",
      defaultValue: "Case Study",
      admin: { width: "50%" },
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
      fields: [
        {
          name: "tag",
          type: "text",
        },
      ],
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
