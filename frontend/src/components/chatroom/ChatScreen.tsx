"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/hooks/useSocket";
import { usePermissions } from "@/hooks/usePermissions";
import {
  ChatChannel,
  ChatMessage,
  ChatParticipant,
  getChannels,
  getOrCreateCommunityChannel,
  getChannelMessages,
  getChannelByActivity,
  getChannelParticipants,
} from "@/lib/api-chat";
import { Hash, Send, ArrowLeft, MessageCircle, Building2, Store } from "lucide-react";
import { useUnreadCounts, markChannelRead } from "../../hooks/useUnreadCounts";
import ChatManagementModal from "./ChatManagementModal";

function ChatScreenSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100dvh-94px)] lg:h-[100dvh] min-h-0">
      <div className="relative px-4 py-3 border-b border-slate-200 bg-white">
        <div className="h-6 w-44 mx-auto rounded bg-slate-200 animate-pulse" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-white p-3">
        <div className="h-3 w-20 rounded bg-slate-200 animate-pulse mb-3" />
        <div className="space-y-2 mb-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`community-${index}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100"
            >
              <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="h-3 w-24 rounded bg-slate-200 animate-pulse mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`thread-${index}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100"
            >
              <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-40 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageSkeletonList() {
  return (
    <div className="flex min-h-full flex-col justify-end gap-3">
      {Array.from({ length: 6 }).map((_, index) => {
        const isOwn = index % 2 === 1;

        return (
          <div
            key={index}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 animate-pulse ${
                isOwn
                  ? "bg-orange-200"
                  : "bg-white border border-slate-200"
              }`}
            >
              {!isOwn && (
                <div className="h-3 w-24 bg-orange-200 rounded mb-2" />
              )}
              <div
                className={`h-3 rounded mb-2 ${
                  isOwn ? "bg-orange-300" : "bg-slate-200"
                } ${index % 3 === 0 ? "w-40" : "w-28"}`}
              />
              <div
                className={`h-2 rounded ${isOwn ? "bg-orange-300" : "bg-slate-200"} w-14`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const searchParams = useSearchParams();
  const threadParam = searchParams.get("thread");

  const isAdmin = hasPermission("manage_chat_members");

  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesCountRef = useRef(0);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const { unreadMap, refresh: refreshUnread } = useUnreadCounts();
  const activeChannelId = activeChannel?.id;

  useEffect(() => {
    messagesCountRef.current = messages.length;
    messageIdsRef.current = new Set(messages.map((message) => message.id));
  }, [messages]);

  const handleNewMessage = useCallback(
    (msg: ChatMessage) => {
      if (!msg.channelId) return;

      if (msg.channelId !== activeChannelId) {
        void refreshUnread();
        return;
      }

      const alreadySeen = messageIdsRef.current.has(msg.id);
      const nextMessageCount = alreadySeen
        ? messagesCountRef.current
        : messagesCountRef.current + 1;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      markChannelRead(msg.channelId, nextMessageCount, user?.id);

      void refreshUnread();
    },
    [activeChannelId, refreshUnread, user?.id],
  );

  const { joinChannel, sendMessage } = useSocket(handleNewMessage);

  useEffect(() => {
    async function load() {
      try {
        await getOrCreateCommunityChannel();
        const allChannels = await getChannels();
        setChannels(allChannels);

        if (threadParam) {
          try {
            const taskChannel = await getChannelByActivity(threadParam);
            setActiveChannel(taskChannel);
            setShowSidebar(false);
          } catch {
            const community = allChannels.find((c) => c.type === "community");
            if (community) setActiveChannel(community);
          }
        } else {
          const community = allChannels.find((c) => c.type === "community");
          if (community) setActiveChannel(community);
        }
      } catch (error) {
        console.error("Failed to load channels:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [threadParam]);

  useEffect(() => {
    if (!activeChannel) return;

    const channelId = activeChannel.id;
    let cancelled = false;

    async function loadMessages() {
      setMessagesLoading(true);
      setMessages([]);

      try {
        const msgs = await getChannelMessages(channelId);
        if (cancelled) return;

        setMessages(msgs);
        joinChannel(channelId);
        markChannelRead(channelId, msgs.length, user?.id);
        void refreshUnread();
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load messages:", error);
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeChannel, joinChannel, refreshUnread, user?.id]);

  useEffect(() => {
    if (!activeChannel) return;

    const channelId = activeChannel.id;
    let cancelled = false;

    async function loadParticipants() {
      try {
        const people = await getChannelParticipants(channelId);
        if (!cancelled) {
          setParticipants(people);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load participants:", error);
          setParticipants([]);
        }
      }
    }

    loadParticipants();

    return () => {
      cancelled = true;
    };
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || !activeChannel) return;
    sendMessage(activeChannel.id, input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function selectChannel(channel: ChatChannel) {
    setActiveChannel(channel);
    setShowSidebar(false);
  }

  if (loading) {
    return <ChatScreenSkeleton />;
  }

  const communityChannels = channels.filter((c) => c.type === "community");
  const taskChannels = channels.filter((c) => c.type === "task");
  const distroChannels = channels.filter((c) => c.type === "distribution_center");
  const supplierChannels = channels.filter((c) => c.type === "supplier");

  return (
    <div className="flex flex-col h-[calc(100dvh-94px)] lg:h-[100dvh] min-h-0">
      <div className="relative flex items-center justify-center px-4 py-3 border-b border-slate-200 bg-white">
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="md:hidden absolute left-4 inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Back to channels"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
        {activeChannel ? (
          <button
            type="button"
            onClick={() => setShowManagement(true)}
            className="text-xl font-bold text-slate-800 text-center truncate max-w-[70%] hover:text-orange-600 transition-colors"
            title={isAdmin ? "Manage members" : "Chat info"}
          >
            {activeChannel.name}
          </button>
        ) : (
          <h1 className="text-xl font-bold text-slate-800 text-center truncate max-w-[70%]">
            Chat
          </h1>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div
          className={`${showSidebar ? "w-full" : "hidden"} md:block md:w-64 md:border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0`}
        >
          <div className="p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Channels
            </p>
            {communityChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => selectChannel(ch)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm ${
                  activeChannel?.id === ch.id
                    ? "bg-orange-100 text-orange-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Hash className="h-4 w-4" />
                <span className="flex-1">{ch.name}</span>
                {unreadMap[ch.id] && activeChannel?.id !== ch.id && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    !
                  </span>
                )}
              </button>
            ))}
          </div>

          {taskChannels.length > 0 && (
            <div className="p-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Order Threads
              </p>
              {taskChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => selectChannel(ch)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm ${
                    activeChannel?.id === ch.id
                      ? "bg-orange-100 text-orange-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="flex-1">{ch.name}</span>
                  {unreadMap[ch.id] && activeChannel?.id !== ch.id && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      !
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {distroChannels.length > 0 && (
            <div className="p-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Distribution Centers
              </p>
              {distroChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => selectChannel(ch)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm ${
                    activeChannel?.id === ch.id
                      ? "bg-orange-100 text-orange-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1">{ch.name}</span>
                  {unreadMap[ch.id] && activeChannel?.id !== ch.id && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      !
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {supplierChannels.length > 0 && (
            <div className="p-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Suppliers
              </p>
              {supplierChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => selectChannel(ch)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm ${
                    activeChannel?.id === ch.id
                      ? "bg-orange-100 text-orange-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Store className="h-4 w-4" />
                  <span className="flex-1">{ch.name}</span>
                  {unreadMap[ch.id] && activeChannel?.id !== ch.id && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      !
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className={`flex-1 min-h-0 flex flex-col ${showSidebar ? "hidden md:flex" : "flex"}`}
        >
          {activeChannel ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {messagesLoading ? (
                  <MessageSkeletonList />
                ) : (
                  <div className="flex min-h-full flex-col justify-end gap-3">
                    {messages.length === 0 && (
                      <p className="text-center text-slate-400">
                        No messages yet. Start the conversation!
                      </p>
                    )}
                    {messages.map((msg) => {
                      const isOwn = msg.user.id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-orange-500 text-white"
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-semibold text-orange-600 mb-0.5">
                                {msg.user.firstname} {msg.user.lastname}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.body}
                            </p>
                            <p
                              className={`text-[10px] mt-1 ${isOwn ? "text-orange-200" : "text-slate-400"}`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={messagesLoading}
                    className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={messagesLoading || !input.trim()}
                    className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a channel to start chatting
            </div>
          )}
        </div>
      </div>

      <ChatManagementModal
        open={showManagement}
        onOpenChange={setShowManagement}
        channel={activeChannel}
        participants={participants}
        isAdmin={isAdmin}
        onParticipantAdded={async () => {
          if (activeChannel) {
            try {
              const updated = await getChannelParticipants(activeChannel.id);
              setParticipants(updated);
            } catch (error) {
              console.error("Failed to refresh participants:", error);
            }
          }
        }}
        onParticipantRemoved={async () => {
          if (activeChannel) {
            try {
              const updated = await getChannelParticipants(activeChannel.id);
              setParticipants(updated);
            } catch (error) {
              console.error("Failed to refresh participants:", error);
            }
          }
        }}
      />
    </div>
  );
}
