import { Server as SocketIOServer } from "socket.io";
import { RequestHandler } from "express";
import passport from "passport";
import { db } from "@/config/database";
import { messages, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export function setupSocketIO(
  io: SocketIOServer,
  sessionMiddleware: RequestHandler,
) {
  // Share Express session with Socket.IO
  io.use((socket, next) => {
    const req = socket.request as any;
    const res = { end: () => {} } as any;
    sessionMiddleware(req, res, () => {
      passport.initialize()(req, res, () => {
        passport.session()(req, res, () => {
          if (!req.user) return next(new Error("Unauthorized"));
          next();
        });
      });
    });
  });

  io.on("connection", (socket) => {
    const user = (socket.request as any).user;

    // Join a channel room
    socket.on("join", (channelId: string) => {
      socket.join(channelId);
    });

    // Leave a channel room
    socket.on("leave", (channelId: string) => {
      socket.leave(channelId);
    });

    // Send a message
    socket.on("message", async (data: { channelId: string; body: string }) => {
      if (!data.body?.trim()) return;

      const [msg] = await db
        .insert(messages)
        .values({
          channelId: data.channelId,
          userId: user.id,
          body: data.body.trim(),
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
        .where(eq(users.id, user.id));

      io.to(data.channelId).emit("message", {
        ...msg,
        user: sender,
      });
    });
  });
}
