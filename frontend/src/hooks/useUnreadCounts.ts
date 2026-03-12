"use client";

import { useState, useEffect, useCallback } from "react";
import { getChannelsLatest } from "@/lib/api-chat";

const STORAGE_KEY = "chat_last_read";

function getLastRead(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setLastRead(channelId: string) {
  const data = getLastRead();
  data[channelId] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function markChannelRead(channelId: string) {
  setLastRead(channelId);
  window.dispatchEvent(new Event("chat-read"));
}

export function useUnreadCounts() {
  const [unreadMap, setUnreadMap] = useState<Record<string, boolean>>({});
  const [totalUnread, setTotalUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const latest = await getChannelsLatest();
      const lastRead = getLastRead();
      const newMap: Record<string, boolean> = {};
      let count = 0;

      for (const [channelId, info] of Object.entries(latest)) {
        if (!info.lastMessageAt) continue;
        const lastReadTime = lastRead[channelId];
        const hasUnread = !lastReadTime || info.lastMessageAt > lastReadTime;
        newMap[channelId] = hasUnread;
        if (hasUnread) count++;
      }

      setUnreadMap(newMap);
      setTotalUnread(count);
    } catch {
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(refresh, 0);
    const interval = setInterval(refresh, 30000);
    const handleRead = () => refresh();
    window.addEventListener("chat-read", handleRead);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      window.removeEventListener("chat-read", handleRead);
    };
  }, [refresh]);

  return { unreadMap, totalUnread, refresh };
}
