import "dotenv/config";
import { test, before, after, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";

// A dummy key only allows constructing the mocked provider. It never leaves this process.
const realGeminiEnabled = process.env.RUN_GEMINI_INTEGRATION === "1" &&
  Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
process.env.GOOGLE_GENERATIVE_AI_API_KEY ||= "test-only-not-a-real-key";

const { default: app } = await import("../app.js");
const { aiModel } = await import("../libs/ai.js");
const { supabase } = await import("../libs/supabase.js");
const { searchPropertiesTool } = await import("../tools/searchProperties.tool.js");
const { chatRequestSchema } = await import("../schemas/chat.schema.js");

const rows = Array.from({ length: 10 }, (_, i) => ({
  id: `fixture-${i}`, slug: `fixture-property-${i}`, price: 400000 + i * 100000,
  bedrooms: i < 4 ? 0 : 2, bathrooms: 1, property_type: "Apartment",
  furnishing: "Furnished", completion_status: "Ready", address: "Dubai Marina",
  available: i !== 1, featured: true, created_at: "2026-01-01T00:00:00Z",
}));
let server;
let baseUrl;
let modelMock;
let databaseMock;
let logMock;
let calls;
let databaseError;

function fixtureQuery() {
  let selected = [...rows];
  const ordering = [];
  return {
    select() { return this; },
    eq(column, value) { selected = selected.filter((p) => p[column] === value); return this; },
    gte(column, value) { selected = selected.filter((p) => p[column] >= value); return this; },
    lte(column, value) { selected = selected.filter((p) => p[column] <= value); return this; },
    ilike(column, pattern) {
      const term = pattern.slice(1, -1).toLowerCase();
      selected = selected.filter((p) => p[column].toLowerCase().includes(term));
      return this;
    },
    order(column, { ascending }) { ordering.push({ column, ascending }); return this; },
    async range(start, end) {
      if (databaseError) return { data: null, count: null, error: databaseError };
      selected.sort((a, b) => {
        for (const { column, ascending } of ordering) {
          const comparison = a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0;
          if (comparison) return ascending ? comparison : -comparison;
        }
        return 0;
      });
      return { data: selected.slice(start, end + 1), count: selected.length, error: null };
    },
  };
}

function generated(content, reason = "stop") {
  return {
    content, finishReason: { unified: reason, raw: reason },
    usage: {
      inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
      outputTokens: { total: 5, text: 5, reasoning: 0 },
    },
    warnings: [],
  };
}
const textResult = (text = "Hola, ¿en qué puedo ayudarte?") => generated([{ type: "text", text }]);
function useSearch(input, count = 1) {
  let step = 0;
  modelMock.mock.mockImplementation(async (options) => {
    calls.push(options);
    if (step++ < count) return generated([{
      type: "tool-call", toolCallId: `search-${step}`,
      toolName: "searchProperties", input: JSON.stringify(input),
    }], "tool-calls");
    return textResult("Encontré estas propiedades.");
  });
}

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api/chat`;
});
after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
});
beforeEach(() => {
  calls = [];
  databaseError = null;
  modelMock = mock.method(aiModel, "doGenerate", async (options) => {
    calls.push(options);
    return textResult();
  });
  databaseMock = mock.method(supabase, "from", (table) => {
    assert.equal(table, "properties");
    return fixtureQuery();
  });
  logMock = mock.method(console, "error", () => {});
});
afterEach(() => {
  modelMock.mock.restore();
  databaseMock.mock.restore();
  logMock.mock.restore();
});

async function post(body, raw = false) {
  const response = await fetch(baseUrl, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: raw ? body : JSON.stringify(body), signal: AbortSignal.timeout(20000),
  });
  return { status: response.status, body: await response.json() };
}
const user = (content = "Hola") => ({ role: "user", content });
const chat = () => post({ messages: [user("Busco propiedades")] });
const toolOutput = () => calls.at(-1).prompt.findLast((p) => p.role === "tool").content[0].output.value;

for (const [name, body] of [
  ["missing body fields", {}],
  ["messages is not an array", { messages: "hola" }],
  ["empty messages", { messages: [] }],
  ["invalid role", { messages: [{ role: "system", content: "hola" }] }],
  ["last message is not user", { messages: [{ role: "assistant", content: "hola" }] }],
  ["message longer than 4000", { messages: [user("x".repeat(4001))] }],
  ["conversation longer than 20000", { messages: Array.from({ length: 6 }, () => user("x".repeat(4000))) }],
  ["more than 20 messages", { messages: Array.from({ length: 21 }, () => user()) }],
  ["blank content", { messages: [user("   ")] }],
  ["content is not a string", { messages: [user(2)] }],
]) {
  test(`body validation rejects ${name} before calling the model`, async () => {
    const { status, body: result } = await post(body);
    assert.equal(status, 400);
    assert.deepEqual(result, { success: false, error: { message: "Invalid request parameters" } });
    assert.equal(modelMock.mock.callCount(), 0);
    assert.equal(databaseMock.mock.callCount(), 0);
  });
}

test("malformed JSON returns sanitized 400", async () => {
  const { status, body } = await post("{", true);
  assert.equal(status, 400);
  assert.deepEqual(body, { success: false, error: { message: "Invalid JSON body" } });
  assert.equal(modelMock.mock.callCount(), 0);
});

test("body schema trims content and accepts exact message and conversation bounds", () => {
  assert.equal(chatRequestSchema.parse({ messages: [user(" Hola ")] }).messages[0].content, "Hola");
  assert.equal(chatRequestSchema.parse({
    messages: Array.from({ length: 5 }, () => user("x".repeat(4000))),
  }).messages.length, 5);
});

test("normal chat without tools preserves endpoint response contract", async () => {
  const { status, body } = await post({ messages: [user(" Hola ")] });
  assert.equal(status, 200);
  assert.deepEqual(body, {
    success: true, data: { message: "Hola, ¿en qué puedo ayudarte?", properties: [] },
  });
  assert.equal(calls.length, 1);
  assert.equal(databaseMock.mock.callCount(), 0);
  assert.equal(calls[0].prompt.at(-1).content[0].text, "Hola");
});

test("installed Google provider and SDK use compatible v4 model and tool schema", () => {
  assert.equal(aiModel.specificationVersion, "v4");
  assert.equal(typeof aiModel.doGenerate, "function");
  assert.equal(typeof searchPropertiesTool.execute, "function");
  assert.equal(searchPropertiesTool.inputSchema.parse({}).limit, 5);
});

test("model tool call runs actual SDK, tool and property service then produces final response", async () => {
  useSearch({});
  const { status, body } = await chat();
  assert.equal(status, 200);
  assert.deepEqual(Object.keys(body).sort(), ["data", "success"]);
  assert.deepEqual(Object.keys(body.data).sort(), ["message", "properties"]);
  assert.equal(body.data.message, "Encontré estas propiedades.");
  assert.equal(body.data.properties.length, 5);
  assert.equal(calls.length, 2);
  assert.equal(databaseMock.mock.callCount(), 1);
  assert.equal(toolOutput().totalMatches, 9);
  assert.equal(toolOutput().returned, 5);
});

for (const [name, input, expected] of [
  ["maxPrice", { maxPrice: 600000 }, rows.filter((p) => p.available && p.price <= 600000)],
  ["Studio bedrooms=0", { bedrooms: 0 }, rows.filter((p) => p.available && p.bedrooms === 0)],
  ["combined filters", {
    minPrice: 400000, maxPrice: 700000, bedrooms: 0, bathrooms: 1,
    propertyType: "Apartment", furnishing: "Furnished", completionStatus: "Ready",
    location: "mARIna", sort: "price_desc", limit: 2,
  }, rows.filter((p) => p.available && p.bedrooms === 0 && p.price <= 700000).reverse().slice(0, 2)],
]) {
  test(`searchProperties tool supports ${name}`, async () => {
    useSearch(input);
    const { status, body } = await chat();
    assert.equal(status, 200);
    assert.deepEqual(body.data.properties, expected);
    assert.deepEqual(toolOutput().properties, expected);
  });
}

test("tool never returns unavailable properties", async () => {
  useSearch({ limit: 8 });
  const { status, body } = await chat();
  assert.equal(status, 200);
  assert.equal(body.data.properties.length, 8);
  assert.ok(body.data.properties.every((p) => p.available === true));
  assert.ok(toolOutput().properties.every((p) => p.available === true));
  assert.ok(!body.data.properties.some((p) => p.id === "fixture-1"));
});

for (const limit of [1, 3, 8]) {
  test(`tool respects limit=${limit} and reports total matches`, async () => {
    useSearch({ limit });
    const { status, body } = await chat();
    assert.equal(status, 200);
    assert.equal(body.data.properties.length, limit);
    assert.equal(toolOutput().returned, limit);
    assert.equal(toolOutput().totalMatches, 9);
  });
}

test("tool rejects invalid inputs including reversed price bounds", () => {
  for (const input of [
    { limit: 0 }, { limit: 9 }, { bedrooms: -1 }, { bedrooms: "0" },
    { maxPrice: -1 }, { minPrice: 100, maxPrice: 50 }, { sort: "address" },
  ]) {
    assert.equal(searchPropertiesTool.inputSchema.safeParse(input).success, false, JSON.stringify(input));
  }
});

test("multiple tool steps deduplicate properties and stop at four steps", async () => {
  useSearch({ limit: 3 }, 10);
  const { status, body } = await chat();
  assert.equal(status, 200);
  assert.equal(calls.length, 4);
  assert.equal(body.data.properties.length, 3);
});

test("model error produces sanitized 500 through Express 5", async () => {
  modelMock.mock.mockImplementation(async () => {
    throw new Error("private model error containing a fake secret");
  });
  const { status, body } = await chat();
  assert.equal(status, 500);
  assert.deepEqual(body, { success: false, error: { message: "Internal server error" } });
  assert.ok(logMock.mock.callCount() > 0);
});

test("Supabase tool error produces sanitized 500 and stops before another model call", async () => {
  databaseError = { code: "XX000", message: "private Postgres detail", details: "sensitive detail", hint: "secret hint" };
  useSearch({ maxPrice: 1000000 });
  const { status, body } = await chat();
  assert.equal(status, 500);
  assert.deepEqual(body, { success: false, error: { message: "Internal server error" } });
  assert.equal(calls.length, 1);
});

test("real Gemini integration is explicit opt-in and requires a configured key", {
  skip: !realGeminiEnabled,
  timeout: 60000,
}, async () => {
  modelMock.mock.restore();
  const { status, body } = await post({ messages: [user("Hola, saludame brevemente.")] });
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(typeof body.data.message, "string");
  assert.ok(body.data.message.trim().length > 0);
  assert.deepEqual(body.data.properties, []);
  assert.equal(databaseMock.mock.callCount(), 0);
});
for (const withTool of [false, true]) {
  test(`Google provider transport handles ${withTool ? "tool roundtrip" : "text generation"} without real Gemini calls`, async () => {
    modelMock.mock.restore();
    const originalFetch = globalThis.fetch;
    const requests = [];
    const transport = mock.method(globalThis, "fetch", async (url, options) => {
      if (!String(url).startsWith("https://generativelanguage.googleapis.com/")) {
        return originalFetch(url, options);
      }
      const input = JSON.parse(options.body);
      requests.push(input);
      const parts = withTool && requests.length === 1
        ? [{ functionCall: { name: "searchProperties", args: { bedrooms: 0, maxPrice: 600000 } } }]
        : [{ text: "Respuesta simulada de Gemini." }];
      return new Response(JSON.stringify({
        candidates: [{ content: { role: "model", parts }, finishReason: "STOP" }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    try {
      const { status, body } = await chat();
      assert.equal(status, 200);
      assert.equal(body.data.message, "Respuesta simulada de Gemini.");
      assert.equal(requests.length, withTool ? 2 : 1);
      const declaration = requests[0].tools.flatMap((p) => p.functionDeclarations)
        .find((p) => p.name === "searchProperties");
      assert.ok(declaration);
      if (withTool) {
        assert.deepEqual(body.data.properties, rows.filter((p) =>
          p.available && p.bedrooms === 0 && p.price <= 600000));
        assert.ok(requests[1].contents.some((p) => p.parts.some((part) => part.functionResponse)));
      } else {
        assert.deepEqual(body.data.properties, []);
        assert.equal(databaseMock.mock.callCount(), 0);
      }
    } finally {
      transport.mock.restore();
    }
  });
}

test("invalid model tool filters never query Supabase or reach a second model call", async () => {
  useSearch({ minPrice: 100, maxPrice: 50 });
  const { status, body } = await chat();
  assert.equal(status, 500);
  assert.deepEqual(body, { success: false, error: { message: "Internal server error" } });
  assert.equal(databaseMock.mock.callCount(), 0);
  assert.equal(calls.length, 1);
});
