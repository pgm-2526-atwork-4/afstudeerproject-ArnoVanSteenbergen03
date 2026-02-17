import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <main className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-28 h-28 bg-slate-700 rounded-full flex items-center justify-center mb-8">
          <Image
            src="/images/logo.jpg"
            alt="Logo"
            width={112}
            height={112}
            className="rounded-full"
          />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">Welcome to Pick Up & Give!</h1>

        <Card className="w-full max-w-sm mb-8 border-2 border-slate-300 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg font-semibold">
              Project Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm italic">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </CardContent>
        </Card>

        <div className="w-full max-w-sm flex flex-col gap-3 mt-auto mb-8">
          <Button
            asChild
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl border-2 border-orange-800"
          >
            <Link href="/login">Login</Link>
          </Button>

          <Button
            asChild
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl border-2 border-orange-800"
          >
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
