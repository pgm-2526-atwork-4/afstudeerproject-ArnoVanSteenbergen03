"use client";

import ProviderNavigation from "@/components/provider/ProviderNavigation";
import { useRequireRole } from "@/hooks/useRequireRole";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, authorized } = useRequireRole("provider");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <div className="flex-1 overflow-y-auto pb-24">
        {children}
      </div>
      <ProviderNavigation />
    </div>
  );
}