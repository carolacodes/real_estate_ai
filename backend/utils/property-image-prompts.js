export const IMAGE_TYPES = ['exterior', 'living', 'bedroom', 'kitchen_or_bath'];
export const PILOT_REFERENCES = {
  exterior: 'data/property-image-references/exterior.png',
  living: 'data/property-image-references/living.png',
  bedroom: 'data/property-image-references/bedroom.png',
  kitchen_or_bath: 'data/property-image-references/kitchen.png',
};

export const VISUAL_STYLE = 'Professional architectural photography aesthetic, photorealistic premium Dubai real estate. Warm ivory, sand and cream tones, pale stone textures, warm oak tones and restrained bronze accents. Soft natural daylight, gentle warm illumination, balanced exposure, realistic textures, straight verticals and believable proportions. Landscape 4:3 composition. No people, text, logos, watermarks, cartoon styling, excessive HDR or artificial gloss.';

const architectures = {
  Apartment: 'A contemporary residential apartment building; do not imply that the entire building is the listed unit.',
  Villa: 'A contemporary detached residential villa with a human-scale facade.',
  Townhouse: 'A contemporary attached townhouse in a residential streetscape.',
  Penthouse: 'A contemporary residential building containing an upper-floor penthouse; do not invent a rooftop terrace or private pool.',
  'Residential Building': 'A contemporary multi-unit residential building; do not invent its unit count or number of floors.',
  'Villa Compound': 'A contemporary residential villa compound; do not invent its villa count or shared facilities.',
};

export function validateProperty(property) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(property?.slug ?? '')) throw new Error('Invalid property slug.');
  if (typeof property.featured !== 'boolean') throw new Error(`Invalid featured value for ${property.slug}.`);
}

function sceneFor(type, context) {
  const studio = context.bedrooms === 0;
  const unfurnished = context.furnishing === 'Unfurnished';
  switch (type) {
    case 'exterior': return architectures[context.property_type] ?? 'A contemporary residential exterior appropriate to the recorded property type.';
    case 'living': return studio
      ? 'A compact open-plan studio living area, with a sleeping zone in the same room; do not depict a separate bedroom.'
      : 'A residential living area, with scale appropriate to the recorded total area; do not invent a floor plan.';
    case 'bedroom': return studio
      ? 'The sleeping zone of the same open-plan studio seen in the living image, not a separate bedroom.'
      : `A main bedroom${unfurnished ? ' shown empty' : ''}, with proportions appropriate to the recorded total area.`;
    case 'kitchen_or_bath': return studio
      ? 'A compact kitchenette appropriate to the same studio; no oversized island or separate grand kitchen.'
      : 'A residential kitchen appropriate to the property scale; restrained cabinetry, no extravagant oversized island or invented appliances.';
    default: throw new Error('Unknown image type.');
  }
}

export function buildPropertyImagePrompts(entry) {
  const context = entry.promptContext;
  const facts = JSON.stringify({ project_name: entry.project_name, ...context });
  const furnishing = context.furnishing === 'Unfurnished'
    ? 'Unfurnished: interiors must have no loose furniture, beds, sofas or decorative staging. Fixed architectural elements may be conceptual; do not claim that they are included.'
    : context.furnishing === 'Furnished'
      ? 'Furnished: use restrained, realistically scaled furnishings as illustrative staging, not a claim about the exact included furniture.'
      : 'Furnishing is unverified: use a neutral architectural interior without asserting included furniture.';
  const status = context.completion_status === 'Off-Plan'
    ? 'Off-Plan: depict a proposed architectural concept in a photorealistic style, not documentary evidence of an existing completed property.'
    : 'Depict a completed-looking architectural concept; the actual building design and interior finishes are unverified.';
  return entry.imageTypes.map((type, index) => ({
    filename: `0${index + 1}.webp`,
    imageType: type,
    outputPath: `data/property-images/${entry.slug}/0${index + 1}.webp`,
    referencePaths: [PILOT_REFERENCES[type], ...Object.values(PILOT_REFERENCES).filter(path => path !== PILOT_REFERENCES[type])],
    prompt: [
      'Create an illustrative property image for human review. This is a visual concept based on limited catalogue data, not an authentic photograph of the named development.',
      `Known catalogue facts (null means unknown): ${facts}`,
      `Scene: ${sceneFor(type, context)}`,
      furnishing,
      status,
      VISUAL_STYLE,
      `Coherence group: ${entry.slug}. Keep the same palette, architectural vocabulary, lighting direction and scale across all images. For later images, use the approved earlier images from this group as continuity references. Do not invent continuity from style references belonging to another property.`,
      'Use the four pilot images only for aesthetic inspiration: colour, light, texture and photographic composition. Do not copy their facade, floor plan, skyline, furnishings or exact architecture.',
      'The property name and address identify the catalogue entry, not a verified design or view. No identifiable landmarks, Burj Khalifa, sea views, balcony, pool, gym, landscaped amenities, developer branding or additional facilities unless explicitly documented. Use a neutral context and avoid specific visible views through interior windows.',
      'Do not infer amenities, finishes, included appliances or room dimensions from price, location or references. Materials are conceptual visual choices, not verified specifications. Respect the recorded bedroom count and total area; never interpret area_sqft as the size of a single room. Do not print catalogue facts on the image.',
    ].join('\n\n'),
  }));
}

export function buildPropertyImagePlan(properties) {
  const seen = new Set();
  const entries = properties.map(property => {
    validateProperty(property);
    if (seen.has(property.slug)) throw new Error(`Duplicate slug: ${property.slug}.`);
    seen.add(property.slug);
    const promptContext = Object.fromEntries([
      'property_type', 'bedrooms', 'bathrooms', 'area_sqft', 'address', 'city', 'country', 'furnishing', 'completion_status',
    ].map(field => [field, property[field] ?? null]));
    return {
      slug: property.slug,
      project_name: property.project_name ?? null,
      featured: property.featured,
      imageCount: property.featured ? 4 : 1,
      imageTypes: property.featured ? [...IMAGE_TYPES] : ['exterior'],
      promptContext,
    };
  }).sort((a, b) => a.slug.localeCompare(b.slug));
  const featured = entries.filter(entry => entry.featured).length;
  return {
    schemaVersion: 1,
    status: 'planning-only; conceptual imagery requires human approval before generation and publication',
    visualStyle: VISUAL_STYLE,
    references: PILOT_REFERENCES,
    summary: { totalProperties: entries.length, featured, standard: entries.length - featured, totalImages: entries.reduce((sum, entry) => sum + entry.imageCount, 0) },
    properties: entries,
  };
}
