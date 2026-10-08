import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),

  content: z
    .string()
    .trim()
    .min(1)
    .max(4000),
});

export const chatRequestSchema = z
  .object({
    messages: z
      .array(chatMessageSchema)
      .min(1)
      .max(20),
  })
  .refine(
    ({ messages }) =>
      messages[messages.length - 1]?.role === "user",
    {
      message:
        "The last message must be from the user",
      path: ["messages"],
    }
  )
  .refine(
    ({ messages }) => {
      const totalCharacters = messages.reduce(
        (total, message) =>
          total + message.content.length,
        0
      );

      return totalCharacters <= 20000;
    },
    {
      message:
        "Conversation exceeds the maximum allowed size",
      path: ["messages"],
    }
  );