import { listPropertiesSchema, featuredPropertiesSchema, propertySlugSchema,
  searchPropertiesSchema } from "../schemas/property.schema.js";
import * as properties from "../services/property.service.js";

export async function getAllProperties(req, res) {
  const options = listPropertiesSchema.parse(req.query);
  const result = await properties.getAllProperties(options);
  res.json({ success: true, ...result });
}

export async function getFeaturedProperties(req, res) {
  const options = featuredPropertiesSchema.parse(req.query);
  const data = await properties.getFeaturedProperties(options);
  res.json({ success: true, data });
}

export async function getPropertyBySlug(req, res) {
  const { slug } = propertySlugSchema.parse(req.params);
  const data = await properties.getPropertyBySlug(slug);
  res.json({ success: true, data });
}

export async function searchProperties(req, res) {
  const filters = searchPropertiesSchema.parse(req.query);
  const result = await properties.searchProperties(filters);
  res.json({ success: true, ...result });
}
