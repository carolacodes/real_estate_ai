import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(
  __dirname,
  "../data/uae-housing-selected.csv"
);

const outputPath = path.join(
  __dirname,
  "../data/properties-supabase.csv"
);

const properties = [];

const FEATURED_COUNT = 6;

const createSlug = (text) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

fs.createReadStream(inputPath)
  .pipe(csv())

  .on("data", (row) => {
    properties.push(row);
  })

  .on("end", async () => {
    const preparedProperties = properties.map(
      (property, index) => {
        const baseSlug = createSlug(
          `${property.project_name}-${property.property_type}`
        );

        return {
          slug: `${baseSlug}-${index + 1}`,

          price: Number(property.price),
          bedrooms: Number(property.bedrooms),
          bathrooms: Number(property.bathrooms),
          area_sqft: Number(property.area_sqft),

          country: property.country?.trim(),
          city: property.city?.trim(),
          address: property.address?.trim(),

          property_type:
            property.property_type?.trim(),

          purpose: property.purpose?.trim(),

          furnishing:
            property.furnishing?.trim(),

          completion_status:
            property.completion_status?.trim(),

          handover: property.handover?.trim(),

          project_name:
            property.project_name?.trim(),

          image_url: "",

          available: true,

          featured: index < FEATURED_COUNT,
        };
      }
    );

    const csvWriter = createObjectCsvWriter({
      path: outputPath,

      header: [
        { id: "slug", title: "slug" },

        { id: "price", title: "price" },
        { id: "bedrooms", title: "bedrooms" },
        { id: "bathrooms", title: "bathrooms" },
        { id: "area_sqft", title: "area_sqft" },

        { id: "country", title: "country" },
        { id: "city", title: "city" },
        { id: "address", title: "address" },

        {
          id: "property_type",
          title: "property_type",
        },

        { id: "purpose", title: "purpose" },

        {
          id: "furnishing",
          title: "furnishing",
        },

        {
          id: "completion_status",
          title: "completion_status",
        },

        { id: "handover", title: "handover" },

        {
          id: "project_name",
          title: "project_name",
        },

        {
          id: "image_url",
          title: "image_url",
        },

        {
          id: "available",
          title: "available",
        },

        {
          id: "featured",
          title: "featured",
        },
      ],
    });

    await csvWriter.writeRecords(
      preparedProperties
    );

    console.log(
      "CSV preparado para Supabase correctamente."
    );

    console.log(
      `Propiedades procesadas: ${preparedProperties.length}`
    );

    console.log(
      `Propiedades destacadas: ${FEATURED_COUNT}`
    );

    console.log(
      `Archivo generado: ${outputPath}`
    );
  })

  .on("error", (error) => {
    console.error(
      "Error preparando el CSV:",
      error
    );
  });