import { z } from "zod";

export const chatChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["community", "task"]),
  activityId: z.string().nullable(),
  createdAt: z.string(),
});

export type ChatChannel = z.infer<typeof chatChannelSchema>;

export const chatMessageUserSchema = z.object({
  id: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  profileImage: z.string().nullable(),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  userId: z.string(),
  body: z.string(),
  createdAt: z.string(),
  user: chatMessageUserSchema,
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
