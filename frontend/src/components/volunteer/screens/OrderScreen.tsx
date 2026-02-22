"use client";

import { Button } from "@/components/ui/button";
import { Truck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { User } from "@/types/Auth";

interface OrderScreenProps {
  user: User;
}

export default function NoDeliveriesScreen({ user }: OrderScreenProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Available Deliveries</h1>
          <div className="h-1 bg-slate-800 w-64 mx-auto"></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="mb-8">
          <Truck className="w-24 h-24 text-slate-400 mx-auto" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">No Available Deliveries</h2>
        <p className="text-slate-600 text-center mb-8 max-w-sm">
          There are no available deliveries at the moment. Check back soon or refresh to see new orders.
        </p>

        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5" />
          Refresh
        </Button>

        <Link href="/volunteer/deliveries">
          <Button variant="outline" className="border-slate-800 text-slate-800 hover:bg-slate-100 font-bold py-3 px-8 rounded">
            View My Deliveries
          </Button>
        </Link>
      </div>
    </div>
  );
}