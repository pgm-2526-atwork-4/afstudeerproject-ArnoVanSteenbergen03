import { ChatChannel, ChatMessage } from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type { ChatChannel, ChatMessage };

// Get all channels
export async function getChannels(): Promise<ChatChannel[]> {
  const response = await fetch(`${API_BASE_URL}/chat/channels`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch channels");
  }

  return response.json();
}

// Get or create the community channel
export async function getOrCreateCommunityChannel(): Promise<ChatChannel> {
  const response = await fetch(`${API_BASE_URL}/chat/channels/community`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to get community channel");
  }

  return response.json();
}

// Get channel by activity ID
export async function getChannelByActivity(
  activityId: string,
): Promise<ChatChannel> {
  const response = await fetch(
    `${API_BASE_URL}/chat/channels/activity/${activityId}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch task channel");
  }

  return response.json();
}

// Get messages for a channel
export async function getChannelMessages(
  channelId: string,
): Promise<ChatMessage[]> {
  const response = await fetch(
    `${API_BASE_URL}/chat/channels/${channelId}/messages`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch messages");
  }

  return response.json();
}

// Get latest message info per channel (for unread badges)
export async function getChannelsLatest(): Promise<
  Record<string, { lastMessageAt: string; messageCount: number }>
> {
  const response = await fetch(`${API_BASE_URL}/chat/channels/latest`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch latest messages");
  }

  return response.json();
}
