"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage } from "@shared/index";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

export function useSocket(onMessage: (msg: ChatMessage) => void) {
  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<string | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("message", (msg: ChatMessage) => {
      onMessageRef.current(msg);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinChannel = useCallback((channelId: string) => {
    if (channelRef.current) {
      socketRef.current?.emit("leave", channelRef.current);
    }
    channelRef.current = channelId;
    socketRef.current?.emit("join", channelId);
  }, []);

  const sendMessage = useCallback((channelId: string, body: string) => {
    socketRef.current?.emit("message", { channelId, body });
  }, []);

  const leaveChannel = useCallback((channelId?: string) => {
    const targetChannel = channelId ?? channelRef.current;
    if (!targetChannel) return;

    socketRef.current?.emit("leave", targetChannel);
    if (channelRef.current === targetChannel) {
      channelRef.current = null;
    }
  }, []);

  return { joinChannel, sendMessage, leaveChannel };
}
