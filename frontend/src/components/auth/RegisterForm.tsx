"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

interface RegisterFormProps {
  role: string;
  onBack: () => void;
}

export function RegisterForm({ role, onBack }: RegisterFormProps) {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      await register(email, username, password, role);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50 p-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onBack}
        className="mb-6 w-10 h-10 border-2 border-slate-300 rounded-lg hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5 text-slate-700" />
      </Button>

      <div className="flex-1 flex flex-col items-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
            Registration
          </h1>
          <p className="text-center text-sm text-slate-600 mb-8 capitalize">
            {role} Account
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 min-h-[500px]"
          >
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-700 font-medium">
                First name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="px-4 py-4 bg-white border-2 border-slate-400 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-orange-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-700 font-medium">
                Last name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="px-4 py-4 bg-white border-2 border-slate-400 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-orange-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-4 bg-white border-2 border-slate-400 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-orange-600"
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="px-4 py-4 bg-white border-2 border-slate-400 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-orange-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-slate-700 font-medium"
              >
                Repeat password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="px-4 py-4 bg-white border-2 border-slate-400 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-orange-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
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
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?
            <Link
              href="/login"
              className="text-orange-600 font-semibold hover:underline ml-1"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
