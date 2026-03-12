import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { channels, messages, users } from "@/db/schema";
import { eq, desc, and, max, sql } from "drizzle-orm";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// Get all channels the user can see
router.get("/channels", requireAuth, async (req: Request, res: Response) => {
  try {
    const allChannels = await db
      .select()
      .from(channels)
      .orderBy(channels.createdAt);

    return res.json(allChannels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Get or create the community channel
router.post(
  "/channels/community",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(channels)
        .where(eq(channels.type, "community"));

      if (existing) return res.json(existing);

      const [created] = await db
        .insert(channels)
        .values({ name: "Community", type: "community" })
        .returning();

      return res.status(201).json(created);
    } catch (error) {
      console.error("Error creating community channel:", error);
      res.status(500).json({ error: "Failed to create community channel" });
    }
  },
);

// Get channel by activity ID
router.get(
  "/channels/activity/:activityId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const activityId = req.params.activityId as string;

      const [channel] = await db
        .select()
        .from(channels)
        .where(
          and(eq(channels.type, "task"), eq(channels.activityId, activityId)),
        );

      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }

      return res.json(channel);
    } catch (error) {
      console.error("Error fetching task channel:", error);
      res.status(500).json({ error: "Failed to fetch task channel" });
    }
  },
);

// Get messages for a channel
router.get(
  "/channels/:channelId/messages",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const channelId = req.params.channelId as string;

      const result = await db
        .select({
          id: messages.id,
          channelId: messages.channelId,
          userId: messages.userId,
          body: messages.body,
          createdAt: messages.createdAt,
          user: {
            id: users.id,
            firstname: users.firstname,
            lastname: users.lastname,
            profileImage: users.profileImage,
          },
        })
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .where(eq(messages.channelId, channelId))
        .orderBy(messages.createdAt);

      return res.json(result);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  },
);

// Get latest message timestamp + count per channel (for unread badges)
router.get(
  "/channels/latest",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const result = await db
        .select({
          channelId: messages.channelId,
          lastMessageAt: max(messages.createdAt),
          messageCount: sql<number>`count(*)::int`,
        })
        .from(messages)
        .groupBy(messages.channelId);

      const map: Record<
        string,
        { lastMessageAt: string; messageCount: number }
      > = {};
      for (const row of result) {
        map[row.channelId] = {
          lastMessageAt: row.lastMessageAt?.toISOString() ?? "",
          messageCount: row.messageCount,
        };
      }

      return res.json(map);
    } catch (error) {
      console.error("Error fetching latest messages:", error);
      res.status(500).json({ error: "Failed to fetch latest messages" });
    }
  },
);

export default router;
