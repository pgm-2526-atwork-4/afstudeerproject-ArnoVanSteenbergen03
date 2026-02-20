"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface ProfileScreenProps {
  user: User;
}

export default function ProfileScreen({ user }: ProfileScreenProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Account</h1>
          <div className="h-1 bg-slate-800 w-32 mx-auto"></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 max-w-sm mx-auto w-full">
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-white">
            <div className="text-slate-400 text-4xl">✕</div>
          </div>
        </div>

        <Button
          variant="outline"
          className="mb-8 border-slate-800 text-slate-800 hover:bg-slate-100"
        >
          Change profile image
        </Button>

        <div className="w-full space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Name:
            </label>
            <input
              type="text"
              value={user.username?.split("")[0] || ""}
              readOnly
              className="w-full border-b-2 border-slate-800 bg-transparent py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Last name:
            </label>
            <input
              type="text"
              value=""
              readOnly
              className="w-full border-b-2 border-slate-800 bg-transparent py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Nickname:
            </label>
            <input
              type="text"
              value={user.username}
              readOnly
              className="w-full border-b-2 border-slate-800 bg-transparent py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              E-mail:
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full border-b-2 border-slate-800 bg-transparent py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Your distribution centrum:
            </label>
            <input
              type="text"
              value="Downtown Center"
              readOnly
              className="w-full border-2 border-slate-800 bg-white py-2 px-3 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Role:
            </label>
            <input
              type="text"
              value={user.roles?.join(", ") || ""}
              readOnly
              className="w-full border-2 border-slate-800 bg-white py-2 px-3 text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <Button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded"
        >
          {isLoading ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </div>
  );
}