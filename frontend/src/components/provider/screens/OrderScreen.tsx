"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OrdersScreen({ user }: { user: User }) {
  const [orders, setOrders] = useState([]); // TODO: fetch from backend

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4">
      <div className="flex justify-center mb-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Orders</h1>
          <div className="h-1 bg-slate-800 w-32 mx-auto"></div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        {orders.length === 0 ? (
          <div className="w-full max-w-sm text-center">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-slate-300 flex items-center justify-center bg-slate-50">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              No Orders Yet
            </h2>
            <p className="text-slate-600 mb-8">
              You haven&apos;t created any orders yet. Start by creating your first
              order!
            </p>

            <Link href="/provider/create-order" className="inline-block">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 text-lg rounded-lg">
                <span className="mr-2">+</span>
                Create Order
              </Button>
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
          </div>
        )}
      </div>
    </div>
  );
}