import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { channels, messages, users, activities, chatMembers } from "@/db/schema";
import { eq, desc, and, max, sql, not, inArray } from "drizzle-orm";
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
        .values({
          name: "Community",
          type: "community",
          activityId: null,
          placeId: null,
        })
        .returning();

      return res.status(201).json(created);
    } catch (error) {
      console.error("Error creating community channel:", error);
      res.status(500).json({
        error: "Failed to create community channel",
        details: String(error),
      });
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

// Validate user has access to a channel (task or distro)
async function canAccessChannel(
  userId: string,
  channelId: string,
): Promise<boolean> {
  const [channel] = await db
    .select({
      id: channels.id,
      type: channels.type,
      activityId: channels.activityId,
      placeId: channels.placeId,
    })
    .from(channels)
    .where(eq(channels.id, channelId));

  if (!channel) return false;

  // Community channels are accessible to all
  if (channel.type === "community") return true;

  // Check if user is admin or manager - they can access all chats
  const [user] = await db
    .select({ userType: users.userType })
    .from(users)
    .where(eq(users.id, userId));

  if (user?.userType === "admin" || user?.userType === "manager") {
    return true;
  }

  // For task (order) channels, only creator + driver can access
  if (channel.type === "task" && channel.activityId) {
    const [activity] = await db
      .select({
        providerId: activities.providerId,
        assignedDriver: activities.assignedDriver,
      })
      .from(activities)
      .where(eq(activities.id, channel.activityId));

    if (
      activity?.providerId === userId ||
      activity?.assignedDriver === userId
    ) {
      return true;
    }
  }

  // For distro channels, all users who have accessed that distro can view
  if (channel.type === "distribution_center") {
    return true;
  }

  return false;
}

// Get messages for a channel
router.get(
  "/channels/:channelId/messages",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id as string;
      const channelId = req.params.channelId as string;

      if (!(await canAccessChannel(userId, channelId))) {
        return res.status(403).json({ error: "Access denied to this channel" });
      }

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

// Get participants for a channel
router.get(
  "/channels/:channelId/participants",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id as string;
      const channelId = req.params.channelId as string;

      if (!(await canAccessChannel(userId, channelId))) {
        return res.status(403).json({ error: "Access denied to this channel" });
      }

      const members = await db
        .select({
          id: users.id,
          firstname: users.firstname,
          lastname: users.lastname,
          profileImage: users.profileImage,
        })
        .from(chatMembers)
        .innerJoin(users, eq(chatMembers.userId, users.id))
        .where(eq(chatMembers.channelId, channelId as any));

      if (members.length === 0) {
        const messageParticipants = await db
          .selectDistinct({
            id: users.id,
            firstname: users.firstname,
            lastname: users.lastname,
            profileImage: users.profileImage,
          })
          .from(messages)
          .innerJoin(users, eq(messages.userId, users.id))
          .where(eq(messages.channelId, channelId as any));

        return res.json(messageParticipants);
      }

      return res.json(members);
    } catch (error) {
      console.error("Error fetching channel participants:", error);
      res.status(500).json({ error: "Failed to fetch channel participants" });
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

// Send automated message after order completion
router.post(
  "/send-completion-message",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { activityId, status, reason, assistanceOptions, assistanceNotes } =
        req.body;

      if (!activityId || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [channel] = await db
        .select()
        .from(channels)
        .where(
          and(eq(channels.type, "task"), eq(channels.activityId, activityId)),
        );

      if (!channel) {
        return res.status(404).json({ error: "Task channel not found" });
      }

      let messageBody = "";
      if (status === "completed") {
        messageBody = "✅ Delivery completed successfully";
      } else if (status === "incomplete") {
        messageBody = `⚠️ Delivery incomplete - ${reason || "No reason provided"}`;
      } else if (status === "need_assistance") {
        const reasons = [];
        if (assistanceOptions?.orderTooLarge) reasons.push("Order too large");
        if (assistanceOptions?.vehicleIssue) reasons.push("Vehicle issue");
        messageBody = `🚨 Assistance needed - ${reasons.join(", ")}${assistanceNotes ? ` - ${assistanceNotes}` : ""}`;
      }

      const [msg] = await db
        .insert(messages)
        .values({
          channelId: channel.id,
          userId,
          body: messageBody,
        })
        .returning();

      const [sender] = await db
        .select({
          id: users.id,
          firstname: users.firstname,
          lastname: users.lastname,
          profileImage: users.profileImage,
        })
        .from(users)
        .where(eq(users.id, userId));

      return res.status(201).json({
        ...msg,
        user: sender,
      });
    } catch (error) {
      console.error("Error sending completion message:", error);
      res.status(500).json({ error: "Failed to send completion message" });
    }
  },
);

// Get available users to add to a channel (admin only)
router.get(
  "/:channelId/available-users",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const channelId = req.params.channelId;

      const userPermissions = (req.user as any).permissions || [];
      if (!userPermissions.includes("manage_chat_members")) {
        return res
          .status(403)
          .json({ error: "Permission to manage chat members required" });
      }

      const channelParticipants = await db
        .selectDistinct({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(eq(chatMembers.channelId, channelId as any));

      const participantIds = new Set(
        channelParticipants.map((p) => p.userId),
      );

      const availableUsers = await db
        .select({
          id: users.id,
          firstname: users.firstname,
          lastname: users.lastname,
          profileImage: users.profileImage,
        })
        .from(users)
        .where(not(inArray(users.id, Array.from(participantIds))));

      return res.json(availableUsers);
    } catch (error) {
      console.error("Error fetching available users:", error);
      res.status(500).json({ error: "Failed to fetch available users" });
    }
  },
);

// Add a user to a channel (admin only)
router.post(
  "/:channelId/add-participant",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const channelId = req.params.channelId as string;
      const { participantId } = req.body;

      if (!participantId) {
        return res.status(400).json({ error: "Participant ID required" });
      }

      const userPermissions = (req.user as any).permissions || [];
      if (!userPermissions.includes("manage_chat_members")) {
        return res
          .status(403)
          .json({ error: "Permission to manage chat members required" });
      }

      await db
        .insert(chatMembers)
        .values({
          channelId: channelId as any,
          userId: participantId as any,
        })
        .onConflictDoNothing();

      const [addedUser] = await db
        .select({
          firstname: users.firstname,
          lastname: users.lastname,
        })
        .from(users)
        .where(eq(users.id, participantId as any));

      const [msg] = await db
        .insert(messages)
        .values({
          channelId: channelId as any,
          userId,
          body: `✅ ${addedUser?.firstname} ${addedUser?.lastname} was added to the chat`,
        })
        .returning();

      const [sender] = await db
        .select({
          id: users.id,
          firstname: users.firstname,
          lastname: users.lastname,
          profileImage: users.profileImage,
        })
        .from(users)
        .where(eq(users.id, userId));

      return res.status(201).json({
        ...msg,
        user: sender,
      });
    } catch (error) {
      console.error("Error adding participant:", error);
      res.status(500).json({ error: "Failed to add participant" });
    }
  },
);

// Remove a user from a channel
router.post(
  "/:channelId/remove-participant",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const channelId = req.params.channelId as string;
      const { participantId } = req.body;

      if (!participantId) {
        return res.status(400).json({ error: "Participant ID required" });
      }

      const userPermissions = (req.user as any).permissions || [];
      if (!userPermissions.includes("manage_chat_members")) {
        return res
          .status(403)
          .json({ error: "Permission to manage chat members required" });
      }

      await db
        .delete(chatMembers)
        .where(
          and(
            eq(chatMembers.channelId, channelId as any),
            eq(chatMembers.userId, participantId as any),
          ),
        );

      const [removedUser] = await db
        .select({
          firstname: users.firstname,
          lastname: users.lastname,
        })
        .from(users)
        .where(eq(users.id, participantId as any));

      const [msg] = await db
        .insert(messages)
        .values({
          channelId: channelId as any,
          userId,
          body: `🚫 ${removedUser?.firstname} ${removedUser?.lastname} was removed from the chat`,
        })
        .returning();

      const [sender] = await db
        .select({
          id: users.id,
          firstname: users.firstname,
          lastname: users.lastname,
          profileImage: users.profileImage,
        })
        .from(users)
        .where(eq(users.id, userId));

      return res.status(201).json({
        ...msg,
        user: sender,
      });
    } catch (error) {
      console.error("Error removing participant:", error);
      res.status(500).json({ error: "Failed to remove participant" });
    }
  },
);

export default router;
