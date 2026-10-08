import { supabase } from "../libs/supabase.js";
import { HttpError } from "../utils/http-error.js";

const SORTS = {
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
  newest: { column: "created_at", ascending: false },
};

function availableProperties(count = false) {
  return supabase
    .from("properties")
    .select("*", count ? { count: "exact" } : {})
    .eq("available", true);
}

function checkError(error) {
  if (error) {
    throw new Error("Property query failed", {
      cause: error,
    });
  }
}

async function paginate(
  query,
  {
    page = 1,
    limit = 12,
    sort = "newest",
  } = {}
) {
  const ordering = Object.hasOwn(SORTS, sort)
    ? SORTS[sort]
    : undefined;

  if (!ordering) {
    throw new HttpError(
      400,
      "Invalid sort parameter"
    );
  }

  query = query.order(ordering.column, {
    ascending: ordering.ascending,
  });

  if (ordering.column !== "id") {
    query = query.order("id", {
      ascending: false,
    });
  }

  const offset = (page - 1) * limit;

  let { data, count, error } =
    await query.range(
      offset,
      offset + limit - 1
    );

  if (error?.code === "PGRST103") {
    // PostgREST can reject offsets past the final row.
    // Re-read the same filters at offset zero
    // to obtain the exact total.
    const first = await query.range(0, 0);

    checkError(first.error);

    data = [];
    count = first.count;
  } else {
    checkError(error);
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(
        count / limit
      ),
    },
  };
}

export function getAllProperties(options) {
  return paginate(
    availableProperties(true),
    options
  );
}

export async function getFeaturedProperties({
  limit = 12,
} = {}) {
  const { data, error } =
    await availableProperties()
      .eq("featured", true)
      .order("created_at", {
        ascending: false,
      })
      .order("id", {
        ascending: false,
      })
      .limit(limit);

  checkError(error);

  return data;
}

export async function getPropertyBySlug(
  slug
) {
  const { data, error } =
    await availableProperties()
      .eq("slug", slug)
      .maybeSingle();

  checkError(error);

  if (!data) {
    throw new HttpError(
      404,
      "Property not found"
    );
  }

  return data;
}


export async function searchProperties(filters = {}) {
  console.time("search-properties-db");

  try {
    let query = availableProperties(true);

    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters.bedrooms !== undefined) {
      query = query.eq("bedrooms", filters.bedrooms);
    }

    if (filters.minBedrooms !== undefined) {
      query = query.gte("bedrooms", filters.minBedrooms);
    }

    if (filters.maxBedrooms !== undefined) {
      query = query.lte("bedrooms", filters.maxBedrooms);
    }

    if (filters.bathrooms !== undefined) {
      query = query.eq("bathrooms", filters.bathrooms);
    }

    if (filters.propertyType !== undefined) {
      query = query.eq(
        "property_type",
        filters.propertyType
      );
    }

    if (filters.furnishing !== undefined) {
      query = query.eq(
        "furnishing",
        filters.furnishing
      );
    }

    if (filters.completionStatus !== undefined) {
      query = query.eq(
        "completion_status",
        filters.completionStatus
      );
    }

    if (filters.location !== undefined) {
      const location =
        filters.location.replace(
          /[\\%_]/g,
          "\\$&"
        );

      query = query.ilike(
        "address",
        `%${location}%`
      );
    }

    return await paginate(
      query,
      filters
    );
  } finally {
    console.timeEnd(
      "search-properties-db"
    );
  }
}