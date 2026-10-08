import { test, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import app from "../app.js";
import { supabase } from "../libs/supabase.js";

let server;
let baseUrl;
let dataset;

// Fixture reads are deliberately read-only, independent of the API under test.
before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api/properties`;
  const { data, error } = await supabase.from("properties").select("*");
  assert.equal(error, null, "Read-only Supabase fixture query must succeed");
  dataset = data;
  assert.ok(dataset.length > 0, "Integration tests require the existing dataset");
});

after(async () => {
  if (server) await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
});

async function request(path = "") {
  const response = await fetch(baseUrl + path, { signal: AbortSignal.timeout(15000) });
  return { status: response.status, body: await response.json() };
}

const available = () => dataset.filter((p) => p.available);
const slugs = (rows) => rows.map((p) => p.slug).sort();
function matches(body, expected) {
  assert.equal(body.success, true);
  assert.deepEqual(slugs(body.data), slugs(expected));
  assert.ok(body.data.every((p) => p.available === true));
  assert.equal(body.pagination.total, expected.length);
}

test("GET list returns 200, defaults and exact available count", async () => {
  const { status, body } = await request();
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.length, Math.min(12, available().length));
  assert.deepEqual(body.pagination, {
    page: 1, limit: 12, total: available().length,
    totalPages: Math.ceil(available().length / 12),
  });
  assert.ok(body.data.every((p) => p.available));
});

test("list respects limit, page offsets and has no duplicate pages", async () => {
  const first = await request("?limit=3&page=1");
  const second = await request("?limit=3&page=2");
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(first.body.data.length, 3);
  assert.equal(second.body.data.length, 3);
  assert.equal(second.body.pagination.page, 2);
  assert.ok(second.body.data.every((p) => !first.body.data.some((q) => p.slug === q.slug)));
});

for (const query of [
  "page=0", "page=-1", "page=hello", "page=1.5", "limit=0", "limit=-1",
  "limit=500", "limit=51", "limit=hello", "limit=1.5", "limit=",
  "page=1&page=2", "sort=address", "sort=__proto__",
]) {
  test(`list rejects invalid ${query} with 400`, async () => {
    const { status, body } = await request("?" + query);
    assert.equal(status, 400);
    assert.deepEqual(body, { success: false, error: { message: "Invalid request parameters" } });
  });
}

test("featured returns only available featured properties and respects limit", async () => {
  const { status, body } = await request("/featured?limit=3");
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.length, Math.min(3, available().filter((p) => p.featured).length));
  assert.ok(body.data.every((p) => p.available === true && p.featured === true));
});

test("featured rejects limit greater than 50", async () => {
  assert.equal((await request("/featured?limit=51")).status, 400);
});

test("slug returns the expected available property", async () => {
  const property = available()[0];
  const { status, body } = await request("/" + encodeURIComponent(property.slug));
  assert.equal(status, 200);
  assert.deepEqual(body, { success: true, data: property });
});

test("nonexistent slug returns consistent 404", async () => {
  const { status, body } = await request("/nonexistent-property-api-test-7250b2cb");
  assert.equal(status, 404);
  assert.deepEqual(body, { success: false, error: { message: "Property not found" } });
});

test("search maxPrice matches all and only properties below the price cap", async () => {
  const cap = Math.min(...available().map((p) => Number(p.price)));
  const { status, body } = await request(`/search?maxPrice=${cap}&limit=50`);
  assert.equal(status, 200);
  matches(body, available().filter((p) => Number(p.price) <= cap));
});

test("search accepts bedrooms=0 and returns studios", async () => {
  const expected = available().filter((p) => p.bedrooms === 0);
  assert.ok(expected.length > 0, "Dataset must contain a studio to verify this case");
  const { status, body } = await request("/search?bedrooms=0&limit=50");
  assert.equal(status, 200);
  matches(body, expected);
});

test("search combines propertyType, bedrooms and maxPrice", async () => {
  const p = available().find((p) => p.bedrooms === 0);
  assert.ok(p);
  const query = new URLSearchParams({
    propertyType: p.property_type, bedrooms: String(p.bedrooms),
    maxPrice: String(p.price), limit: "50",
  });
  const { status, body } = await request("/search?" + query);
  assert.equal(status, 200);
  matches(body, available().filter((q) =>
    q.property_type === p.property_type && q.bedrooms === p.bedrooms && Number(q.price) <= Number(p.price)));
});

test("search combines every filter including exact bathrooms and price bounds", async () => {
  const p = available()[0];
  const query = new URLSearchParams({
    minPrice: String(p.price), maxPrice: String(p.price), bedrooms: String(p.bedrooms),
    bathrooms: String(p.bathrooms), propertyType: p.property_type,
    furnishing: p.furnishing, completionStatus: p.completion_status,
    location: p.address, limit: "50",
  });
  const { status, body } = await request("/search?" + query);
  assert.equal(status, 200);
  matches(body, available().filter((q) =>
    Number(q.price) === Number(p.price) && q.bedrooms === p.bedrooms && q.bathrooms === p.bathrooms &&
    q.property_type === p.property_type && q.furnishing === p.furnishing &&
    q.completion_status === p.completion_status &&
    q.address.toLowerCase().includes(p.address.toLowerCase())));
});

for (const query of [
  "minPrice=100&maxPrice=50", "maxPrice=-500", "minPrice=-1", "bedrooms=hola",
  "bedrooms=-1", "bathrooms=-1", "bathrooms=1.5", "limit=51", "page=0", "sort=slug",
]) {
  test(`search rejects invalid ${query} with 400`, async () => {
    assert.equal((await request("/search?" + query)).status, 400);
  });
}

for (const sort of ["price_asc", "price_desc"]) {
  test(`${sort} orders prices globally across pages in list and search`, async () => {
    const prices = available().map((p) => Number(p.price)).sort((a, b) =>
      sort === "price_asc" ? a - b : b - a);
    for (const path of ["", "/search"]) {
      let actual = [];
      for (let page = 1; page <= Math.ceil(prices.length / 50); page++) {
        const { status, body } = await request(`${path}?sort=${sort}&limit=50&page=${page}`);
        assert.equal(status, 200);
        actual.push(...body.data.map((p) => Number(p.price)));
      }
      assert.deepEqual(actual, prices);
    }
  });
}

test("newest sorts by created_at with id as a stable tie breaker", async () => {
  const expected = [...available()].sort((a, b) =>
    b.created_at.localeCompare(a.created_at) || String(b.id).localeCompare(String(a.id)));
  const { status, body } = await request("?sort=newest&limit=12");
  assert.equal(status, 200);
  assert.deepEqual(body.data.map((p) => p.slug), expected.slice(0, 12).map((p) => p.slug));
});

test("location supports case-insensitive partial matching", async () => {
  const term = available()[0].address.slice(0, 5);
  const expected = available().filter((p) => p.address.toLowerCase().includes(term.toLowerCase()));
  assert.ok(expected.length > 0);
  for (const location of [term.toLowerCase(), term.toUpperCase()]) {
    const { status, body } = await request("/search?" + new URLSearchParams({ location, limit: "50" }));
    assert.equal(status, 200);
    matches(body, expected);
  }
});

test("location treats percent and underscore as literal characters", async () => {
  for (const location of ["%", "_"]) {
    const { status, body } = await request("/search?" + new URLSearchParams({ location, limit: "50" }));
    assert.equal(status, 200);
    matches(body, available().filter((p) => p.address.includes(location)));
  }
});

test("search paginates and returns empty pages with accurate metadata", async () => {
  const { status, body } = await request("/search?limit=2&page=2");
  assert.equal(status, 200);
  assert.equal(body.data.length, 2);
  assert.equal(body.pagination.total, available().length);
  const empty = await request("/search?limit=50&page=100");
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.data, []);
  assert.equal(empty.body.pagination.total, available().length);
});

// A local read-only double covers unavailable rows even when every real row is available.
// It replaces only the Supabase query boundary; HTTP, routes, validation and service remain real.
function fixtureQuery(rows, error = null) {
  let selected = rows;
  const query = {
    select() { return this; },
    eq(column, value) { selected = selected.filter((p) => p[column] === value); return this; },
    order() { return this; },
    range(start, end) { return Promise.resolve({ data: selected.slice(start, end + 1), count: selected.length, error }); },
    limit(limit) { return Promise.resolve({ data: selected.slice(0, limit), error }); },
    maybeSingle() { return Promise.resolve({ data: selected[0] ?? null, error }); },
  };
  return query;
}

test("unavailable property is excluded from all four endpoints without database writes", async (t) => {
  const unavailable = dataset.filter((p) => !p.available);
  if (unavailable.length) {
    const rows = [];
    for (let page = 1; page <= Math.ceil(available().length / 50); page++) {
      rows.push(...(await request(`?limit=50&page=${page}`)).body.data);
      rows.push(...(await request(`/search?limit=50&page=${page}`)).body.data);
    }
    rows.push(...(await request("/featured?limit=50")).body.data);
    assert.ok(rows.every((p) => p.available === true));
    for (const p of unavailable) {
      assert.equal((await request("/" + encodeURIComponent(p.slug))).status, 404);
    }
    return;
  }
  t.diagnostic("All real rows are available; unavailable case uses a local fixture, without writes.");
  const rows = [
    { ...available()[0], slug: "test-available", featured: true },
    { ...available()[0], slug: "test-unavailable", featured: true, available: false },
  ];
  const replacement = mock.method(supabase, "from", () => fixtureQuery(rows));
  try {
    for (const path of ["", "/search", "/featured"]) {
      const { status, body } = await request(path);
      assert.equal(status, 200);
      assert.deepEqual(body.data.map((p) => p.slug), ["test-available"]);
    }
    const { status, body } = await request("/test-unavailable");
    assert.equal(status, 404);
    assert.deepEqual(body, { success: false, error: { message: "Property not found" } });
  } finally {
    replacement.mock.restore();
  }
});

test("Supabase failure returns sanitized 500 through Express async error handling", async () => {
  const replacement = mock.method(supabase, "from", () =>
    fixtureQuery([], { message: "private database details", hint: "private hint" }));
  const logger = mock.method(console, "error", () => {});
  try {
    for (const path of ["", "/search", "/featured", "/test-slug"]) {
      const { status, body } = await request(path);
      assert.equal(status, 500);
      assert.deepEqual(body, { success: false, error: { message: "Internal server error" } });
    }
    assert.equal(logger.mock.callCount(), 4);
  } finally {
    replacement.mock.restore();
    logger.mock.restore();
  }
});

test("search with no matches returns zero total and zero pages", async () => {
  for (const page of [1, 100]) {
    const { status, body } = await request("/search?" + new URLSearchParams({
      location: "nonexistent-location-7250b2cb", limit: "50", page: String(page),
    }));
    assert.equal(status, 200);
    assert.deepEqual(body, {
      success: true, data: [],
      pagination: { page, limit: 50, total: 0, totalPages: 0 },
    });
  }
});

test("list accepts maximum limit 50 and returns an empty page past the end", async () => {
  const { status, body } = await request("?limit=50&page=100");
  assert.equal(status, 200);
  assert.deepEqual(body.data, []);
  assert.deepEqual(body.pagination, {
    page: 100, limit: 50, total: available().length,
    totalPages: Math.ceil(available().length / 50),
  });
});
