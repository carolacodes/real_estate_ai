import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { translations } from '../src/i18n/translations.js';
import { translate, readLanguage, applyLanguage, propertyLabel, languageStorageKey } from '../src/i18n/core.js';
import { propertyMetadata, pageMetadata } from '../src/utils/metadata.js';
import { formatBedrooms, formatBathrooms, formatPrice } from '../src/utils/property.js';
import { createChatAssistantStore } from '../src/hooks/chatAssistantStore.js';

function storage() {
  const items = new Map();
  return { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
}
test('English is default without browser detection, even for unknown/blocked storage', () => {
  assert.equal(readLanguage(storage()), 'en');
  assert.equal(readLanguage(), 'en');
  const invalid = storage(); invalid.setItem(languageStorageKey, 'fr');
  assert.equal(readLanguage(invalid), 'en');
  assert.equal(readLanguage({ getItem() { throw new Error('storage blocked'); } }), 'en');
});
test('Spanish selection persists with aura-language and updates document lang', () => {
  const localStorage = storage();
  const document = { documentElement: { lang: 'en' } };
  applyLanguage('es', localStorage, document);
  assert.equal(readLanguage(localStorage), 'es');
  assert.equal(localStorage.getItem('aura-language'), 'es');
  assert.equal(document.documentElement.lang, 'es');
  applyLanguage('en', localStorage, document);
  assert.equal(document.documentElement.lang, 'en');
});
test('storage failure does not prevent document language update', () => {
  const document = { documentElement: {} };
  applyLanguage('es', { setItem() { throw new Error('blocked'); } }, document);
  assert.equal(document.documentElement.lang, 'es');
});
test('t uses English fallback and interpolates values without interpreting data as HTML', () => {
  translations.en['test.english-only'] = 'English fallback {value}';
  try {
    assert.equal(translate('es', 'test.english-only', { value: 'works' }), 'English fallback works');
    assert.equal(translate('es', 'Unknown English phrase'), 'Unknown English phrase');
    assert.equal(translate('es', 'Explore {value0}', { value0: '<Home>' }), 'Explorar <Home>');
  } finally { delete translations.en['test.english-only']; }
});
test('Spanish catalog covers every English UI source phrase', () => {
  for (const key of Object.keys(translations.en)) assert.equal(typeof translations.es[key], 'string', key);
});
test('property enums translate only for presentation; unknown values and proper names survive', () => {
  for (const [value, expected] of [['Apartment', 'Apartamento'], ['Townhouse', 'Casa adosada'], ['Penthouse', 'Ático'], ['Residential Building', 'Edificio residencial'], ['Villa Compound', 'Complejo de villas'], ['Furnished', 'Amueblado'], ['Unfurnished', 'Sin amueblar'], ['Ready', 'Listo'], ['Off-Plan', 'Sobre plano'], ['Sale', 'Venta']]) assert.equal(propertyLabel(value, 'es'), expected);
  assert.equal(propertyLabel('Dubai Marina', 'es'), 'Dubai Marina');
  assert.equal(formatBedrooms(0, 'es'), 'Estudio');
  assert.equal(formatBedrooms(2, 'es'), '2 habitaciones');
  assert.equal(formatBedrooms(1, 'es'), '1 habitación');
  assert.equal(formatBathrooms(2, 'es'), '2 baños');
  assert.ok(formatPrice(2000000, 'es').includes('AED'));
});
test('metadata switches language without translating real project names/addresses', () => {
  assert.equal(translate('es', pageMetadata.home.title), 'AURA Prime Real Estate | Búsqueda de propiedades con IA en Dubái');
  const property = { project_name: 'Home', property_type: 'Apartment', address: 'Dubai Marina', bedrooms: 0, price: 1500000 };
  const localized = propertyMetadata(property, { language: 'es' });
  assert.equal(localized.title, 'Home | AURA Prime Real Estate');
  assert.ok(localized.description.includes('Apartamento'));
  assert.ok(localized.description.includes('Dubai Marina'));
  assert.ok(localized.description.includes('Estudio'));
  assert.equal(property.property_type, 'Apartment');
});
let vite;
let Provider;
const components = {};
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ default: Provider } = await vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'));
  for (const [name, path] of Object.entries({ Navbar: 'components/layout/Navbar', Filters: 'components/property/PropertyFilters', Chat: 'components/chat/ChatPanel', Card: 'components/chat/ChatPropertyCard', Contact: 'pages/Contact', About: 'pages/About', NotFound: 'pages/NotFound' })) {
    components[name] = (await vite.ssrLoadModule(`/src/${path}.jsx`)).default;
  }
});
after(async () => { await vite?.close(); });
function render(name, props = {}, language) {
  return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Provider, { initialLanguage: language }, createElement(components[name], props))));
}
test('provider defaults to English and Navbar can render Spanish with accessible selector', () => {
  assert.match(render('Navbar'), />Home</);
  const html = render('Navbar', {}, 'es');
  for (const word of ['Inicio', 'Propiedades', 'Nosotros', 'Contacto', 'Elegir idioma']) assert.ok(html.includes(word));
  assert.match(html, /aria-haspopup="menu" aria-expanded="false"/);
  assert.match(html, />ES<\/span>/);
});
test('Navbar removes the AI CTA and presents a compact language button in both languages', () => {
  for (const language of ['en', 'es']) {
    const html = render('Navbar', {}, language);
    assert.doesNotMatch(html, /Ask AI Advisor|Consultar al asesor IA|<select/);
    assert.match(html, /aria-label="(?:Choose language|Elegir idioma)"/);
    assert.ok(html.includes(`>${language.toUpperCase()}</span>`));
    assert.ok(html.includes('/contact'));
  }
});
test('Properties filter labels change while API values remain English', () => {
  const html = render('Filters', { filters: { propertyType: 'Apartment', furnishing: 'Furnished' }, sort: 'price_asc', count: 0 }, 'es');
  for (const word of ['Ubicación', 'Tipo de propiedad', 'Precio mínimo', 'Precio máximo', 'Habitaciones', 'Limpiar filtros', 'Precio: menor a mayor', 'Apartamento', 'Amueblado']) assert.ok(html.includes(word), word);
  assert.match(html, /id="filter-furnishing-value"[^>]*>Amueblado</);
  assert.match(html, /id="sort-selector-value"[^>]*>Precio: menor a mayor</);
});
test('chat translates static UI and prompts but never historical user/model text', () => {
  const html = render('Chat', { state: 'success', messages: [{ id: 1, role: 'user', content: 'My original English question' }, { id: 2, role: 'assistant', content: 'View Property' }], resetKey: 0 }, 'es');
  for (const phrase of ['Asesor inmobiliario IA', 'Departamentos por menos de 2M AED', 'Amueblados en Dubai Marina', 'Villas con 3+ habitaciones', 'Describí la propiedad']) assert.ok(html.includes(phrase), phrase);
  assert.ok(html.includes('My original English question'));
  assert.ok(html.includes('View Property'));
});
test('Spanish quick prompt sends Spanish text through the same chat transport', async () => {
  let request;
  const store = createChatAssistantStore(async messages => { request = messages; return { message: 'Respuesta', properties: [] }; });
  await store.sendMessage(translate('es', 'Furnished in Dubai Marina'));
  assert.deepEqual(request, [{ role: 'user', content: 'Amueblados en Dubai Marina' }]);
});
test('property cards localize labels while keeping project, address, image and slug intact', () => {
  const property = { slug: 'original-slug', project_name: 'Home', address: 'Dubai Marina', property_type: 'Apartment', furnishing: 'Furnished', completion_status: 'Ready', bedrooms: 0, bathrooms: 2, price: 1000000, image_urls: ['https://example.test/actual.webp'] };
  const html = render('Card', { property }, 'es');
  for (const word of ['Home', 'Dubai Marina', 'Apartamento', 'Amueblado', 'Listo', 'Estudio', '2 baños', 'Ver propiedad', 'Programar visita']) assert.ok(html.includes(word), word);
  assert.ok(html.includes('/properties/original-slug#inquiry-card'));
  assert.ok(html.includes('https://example.test/actual.webp'));
});
test('About, Contact and 404 render Spanish static copy', () => {
  assert.ok(render('About', {}, 'es').includes('Nuestro enfoque'));
  const contact = render('Contact', {}, 'es');
  for (const word of ['Nombre completo', 'Correo electrónico', 'Teléfono', 'Asunto', 'Mensaje', 'Enviar mensaje']) assert.ok(contact.includes(word), word);
  assert.ok(render('NotFound', {}, 'es').includes('Página no encontrada.'));
});

test('chat loading and error feedback also localize without changing request logic', () => {
  const loading = render('Chat', { state: 'searching', messages: [], resetKey: 0 }, 'es');
  assert.ok(loading.includes('Buscando propiedades disponibles...'));
  const error = render('Chat', { state: 'error', error: 'We couldn’t complete your search. Please try again.', messages: [], resetKey: 0 }, 'es');
  assert.ok(error.includes('No pudimos completar tu búsqueda. Intentá nuevamente.'));
  assert.ok(error.includes('Reintentar'));
});
