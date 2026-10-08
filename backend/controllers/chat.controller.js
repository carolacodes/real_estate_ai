import {
  chatRequestSchema,
} from "../schemas/chat.schema.js";

import {
  generateChatResponse,
  streamChatResponse,
} from "../services/chat.service.js";

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

  const result =
    streamChatResponse(messages);

  result.pipeTextStreamToResponse(
    res
  );
}