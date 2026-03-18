"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";

export default function PendingApprovalPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user?.isApproved) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-orange-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Awaiting Approval
            </h1>

            <p className="text-slate-600 leading-relaxed">
              Your account has been created and your application is being
              reviewed by an administrator. You&apos;ll be able to access the
              platform once your account is approved.
            </p>

            {user?.userType && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">Applied as</p>
                <p className="text-lg font-semibold text-slate-800 capitalize">
                  {user.userType}
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full h-12 border-2 border-slate-300 rounded-2xl text-slate-700 hover:bg-slate-100 font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
