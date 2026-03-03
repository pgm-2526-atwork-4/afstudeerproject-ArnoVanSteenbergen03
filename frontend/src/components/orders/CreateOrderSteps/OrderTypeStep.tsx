"use client";

import { Card, CardContent } from "@/components/ui/card";

interface OrderTypeStepProps {
  onSelectOrderType: (type: "single" | "repeated") => void;
}

export default function OrderTypeStep({
  onSelectOrderType,
}: OrderTypeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          What type of order would you like to create?
        </h2>
        <p className="text-slate-600">
          Choose whether this is a one-time delivery or a recurring order
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-slate-800 rounded-lg"
          onClick={() => onSelectOrderType("single")}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Single Order
              </h3>
              <p className="text-slate-600 text-sm">
                One-time delivery of food items to a distribution center
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-slate-800 rounded-lg"
          onClick={() => onSelectOrderType("repeated")}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Repeated Order
              </h3>
              <p className="text-slate-600 text-sm">
                Schedule recurring deliveries on a regular basis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
