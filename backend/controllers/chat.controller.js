import {
  chatRequestSchema,
} from "../schemas/chat.schema.js";

import {
  generateChatResponse,
  streamChatResponse,
} from "../services/chat.service.js";
import { once } from "node:events";

export async function chat(req, res) {
  const { messages } =
    chatRequestSchema.parse(
      req.body
    );

  const response =
    await generateChatResponse(
      messages
    );

  return res.status(200).json({
    success: true,
    data: response,
  });
}

export async function chatStream(
  req,
  res
) {
  const { messages } =
    chatRequestSchema.parse(
      req.body
    );

  const controller = new AbortController();
  const abort = () => controller.abort();
  res.once("close", abort);
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(120000)]);
  const result = streamChatResponse(messages, { signal });

  // Preserve the original plain-text contract for curl and existing clients.
  if (!req.headers.accept?.includes("text/event-stream")) {
    result.pipeTextStreamToResponse(res);
    return;
  }

  res.status(200).set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  const write = async (event, data) => {
    signal.throwIfAborted();
    if (!res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)) {
      await once(res, "drain", { signal });
    }
  };

  try {
    const properties = new Map();
    let finished = false;
    await write("start", {});
    for await (const part of result.fullStream) {
      if (part.type === "error" || part.type === "tool-error" || part.type === "abort") {
        throw new Error("Chat stream failed");
      }
      if (part.type === "text-delta") await write("text-delta", { text: part.text });
      if (part.type === "tool-result" && part.toolName === "searchProperties") {
        for (const property of part.output?.properties ?? []) {
          if (property?.slug) properties.set(property.slug, property);
        }
      }
      if (part.type === "finish") finished = part.finishReason !== "error";
    }
    if (!finished) throw new Error("Incomplete chat stream");
    await write("properties", { properties: [...properties.values()] });
    await write("done", {});
  } catch {
    // Never expose provider errors, credentials or internal tool details.
    if (!res.destroyed) res.write('event: error\ndata: {"message":"Unable to complete your search. Please try again."}\n\n');
  } finally {
    controller.abort();
    res.off("close", abort);
    res.end();
  }
}
