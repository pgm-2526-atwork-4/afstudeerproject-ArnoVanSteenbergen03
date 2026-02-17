import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50 p-4">
      {/* Back Button */}
      <Button
        asChild
        variant="outline"
        size="icon"
        className="mb-6 w-10 h-10 border-2 border-slate-300 rounded-lg hover:bg-gray-100"
      >
        <Link href="/">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
      </Button>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center px-4">
        <div className="w-full max-w-sm">
          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-8">
            Log in to your account
          </h1>

          {/* Form */}
          <LoginForm />

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Don&apos;t have an account?
            <Link href="/register" className="text-orange-600 font-semibold hover:underline ml-1">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}