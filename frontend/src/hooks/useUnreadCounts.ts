"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getChannelsLatest,
} from "@/lib/api-chat";
import { useAuth } from "@/lib/auth-context";

const READ_COUNT_KEY = "chat_last_read_count";
const LATEST_COUNT_KEY = "chat_latest_counts";

type NumberMap = Record<string, number>;

interface UnreadState {
  unreadMap: Record<string, boolean>;
  unreadCountMap: NumberMap;
  totalUnread: number;
}

const EMPTY_STATE: UnreadState = {
  unreadMap: {},
  unreadCountMap: {},
  totalUnread: 0,
};

function scopedStorageKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}:${userId}` : baseKey;
}

function getNumberMap(storageKey: string): NumberMap {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(storageKey) || "{}",
    ) as Record<string, unknown>;

    const map: NumberMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        map[key] = Math.floor(value);
      }
    }

    return map;
  } catch {
    return {};
  }
}

function setNumberMap(storageKey: string, map: NumberMap) {
  localStorage.setItem(storageKey, JSON.stringify(map));
}

function normalizeMessageCount(value: unknown, hasLastMessageAt: boolean): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  // If we have a latest timestamp but no parseable count, there is at least one message.
  return hasLastMessageAt ? 1 : 0;
}

function computeUnreadState(latestCounts: NumberMap, readCounts: NumberMap): UnreadState {
  const unreadMap: Record<string, boolean> = {};
  const unreadCountMap: NumberMap = {};
  let totalUnread = 0;

  for (const [channelId, latestCount] of Object.entries(latestCounts)) {
    const baseline = readCounts[channelId] ?? 0;
    const unreadCount = Math.max(0, latestCount - baseline);

    unreadCountMap[channelId] = unreadCount;
    unreadMap[channelId] = unreadCount > 0;
    totalUnread += unreadCount;
  }

  return { unreadMap, unreadCountMap, totalUnread };
}

async function fetchLatestCounts(): Promise<NumberMap> {
  const latest = await getChannelsLatest();
  const latestCounts: NumberMap = {};

  for (const [channelId, info] of Object.entries(latest)) {
    const count = normalizeMessageCount(
      (info as { messageCount?: unknown }).messageCount,
      Boolean((info as { lastMessageAt?: unknown }).lastMessageAt),
    );
    latestCounts[channelId] = count;
  }

  return latestCounts;
}

export function markChannelRead(
  channelId: string,
  knownMessageCount?: number,
  userId?: string,
) {
  if (typeof window === "undefined") return;

  const readKey = scopedStorageKey(READ_COUNT_KEY, userId);
  const latestKey = scopedStorageKey(LATEST_COUNT_KEY, userId);
  const readCounts = getNumberMap(readKey);
  const latestCounts = getNumberMap(latestKey);

  const candidateBaseline =
    typeof knownMessageCount === "number" && Number.isFinite(knownMessageCount)
      ? Math.max(0, Math.floor(knownMessageCount))
      : latestCounts[channelId] ?? readCounts[channelId] ?? 0;

  const baseline = Math.max(readCounts[channelId] ?? 0, candidateBaseline);

  readCounts[channelId] = baseline;
  setNumberMap(readKey, readCounts);

  window.dispatchEvent(new Event("chat-read"));
}

export function useUnreadCounts() {
  const { user } = useAuth();
  const userId = user?.id;

  const readKey = scopedStorageKey(READ_COUNT_KEY, userId);
  const latestKey = scopedStorageKey(LATEST_COUNT_KEY, userId);

  const [state, setState] = useState<UnreadState>(() => {
    if (typeof window === "undefined") return EMPTY_STATE;
    if (!userId) return EMPTY_STATE;

    const cachedLatestCounts = getNumberMap(latestKey);
    const readCounts = getNumberMap(readKey);
    return computeUnreadState(cachedLatestCounts, readCounts);
  });

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!userId) {
      setState(EMPTY_STATE);
      return;
    }

    const readCounts = getNumberMap(readKey);

    try {
      const latestCounts = await fetchLatestCounts();
      setNumberMap(latestKey, latestCounts);
      setState(computeUnreadState(latestCounts, readCounts));
    } catch {
      const cachedLatestCounts = getNumberMap(latestKey);
      setState(computeUnreadState(cachedLatestCounts, readCounts));
    }
  }, [latestKey, readKey, userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userId) return;

    const timeout = setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [refresh, userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userId) return;

    const triggerRefresh = () => {
      void refresh();
    };

    const interval = setInterval(triggerRefresh, 15000);

    const handleRead = () => {
      triggerRefresh();
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key &&
        event.key !== readKey &&
        event.key !== latestKey
      ) {
        return;
      }
      triggerRefresh();
    };

    const handleVisibility = () => {
      if (!document.hidden) triggerRefresh();
    };

    window.addEventListener("chat-read", handleRead);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", triggerRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("chat-read", handleRead);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", triggerRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [latestKey, readKey, refresh, userId]);

  return {
    unreadMap: state.unreadMap,
    unreadCountMap: state.unreadCountMap,
    totalUnread: state.totalUnread,
    refresh,
  };
}
