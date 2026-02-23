"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema } from "@shared/schemas/auth";
import { z } from "zod/v4";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 min-h-[500px]">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="px-4 py-4 bg-white border-2 border-slate-400 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-orange-600 text-slate-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700 font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="px-4 py-4 bg-white border-2 border-slate-400 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-orange-600 text-slate-800"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 h-auto w-auto p-0"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1" />

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl border-2 border-orange-800 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Log In"}
      </Button>
    </form>
  );
}
