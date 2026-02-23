"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateProfile } from "@/lib/api-client";
import { updateProfileSchema } from "@shared/schemas/profile";
import { z } from "zod/v4";

interface ProfileScreenProps {
  user: User;
}

export default function ProfileScreen({ user }: ProfileScreenProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    username: user.username,
    email: user.email,
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    setErrors({});
    try {
      setIsLoading(true);
      const validated = updateProfileSchema.parse({
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        email: formData.email,
      });
      await updateProfile(validated, "volunteer");
      setIsEditing(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({ general: error instanceof Error ? error.message : "Save failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      username: user.username,
      email: user.email,
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Account</h1>
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
          disabled={isEditing}
        >
          Change profile image
        </Button>

        <div className="w-full space-y-6">
          {errors.general && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label className="block text-sm font-semibold text-slate-800 mb-2">
              Name:
            </Label>
            <Input
              type="text"
              value={formData.firstname}
              onChange={(e) => handleInputChange("firstname", e.target.value)}
              readOnly={!isEditing}
              className={`w-full py-2 text-slate-800 transition-all rounded ${
                isEditing
                  ? `bg-white px-3 border-2 ${errors.firstname ? "border-red-500" : "border-slate-800"} focus-visible:border-blue-600 focus-visible:ring-0`
                  : "bg-transparent border-b-2 border-slate-800 focus-visible:ring-0 focus-visible:border-slate-800 cursor-default"
              }`}
            />
            {errors.firstname && (
              <span className="text-red-500 text-sm mt-1">{errors.firstname}</span>
            )}
          </div>

          <div>
            <Label className="block text-sm font-semibold text-slate-800 mb-2">
              Last name:
            </Label>
            <Input
              type="text"
              value={formData.lastname}
              onChange={(e) => handleInputChange("lastname", e.target.value)}
              readOnly={!isEditing}
              className={`w-full py-2 text-slate-800 transition-all rounded ${
                isEditing
                  ? `bg-white px-3 border-2 ${errors.lastname ? "border-red-500" : "border-slate-800"} focus-visible:border-blue-600 focus-visible:ring-0`
                  : "bg-transparent border-b-2 border-slate-800 focus-visible:ring-0 focus-visible:border-slate-800 cursor-default"
              }`}
            />
            {errors.lastname && (
              <span className="text-red-500 text-sm mt-1">{errors.lastname}</span>
            )}
          </div>

          <div>
            <Label className="block text-sm font-semibold text-slate-800 mb-2">
              Nickname:
            </Label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              readOnly={!isEditing}
              className={`w-full py-2 text-slate-800 transition-all rounded ${
                isEditing
                  ? `bg-white px-3 border-2 ${errors.username ? "border-red-500" : "border-slate-800"} focus-visible:border-slate-600 focus-visible:ring-0`
                  : "bg-transparent border-b-2 border-slate-800 focus-visible:ring-0 focus-visible:border-slate-800 cursor-default"
              }`}
            />
            {errors.username && (
              <span className="text-red-500 text-sm mt-1">{errors.username}</span>
            )}
          </div>

          <div>
            <Label className="block text-sm font-semibold text-slate-800 mb-2">
              E-mail:
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              readOnly={!isEditing}
              className={`w-full py-2 text-slate-800 transition-all rounded ${
                isEditing
                  ? `bg-white px-3 border-2 ${errors.email ? "border-red-500" : "border-slate-800"} focus-visible:border-slate-600 focus-visible:ring-0`
                  : "bg-transparent border-b-2 border-slate-800 focus-visible:ring-0 focus-visible:border-slate-800 cursor-default"
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1">{errors.email}</span>
            )}
          </div>

          <div>
            <Label className="block text-sm font-semibold text-slate-800 mb-2">
              Role:
            </Label>
            <p className="py-2 text-slate-800 capitalize">
              {user.roles?.join(", ") || ""}
            </p>
          </div>
        </div>

        <div className="w-full mt-8 space-y-3">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isLoading}
                variant="outline"
                className="w-full border-slate-800 text-slate-800 hover:bg-slate-100 font-bold py-3"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded"
            >
              Edit Profile
            </Button>
          )}
        </div>

        <Button
          onClick={handleLogout}
          disabled={isLoading || isEditing}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded"
        >
          {isLoading ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </div>
  );
}