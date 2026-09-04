import type { CollectionConfig } from "payload";

export const GSCConnection: CollectionConfig = {
  slug: "gsc-connections",
  access: {
    create: () => false,
    read: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "googleAccountEmail",
      type: "email",
      required: true,
    },
    {
      name: "propertyUrl",
      type: "text",
      required: true,
    },
    {
      name: "refreshToken",
      type: "text",
      required: true,
      admin: { hidden: true },
      access: { read: () => false },
    },
    {
      name: "accessToken",
      type: "text",
      admin: { hidden: true },
      access: { read: () => false },
    },
    {
      name: "tokenExpiry",
      type: "number",
    },
  ],
};
