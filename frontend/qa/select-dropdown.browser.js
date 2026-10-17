// Run through the browser's cua_repl runtime with the existing local app tab.
// No browser driver, UI library, backend fixture or dependency is installed.
import assert from 'node:assert/strict';

export async function verifySelectDropdowns(tab) {
  let assertions = 0;
  const check = (actual, expected) => { assert.equal(actual, expected); assertions++; };
  const state = () => tab.getAXState({ emit: false });
  const trigger = name => tab.playwright.locator(`#search-${name}`);
  const option = name => tab.playwright.getByRole('option', { name, exact: true });
  async function choose(name, label) {
    await trigger(name).click();
    await state();
    check(await trigger(name).getAttribute('aria-expanded'), 'true');
    await option(label).click();
    await state();
    check(await trigger(name).getAttribute('aria-expanded'), 'false');
    check(await tab.playwright.locator(`#search-${name}-value`).innerText(), label);
  }

  await tab.goto('http://127.0.0.1:5182/');
  await state();
  await trigger('location').press('Enter');
  await state();
  check(await option('All Enclaves').getAttribute('aria-selected'), 'true');
  await option('All Enclaves').press('ArrowDown');
  await option('Dubai Marina').press('Enter');
  await state();
  check(await tab.playwright.locator('#search-location-value').innerText(), 'Dubai Marina');
  await trigger('location').press('Space');
  await state();
  check(await option('Dubai Marina').getAttribute('aria-selected'), 'true');
  await option('Dubai Marina').press('Escape');
  await state();
  check(await trigger('location').getAttribute('aria-expanded'), 'false');
  check(await tab.playwright.evaluate(() => document.activeElement.id), 'search-location');
  await choose('propertyType', 'Apartment');
  await choose('maxPrice', 'Up to AED 2M');
  await choose('bedrooms', 'Studio');
  await tab.playwright.getByRole('button', { name: 'Discover Assets', exact: true }).click();
  await state();
  const homeQuery = new URL(await tab.url()).searchParams;
  for (const [name, value] of Object.entries({ location: 'Dubai Marina', propertyType: 'Apartment', maxPrice: '2000000', bedrooms: '0' })) check(homeQuery.get(name), value);

  await tab.goto(`${await tab.url()}&page=3&limit=24`);
  await state();
  await tab.playwright.locator('#filter-furnishing').click();
  await state();
  await option('Furnished').click();
  await state();
  const furnishingQuery = new URL(await tab.url()).searchParams;
  for (const [name, value] of homeQuery) check(furnishingQuery.get(name), value);
  check(furnishingQuery.get('furnishing'), 'Furnished');
  check(furnishingQuery.get('page'), '1');
  check(furnishingQuery.get('limit'), '24');
  await tab.playwright.locator('#sort-selector').click();
  await state();
  await option('Price: Low to High').click();
  await state();
  check(new URL(await tab.url()).searchParams.get('sort'), 'price_asc');
  check(new URL(await tab.url()).searchParams.get('furnishing'), 'Furnished');

  await tab.playwright.locator('#filter-bathrooms').press('Enter');
  await state();
  await tab.playwright.getByRole('button', { name: 'Choose language', exact: true }).click();
  await state();
  check(await tab.playwright.getByRole('listbox').count(), 0);
  await tab.playwright.getByRole('menuitemradio', { name: 'Español' }).click();
  await state();
  const translatedQuery = await tab.url();
  await tab.playwright.locator('#filter-furnishing').click();
  await state();
  check(await option('Amueblado').getAttribute('aria-selected'), 'true');
  await option('Amueblado').press('Escape');
  await state();
  check(await tab.url(), translatedQuery);
  check(await tab.playwright.locator('#sort-selector-value').innerText(), 'Precio: menor a mayor');
  await tab.playwright.getByRole('button', { name: 'Elegir idioma', exact: true }).click();
  await state();
  await tab.playwright.getByRole('menuitemradio', { name: 'English' }).click();
  await state();
  return { assertions, result: 'passed', coverage: 'open/select/onChange, selected state, keyboard/Escape, outside click, Home filters, Properties query preservation and i18n' };
}
