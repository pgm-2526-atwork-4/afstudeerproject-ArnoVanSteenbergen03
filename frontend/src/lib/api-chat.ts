import { ChatChannel, ChatMessage } from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type { ChatChannel, ChatMessage };

export type ChatParticipant = {
  id: string;
  firstname: string;
  lastname: string;
  profileImage: string | null;
};

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
    throw new Error(error.error || "Failed to fetch channel");
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

// Get participants for a channel
export async function getChannelParticipants(
  channelId: string,
): Promise<ChatParticipant[]> {
  const response = await fetch(
    `${API_BASE_URL}/chat/channels/${channelId}/participants`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch participants");
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

// Send automated completion status message to supplier channel
export async function sendCompletionMessage(
  activityId: string,
  status: "completed" | "incomplete" | "need_assistance",
  data?: Record<string, unknown>,
): Promise<ChatMessage> {
  const response = await fetch(`${API_BASE_URL}/chat/send-completion-message`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      activityId,
      status,
      reason: data?.incompleteReason,
      assistanceOptions: data?.assistanceOptions,
      assistanceNotes: data?.assistanceNotes,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to send completion message");
  }

  return response.json();
}

// Get available users to add to a channel
export async function getAvailableChannelUsers(
  channelId: string,
): Promise<ChatParticipant[]> {
  const response = await fetch(
    `${API_BASE_URL}/chat/${channelId}/available-users`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch available users");
  }

  return response.json();
}

// Add a user to a channel
export async function addChannelParticipant(
  channelId: string,
  participantId: string,
): Promise<ChatMessage> {
  const response = await fetch(
    `${API_BASE_URL}/chat/${channelId}/add-participant`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to add participant");
  }

  return response.json();
}

// Remove a user from a channel
export async function removeChannelParticipant(
  channelId: string,
  participantId: string,
): Promise<ChatMessage> {
  const response = await fetch(
    `${API_BASE_URL}/chat/${channelId}/remove-participant`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to remove participant");
  }

  return response.json();
}
