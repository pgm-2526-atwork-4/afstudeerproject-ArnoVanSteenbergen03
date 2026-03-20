"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChatChannel } from "@shared/index";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { X, Plus, Trash2, User, Search } from "lucide-react";
import {
  ChatParticipant,
  getAvailableChannelUsers,
  addChannelParticipant,
  removeChannelParticipant,
} from "@/lib/api-chat";

interface ChatManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: ChatChannel | null;
  participants: ChatParticipant[];
  isAdmin: boolean;
  onParticipantAdded?: () => void;
  onParticipantRemoved?: () => void;
}

export default function ChatManagementModal({
  open,
  onOpenChange,
  channel,
  participants,
  isAdmin,
  onParticipantAdded,
  onParticipantRemoved,
}: ChatManagementModalProps) {
  const [availableUsers, setAvailableUsers] = useState<ChatParticipant[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const USERS_PER_PAGE = 10;

  const filteredUsers = availableUsers.filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadAvailableUsers = useCallback(async () => {
    if (!channel) return;
    setLoadingUsers(true);
    try {
      const users = await getAvailableChannelUsers(channel.id);
      setAvailableUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, [channel]);

  useEffect(() => {
    if (open && isAdmin && channel) {
      loadAvailableUsers();
    }
  }, [open, isAdmin, channel, loadAvailableUsers]);

  const handleAddParticipant = async (participantId: string) => {
    if (!channel) return;
    setLoadingAction(participantId);
    try {
      await addChannelParticipant(channel.id, participantId);
      setAvailableUsers(availableUsers.filter((u) => u.id !== participantId));
      onParticipantAdded?.();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add participant");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!channel) return;
    setLoadingAction(participantId);
    try {
      await removeChannelParticipant(channel.id, participantId);
      onParticipantRemoved?.();
      setError(null);
      setDeleteConfirm(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove participant",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="w-full max-w-2xl rounded-xl border-2 border-[#2D3E2D] bg-white shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-[#2D3E2D] px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">
                {isAdmin ? "Manage Chat Members" : "Chat Info"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  setShowAddForm(false);
                  setError(null);
                }}
                className="text-slate-600 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-6">
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  Channel
                </p>
                <p className="text-base font-semibold text-slate-800">
                  {channel?.name}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-3">
                  Current Members ({participants.length})
                </p>
                <div className="space-y-2">
                  {participants.length > 0 ? (
                    participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#2D3E2D] hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          {participant.profileImage ? (
                            <Image
                              src={participant.profileImage}
                              alt={participant.firstname}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {participant.firstname} {participant.lastname}
                            </p>
                            <p className="text-xs text-slate-500">
                              {participant.id ===
                              (typeof window !== "undefined"
                                ? localStorage.getItem("userId")
                                : null)
                                ? "You"
                                : ""}
                            </p>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                userId: participant.id,
                                userName: `${participant.firstname} ${participant.lastname}`,
                              })
                            }
                            disabled={
                              loadingAction === participant.id ||
                              participant.id ===
                                (typeof window !== "undefined"
                                  ? localStorage.getItem("userId")
                                  : null)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove from chat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No members yet</p>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                      Add Members
                    </p>
                    {!showAddForm && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    )}
                  </div>

                  {showAddForm && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-[#2D3E2D]">
                      {loadingUsers ? (
                        <p className="text-sm text-slate-600">
                          Loading users...
                        </p>
                      ) : availableUsers.length > 0 ? (
                        <>
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search users by name..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-[#2D3E2D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E2D] text-sm"
                            />
                          </div>

                          {filteredUsers.length > 0 ? (
                            <>
                              <div className="space-y-2">
                                {paginatedUsers.map((user) => (
                                  <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#2D3E2D]"
                                  >
                                    <div className="flex items-center gap-3">
                                      {user.profileImage ? (
                                        <Image
                                          src={user.profileImage}
                                          alt={user.firstname}
                                          width={32}
                                          height={32}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
                                          <User className="w-4 h-4 text-slate-600" />
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {user.firstname} {user.lastname}
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => handleAddParticipant(user.id)}
                                      disabled={loadingAction === user.id}
                                      className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                    >
                                      {loadingAction === user.id
                                        ? "Adding..."
                                        : "Add"}
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <Pagination
                                page={currentPage}
                                totalPages={totalPages}
                                total={filteredUsers.length}
                                pageSize={USERS_PER_PAGE}
                                onPageChange={setCurrentPage}
                                label="users"
                              />
                            </>
                          ) : (
                            <p className="text-sm text-slate-600 py-2">
                              No users matching &quot;{searchQuery}&quot;
                            </p>
                          )}

                          <button
                            onClick={() => {
                              setShowAddForm(false);
                              setSearchQuery("");
                              setCurrentPage(1);
                            }}
                            className="w-full py-2 text-sm text-slate-600 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-slate-600">
                            All users are already members of this chat.
                          </p>
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="w-full py-2 text-sm text-slate-600 hover:text-slate-900"
                          >
                            Close
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-[#2D3E2D] px-6 py-4 bg-slate-50">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setShowAddForm(false);
                  setError(null);
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>

          {deleteConfirm && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="w-full max-w-sm rounded-xl border-2 border-[#2D3E2D] bg-white shadow-xl">
                <div className="border-b border-[#2D3E2D] px-6 py-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    Remove Member
                  </h3>
                </div>

                <div className="px-6 py-4">
                  <p className="text-slate-700">
                    Are you sure you want to remove{" "}
                    <span className="font-semibold">{deleteConfirm.userName}</span>{" "}
                    from this chat?
                  </p>
                </div>

                <div className="flex gap-3 border-t border-[#2D3E2D] px-6 py-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={loadingAction === deleteConfirm.userId}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleRemoveParticipant(deleteConfirm.userId)
                    }
                    disabled={loadingAction === deleteConfirm.userId}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingAction === deleteConfirm.userId
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
