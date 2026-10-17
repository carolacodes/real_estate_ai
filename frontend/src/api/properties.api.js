import api from "./axios.js";

export async function getProperties(params = {}) {
  const response = await api.get(
    "/properties",
    {
      params,
    }
  );

  return response.data;
}

export async function getFeaturedProperties(
  limit = 6
) {
  const response = await api.get(
    "/properties/featured",
    {
      params: {
        limit,
      },
    }
  );

  return response.data;
}

export async function searchProperties(
  filters = {}
) {
  const response = await api.get(
    "/properties/search",
    {
      params: filters,
    }
  );

  return response.data;
}

export async function getPropertyBySlug(
  slug
) {
  if (!slug) {
    throw new Error(
      "Property slug is required"
    );
  }

  const response = await api.get(
    `/properties/${encodeURIComponent(
      slug
    )}`
  );

  return response.data;
}