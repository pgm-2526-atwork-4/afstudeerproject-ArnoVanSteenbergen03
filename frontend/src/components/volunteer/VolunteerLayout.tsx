import { User } from "@/types";

export default function VolunteerLayout({ user }: { user: User }) {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50 p-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Hello, {user.username}! 👋
        </h1>
        <p className="text-2xl font-semibold text-orange-600 mb-8">
          Welcome Volunteer
        </p>
        <p className="text-center text-slate-600 max-w-md">
          Ready to help pick up food orders from providers? Let&apos;s make a
          difference together!
        </p>
      </div>
    </div>
  );
}