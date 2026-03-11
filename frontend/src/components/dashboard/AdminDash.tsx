"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Building2, Users, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

// TODO: order dashboard with distro and open/in progress filters
// TODO: manage orders

interface AdminDashProps {
  user: User;
}

export default function AdminDash({ user }: AdminDashProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Admin</h1>
          <div className="h-1 bg-slate-800 w-40 mx-auto"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-8 space-y-4">
          <div>
            <Link href="/suppliers">
              <Button className="w-full bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-semibold py-3 rounded-lg flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  <span>Manage Suppliers</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div>
            <Link href="/distribution-centers">
              <Button className="w-full bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-semibold py-3 rounded-lg flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" />
                  <span>Manage Distribution Centers</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div>
            <Link href="/users">
              <Button className="w-full bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-semibold py-3 rounded-lg flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <span>Manage Users & Permissions</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
