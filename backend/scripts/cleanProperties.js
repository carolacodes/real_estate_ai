import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(
  __dirname,
  "../data/uae-housing_dataset.csv"
);

const cleanOutputPath = path.join(
  __dirname,
  "../data/uae-housing-clean.csv"
);

const selectedOutputPath = path.join(
  __dirname,
  "../data/uae-housing-selected.csv"
);

const properties = [];

let discardedRows = 0;
let discardedInvalidBathrooms = 0;
let discardedInvalidArea = 0;
let discardedDuplicates = 0;

const seenProperties = new Set();

const TARGET_DISTRIBUTION = {
  Apartment: 35,
  Villa: 10,
  Townhouse: 10,
  Penthouse: 5,
};

const parseNumber = (value) => {
  if (!value) return null;

  const cleanedValue = value
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "")
    .trim();

  const number = Number(cleanedValue);

  return Number.isNaN(number) ? null : number;
};

const parseBedrooms = (value) => {
  if (!value) return null;

  const cleanedValue = value.trim().toLowerCase();

  if (cleanedValue === "studio") {
    return 0;
  }

  return parseNumber(cleanedValue);
};

const parseBathrooms = (value) => {
  if (!value) return null;

  const cleanedValue = value.trim().toLowerCase();

  if (cleanedValue.includes("sqft")) {
    return null;
  }

  return parseNumber(cleanedValue);
};

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const createPropertyKey = (property) => {
  return JSON.stringify(property);
};

const selectProperties = (allProperties) => {
  const selected = [];

  for (const [propertyType, amount] of Object.entries(
    TARGET_DISTRIBUTION
  )) {
    const matchingProperties = allProperties.filter(
      (property) =>
        property.property_type === propertyType
    );

    const shuffled = shuffleArray(matchingProperties);

    selected.push(...shuffled.slice(0, amount));
  }

  return shuffleArray(selected);
};

const createCsvWriter = (outputPath) =>
  createObjectCsvWriter({
    path: outputPath,

    header: [
      { id: "price", title: "price" },
      { id: "bedrooms", title: "bedrooms" },
      { id: "bathrooms", title: "bathrooms" },
      { id: "area_sqft", title: "area_sqft" },
      { id: "country", title: "country" },
      { id: "city", title: "city" },
      { id: "address", title: "address" },
      { id: "property_type", title: "property_type" },
      { id: "purpose", title: "purpose" },
      { id: "furnishing", title: "furnishing" },
      {
        id: "completion_status",
        title: "completion_status",
      },
      { id: "handover", title: "handover" },
      { id: "project_name", title: "project_name" },
    ],
  });

fs.createReadStream(inputPath)
  .pipe(csv())

  .on("data", (row) => {
    const bathrooms = parseBathrooms(row.bathroom);
    const areaSqft = parseNumber(row["area(sqft)"]);

    if (bathrooms === null) {
      discardedRows++;
      discardedInvalidBathrooms++;
      return;
    }

    if (
      areaSqft === null ||
      areaSqft <= 0 ||
      areaSqft > 100000
    ) {
      discardedRows++;
      discardedInvalidArea++;
      return;
    }

    const property = {
      price: parseNumber(row.price),
      bedrooms: parseBedrooms(row.bedroom),
      bathrooms,
      area_sqft: areaSqft,

      country: row.country?.trim(),
      city: row.city?.trim(),
      address: row.address?.trim(),

      property_type: row.propert_type?.trim(),
      purpose: row.purpose?.trim(),
      furnishing: row.furnishing?.trim(),
      completion_status: row.completion_status?.trim(),
      handover: row.handover?.trim(),
      project_name: row.project_name?.trim(),
    };

    const propertyKey = createPropertyKey(property);

    if (seenProperties.has(propertyKey)) {
      discardedRows++;
      discardedDuplicates++;
      return;
    }

    seenProperties.add(propertyKey);
    properties.push(property);
  })

  .on("end", async () => {
    const selectedProperties = selectProperties(properties);

    const cleanCsvWriter =
      createCsvWriter(cleanOutputPath);

    const selectedCsvWriter =
      createCsvWriter(selectedOutputPath);

    await cleanCsvWriter.writeRecords(properties);

    await selectedCsvWriter.writeRecords(
      selectedProperties
    );

    console.log("CSV limpiado correctamente.");
    console.log(`Propiedades válidas: ${properties.length}`);
    console.log(`Filas descartadas: ${discardedRows}`);

    console.log(
      `- Bathroom inválido: ${discardedInvalidBathrooms}`
    );

    console.log(
      `- Área inválida: ${discardedInvalidArea}`
    );

    console.log(
      `- Duplicados: ${discardedDuplicates}`
    );

    console.log("");
    console.log(
      `Propiedades seleccionadas: ${selectedProperties.length}`
    );

    console.log("");

    for (const [type] of Object.entries(
      TARGET_DISTRIBUTION
    )) {
      const count = selectedProperties.filter(
        (property) => property.property_type === type
      ).length;

      console.log(`- ${type}: ${count}`);
    }

    console.log("");
    console.log(
      `CSV limpio: ${cleanOutputPath}`
    );

    console.log(
      `CSV final seleccionado: ${selectedOutputPath}`
    );
  })

  .on("error", (error) => {
    console.error("Error procesando el CSV:", error);
  });