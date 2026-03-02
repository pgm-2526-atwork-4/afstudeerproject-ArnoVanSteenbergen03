"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import PermissionGate from "@/components/PermissionGate";
import { useAuth } from "@/lib/auth-context";
import {
  getApplications,
  getAllPermissions,
  approveApplication,
  denyApplication,
  type Permission,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
} from "lucide-react";

interface Application {
  id: string;
  userId: string;
  userType: string;
  status: "pending" | "approved" | "denied";
  denialReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [denyReasonInput, setDenyReasonInput] = useState<string>("");
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "denied"
  >("pending");

  const [approvingApp, setApprovingApp] = useState<Application | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<number>
  >(new Set());

  const fetchData = async () => {
    try {
      const [appsData, permsData] = await Promise.all([
        getApplications(),
        getAllPermissions(),
      ]);
      setApplications(appsData);
      setAllPermissions(permsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const permissionGrid = useMemo(() => {
    const resources = [...new Set(allPermissions.map((p) => p.resource))];
    const actions = ["create", "read", "update", "delete"];
    return { resources, actions };
  }, [allPermissions]);

  const getPermissionByResourceAction = (
    resource: string,
    action: string,
  ): Permission | undefined => {
    return allPermissions.find(
      (p) => p.resource === resource && p.action === action,
    );
  };

  if (!user) return null;

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  const pendingCount = applications.filter(
    (a) => a.status === "pending",
  ).length;

  const openApproveModal = (app: Application) => {
    setApprovingApp(app);
    setSelectedPermissionIds(new Set());
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const toggleResourceRow = (resource: string) => {
    const resourcePerms = allPermissions.filter(
      (p) => p.resource === resource,
    );
    const allSelected = resourcePerms.every((p) =>
      selectedPermissionIds.has(p.id),
    );
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      resourcePerms.forEach((p) => {
        if (allSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      });
      return next;
    });
  };

  const toggleAll = () => {
    const allSelected = allPermissions.every((p) =>
      selectedPermissionIds.has(p.id),
    );
    if (allSelected) {
      setSelectedPermissionIds(new Set());
    } else {
      setSelectedPermissionIds(new Set(allPermissions.map((p) => p.id)));
    }
  };

  const handleConfirmApprove = async () => {
    if (!approvingApp) return;
    setActionLoading(approvingApp.id);
    try {
      await approveApplication(
        approvingApp.id,
        Array.from(selectedPermissionIds),
      );
      setApprovingApp(null);
      setSelectedPermissionIds(new Set());
      await fetchData();
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (id: string) => {
    setActionLoading(id);
    try {
      await denyApplication(id, denyReasonInput || undefined);
      setDenyingId(null);
      setDenyReasonInput("");
      await fetchData();
    } catch (error) {
      console.error("Failed to deny:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "denied":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "denied":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "provider":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "volunteer":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const formatResource = (r: string) =>
    r
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <ProtectedPage requiredPermission="read_applications">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Link href="/users">
            <Button
              variant="ghost"
              className="p-0 h-auto hover:bg-transparent"
            >
              <ArrowLeft className="w-6 h-6 text-slate-800" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-800">Applications</h1>
            <div className="h-1 bg-slate-800 w-48 mx-auto mt-2"></div>
            {pendingCount > 0 && (
              <p className="text-sm text-amber-700 mt-2 font-medium">
                {pendingCount} pending application
                {pendingCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="w-6"></div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {(["pending", "all", "approved", "denied"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                className={
                  filter === f
                    ? "bg-slate-800 text-white"
                    : "border-slate-300 text-slate-700"
                }
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 inline-flex items-center justify-center px-1">
                    {pendingCount}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No {filter !== "all" ? filter : ""} applications found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border-2 border-slate-800 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-800 mb-1">
                        {app.firstname} {app.lastname}
                      </h2>
                      <p className="text-sm text-slate-500 mb-3">
                        @{app.username} &middot; {app.email}
                      </p>

                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUserTypeBadge(
                            app.userType,
                          )}`}
                        >
                          {app.userType}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusBadge(
                            app.status,
                          )}`}
                        >
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Applied{" "}
                        {new Date(app.createdAt).toLocaleDateString("nl-BE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      {app.status === "denied" && app.denialReason && (
                        <p className="mt-2 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
                          <span className="font-semibold">Reason:</span>{" "}
                          {app.denialReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {app.status === "pending" && (
                    <PermissionGate permission="update_applications">
                      <div className="border-t border-slate-200 pt-4 mt-2">
                        {denyingId === app.id ? (
                          <div className="space-y-3">
                            <textarea
                              className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
                              placeholder="Reason for denial (optional)..."
                              rows={2}
                              value={denyReasonInput}
                              onChange={(e) =>
                                setDenyReasonInput(e.target.value)
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                disabled={actionLoading === app.id}
                                onClick={() => handleDeny(app.id)}
                              >
                                {actionLoading === app.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <XCircle className="w-4 h-4 mr-2" />
                                )}
                                Confirm Deny
                              </Button>
                              <Button
                                variant="outline"
                                className="border-slate-300"
                                onClick={() => {
                                  setDenyingId(null);
                                  setDenyReasonInput("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === app.id}
                              onClick={() => openApproveModal(app)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                              disabled={actionLoading === app.id}
                              onClick={() => setDenyingId(app.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>
                    </PermissionGate>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {approvingApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border-2 border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Assign Permissions
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {approvingApp.firstname} {approvingApp.lastname} &middot;{" "}
                  <span className="capitalize">{approvingApp.userType}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                className="p-1 h-auto"
                onClick={() => {
                  setApprovingApp(null);
                  setSelectedPermissionIds(new Set());
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left p-3 font-semibold text-slate-700 border border-slate-300 min-w-[140px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded accent-slate-800"
                            checked={
                              allPermissions.length > 0 &&
                              allPermissions.every((p) =>
                                selectedPermissionIds.has(p.id),
                              )
                            }
                            onChange={toggleAll}
                          />
                          Resource
                        </label>
                      </th>
                      {permissionGrid.actions.map((action) => (
                        <th
                          key={action}
                          className="text-center p-3 font-semibold text-slate-700 border border-slate-300 capitalize w-24"
                        >
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionGrid.resources.map((resource) => {
                      const resourcePerms = allPermissions.filter(
                        (p) => p.resource === resource,
                      );
                      const allRowSelected = resourcePerms.every((p) =>
                        selectedPermissionIds.has(p.id),
                      );

                      return (
                        <tr
                          key={resource}
                          className="hover:bg-amber-50 transition-colors"
                        >
                          <td className="p-3 border border-slate-300 font-medium text-slate-800">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded accent-slate-800"
                                checked={allRowSelected}
                                onChange={() => toggleResourceRow(resource)}
                              />
                              {formatResource(resource)}
                            </label>
                          </td>
                          {permissionGrid.actions.map((action) => {
                            const perm = getPermissionByResourceAction(
                              resource,
                              action,
                            );
                            return (
                              <td
                                key={action}
                                className="text-center p-3 border border-slate-300"
                              >
                                {perm ? (
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded accent-green-600 cursor-pointer"
                                    checked={selectedPermissionIds.has(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                  />
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-400 mt-3">
                {selectedPermissionIds.size} of {allPermissions.length}{" "}
                permissions selected
              </p>
            </div>

            <div className="border-t border-slate-200 p-6 flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                disabled={actionLoading === approvingApp.id}
                onClick={handleConfirmApprove}
              >
                {actionLoading === approvingApp.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Approve with {selectedPermissionIds.size} permission
                {selectedPermissionIds.size !== 1 ? "s" : ""}
              </Button>
              <Button
                variant="outline"
                className="border-slate-300"
                onClick={() => {
                  setApprovingApp(null);
                  setSelectedPermissionIds(new Set());
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedPage>
  );
}
