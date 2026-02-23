"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/Footer";

interface RoleSelectionProps {
  onRoleSelect: (role: string) => void;
}

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const roles = [
    {
      id: "volunteer",
      name: "Volunteer",
      description: "Help us pick up orders from providers",
      image: "/images/volunteer.jpg",
    },
    {
      id: "provider",
      name: "Provider",
      description:
        "Got any leftovers? Or wanna help a good cause? Let us pick up any food you're willing to donate!",
      image: "/images/provider.jpg",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-amber-50 p-4">
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

      <div className="flex-1 flex flex-col items-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-8">
            Choose your role
          </h1>

          <div className="space-y-4">
            {roles.map((role) => (
              <Card
                key={role.id}
                className="border-2 border-slate-300 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onRoleSelect(role.id)}
              >
                <CardContent className="space-y-3 p-4">
                  <div className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden relative">
                    <Image
                      src={role.image}
                      alt={role.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <h2 className="text-xl font-semibold text-center text-slate-800">
                    {role.name}
                  </h2>

                  <p className="text-sm text-slate-600 text-center">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
