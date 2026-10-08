import { z } from "zod";

// Reject empty strings, arrays and objects before coercing query parameters.
const numberParam = (schema) =>
  z.string().trim().min(1).pipe(z.coerce.number().pipe(schema));

const page = numberParam(
  z.number().int().min(1).max(Number.MAX_SAFE_INTEGER)
).default(1);

const limit = numberParam(
  z.number().int().min(1).max(50)
).default(12);

const sort = z
  .enum(["price_asc", "price_desc", "newest"])
  .default("newest");

const textParam = z.string().trim().min(1).max(200);

const propertyType = z.enum([
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "Residential Building",
  "Villa Compound",
]);

const furnishing = z.enum([
  "Furnished",
  "Unfurnished",
]);

const completionStatus = z.enum([
  "Ready",
  "Off-Plan",
]);

const paginationShape = {
  page,
  limit,
  sort,
};

const validRange = ({ page, limit }) =>
  Number.isSafeInteger(page * limit);

const rangeError = {
  message: "Pagination range is too large",
  path: ["page"],
};

export const listPropertiesSchema = z
  .object(paginationShape)
  .refine(validRange, rangeError);

export const featuredPropertiesSchema = z.object({
  limit,
});

export const propertySlugSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export const searchPropertiesSchema = z
  .object({
    ...paginationShape,

    minPrice: numberParam(
      z.number().min(0)
    ).optional(),

    maxPrice: numberParam(
      z.number().min(0)
    ).optional(),

    bedrooms: numberParam(
      z.number()
        .int()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
    ).optional(),

    minBedrooms: numberParam(
      z.number()
        .int()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
    ).optional(),

    maxBedrooms: numberParam(
      z.number()
        .int()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
    ).optional(),

    bathrooms: numberParam(
      z.number()
        .int()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
    ).optional(),

    propertyType:
      propertyType.optional(),

    furnishing:
      furnishing.optional(),

    completionStatus:
      completionStatus.optional(),

    location:
      textParam.optional(),
  })

  .refine(
    validRange,
    rangeError
  )

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
    ({
      minBedrooms,
      maxBedrooms,
    }) =>
      minBedrooms === undefined ||
      maxBedrooms === undefined ||
      minBedrooms <= maxBedrooms,
    {
      message:
        "minBedrooms must be less than or equal to maxBedrooms",
      path: ["minBedrooms"],
    }
  );