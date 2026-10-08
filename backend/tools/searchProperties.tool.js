import { tool } from "ai";
import { z } from "zod";

import { searchProperties } from "../services/property.service.js";

const propertyTypeSchema = z.enum([
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "Residential Building",
  "Villa Compound",
]);

const furnishingSchema = z.enum([
  "Furnished",
  "Unfurnished",
]);

const completionStatusSchema = z.enum([
  "Ready",
  "Off-Plan",
]);

const sortSchema = z.enum([
  "price_asc",
  "price_desc",
  "newest",
]);

const compactProperty = (property) => ({
  slug: property.slug,
  project_name: property.project_name,
  price: property.price,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  area_sqft: property.area_sqft,
  address: property.address,
  property_type: property.property_type,
  furnishing: property.furnishing,
  completion_status: property.completion_status,
});

export const searchPropertiesTool = tool({
  description: `
Search available properties in the Dubai real estate database.

Use this tool when the user asks to find, compare or recommend properties
based on price, location, bedrooms, bathrooms, property type, furnishing
or completion status.

Prices are in AED.
Studio apartments use bedrooms = 0.
`,

  inputSchema: z
    .object({
      minPrice: z
        .number()
        .min(0)
        .optional()
        .describe("Minimum property price in AED"),

      maxPrice: z
        .number()
        .min(0)
        .optional()
        .describe("Maximum property price in AED"),

      bedrooms: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe(
          "Exact number of bedrooms. Use only when the user requests exactly this number. Use 0 for Studio."
        ),

      minBedrooms: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe(
          "Minimum number of bedrooms. Use when the user says at least, minimum, 2 or more, etc."
        ),

      maxBedrooms: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe(
          "Maximum number of bedrooms. Use when the user says at most, maximum, up to 3 bedrooms, etc."
        ),

      bathrooms: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Exact number of bathrooms"),

      propertyType: propertyTypeSchema
        .optional()
        .describe("Type of property"),

      furnishing: furnishingSchema
        .optional()
        .describe("Whether the property is furnished"),

      completionStatus: completionStatusSchema
        .optional()
        .describe(
          "Ready means completed. Off-Plan means still under development."
        ),

      location: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .optional()
        .describe(
          "Dubai area or community, for example Dubai Marina or Business Bay"
        ),

      sort: sortSchema
        .optional()
        .default("price_asc")
        .describe("How results should be ordered"),

      limit: z
        .number()
        .int()
        .min(1)
        .max(8)
        .optional()
        .default(5)
        .describe(
          "Maximum number of properties to return. Usually 3 to 5 is enough."
        ),
    })
    .refine(
      ({ minPrice, maxPrice }) =>
        minPrice === undefined ||
        maxPrice === undefined ||
        minPrice <= maxPrice,
      {
        message:
          "minPrice must be less than or equal to maxPrice",
        path: ["minPrice"],
      }
    )
    .refine(
      ({ minBedrooms, maxBedrooms }) =>
        minBedrooms === undefined ||
        maxBedrooms === undefined ||
        minBedrooms <= maxBedrooms,
      {
        message:
          "minBedrooms must be less than or equal to maxBedrooms",
        path: ["minBedrooms"],
      }
    ),

  execute: async ({
    minPrice,
    maxPrice,
    bedrooms,
    minBedrooms,
    maxBedrooms,
    bathrooms,
    propertyType,
    furnishing,
    completionStatus,
    location,
    sort = "price_asc",
    limit = 5,
  }) => {
    console.time("search-properties-tool");

    try {
      const result = await searchProperties({
        minPrice,
        maxPrice,
        bedrooms,
        minBedrooms,
        maxBedrooms,
        bathrooms,
        propertyType,
        furnishing,
        completionStatus,
        location,
        page: 1,
        limit,
        sort,
      });

      return {
        totalMatches: result.pagination.total,
        returned: result.data.length,
        properties: result.data.map(compactProperty),
      };
    } finally {
      console.timeEnd("search-properties-tool");
    }
  },
});