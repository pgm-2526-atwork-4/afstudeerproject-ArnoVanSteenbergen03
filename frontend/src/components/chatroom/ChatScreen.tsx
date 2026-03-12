"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/hooks/useSocket";
import {
  ChatChannel,
  ChatMessage,
  getChannels,
  getOrCreateCommunityChannel,
  getChannelMessages,
  getChannelByActivity,
} from "@/lib/api-chat";
import { Hash, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { useUnreadCounts, markChannelRead } from "@/hooks/useUnreadCounts";

export default function ChatScreen() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const threadParam = searchParams.get("thread");

  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { unreadMap, refresh: refreshUnread } = useUnreadCounts();

  const handleNewMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Mark the channel as read
      if (msg.channelId) {
        markChannelRead(msg.channelId);
        refreshUnread();
      }
    },
    [refreshUnread],
  );

  const { joinChannel, sendMessage } = useSocket(handleNewMessage);

  // Load channels
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
            // Channel not found, default to community
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

    async function loadMessages() {
      const msgs = await getChannelMessages(activeChannel!.id);
      setMessages(msgs);
      joinChannel(activeChannel!.id);
      markChannelRead(activeChannel!.id);
      refreshUnread();
    }
    loadMessages();
  }, [activeChannel, joinChannel, refreshUnread]);

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
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading chat...</p>
      </div>
    );
  }

  const communityChannels = channels.filter((c) => c.type === "community");
  const taskChannels = channels.filter((c) => c.type === "task");

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
        )}
        <h1 className="text-xl font-bold text-slate-800">
          {activeChannel ? activeChannel.name : "Chat"}
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <div className="w-full md:w-64 md:border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0">
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
          </div>
        )}

        <div
          className={`flex-1 flex flex-col ${showSidebar ? "hidden md:flex" : "flex"}`}
        >
          {activeChannel ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-slate-400 mt-8">
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

              <div className="border-t border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
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
    </div>
  );
}
