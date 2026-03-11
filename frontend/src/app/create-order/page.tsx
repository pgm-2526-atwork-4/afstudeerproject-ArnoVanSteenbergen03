"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OrderTypeStep from "@/components/orders/CreateOrderSteps/OrderTypeStep";
import GoodsStep from "@/components/orders/CreateOrderSteps/GoodsStep";
import DeliveryStep from "@/components/orders/CreateOrderSteps/DeliveryStep";
import ProtectedPage from "@/components/ProtectedPage";
import { createOrder } from "@/lib/api-client";
import type { GoodsData, OrderFormData } from "@/types";

export default function CreateOrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    orderType: "single",
    goods: [],
    location: "",
    vehicleId: "",
    deliveryNotes: "",
    orderTime: new Date().toISOString(),
  });

  const steps = [
    { number: 1, title: "Goods Details" },
    { number: 2, title: "Delivery" },
  ];

  const handleSelectOrderType = (type: "single" | "repeated") => {
    setFormData((prev) => ({ ...prev, orderType: type }));
    setCurrentStep(1);
  };

  const handleGoodsNext = (goods: GoodsData[]) => {
    setFormData((prev) => ({ ...prev, goods }));
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else setCurrentStep(0);
  };

  const handleCancel = () => {
    router.push("/orders");
  };

  const handleSubmitOrder = async (
    location: string,
    vehicleId: string,
    deliveryNotes: string,
    orderTime: string,
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      await createOrder({
        location,
        vehicleId,
        orderTime,
        notes: deliveryNotes || undefined,
        orderType: formData.orderType,
        goods: formData.goods.map((item) => ({
          goodState: item.goodState,
          overDueDate: item.overDueDate,
          category: item.category,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          allergies: item.allergies || undefined,
          expirationDate: item.expirationDate || undefined,
          packageIncluded: item.packageIncluded,
          image: item.image || undefined,
        })),
      });

      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedPage requiredPermission="create_food_items">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Create new order
            </h1>
            <div className="h-1 bg-slate-800 w-40 mx-auto"></div>
          </div>
        </div>

        {currentStep > 0 && (
          <div className="max-w-2xl mx-auto w-full mb-8">
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? "bg-[#2D3E2D] text-white"
                        : "bg-slate-300 text-slate-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      currentStep >= step.number
                        ? "text-[#2D3E2D]"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        currentStep > step.number
                          ? "bg-[#2D3E2D]"
                          : "bg-slate-300"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto w-full flex-1">
          {currentStep === 0 && (
            <OrderTypeStep onSelectOrderType={handleSelectOrderType} />
          )}
          {currentStep === 1 && (
            <GoodsStep
              onNext={handleGoodsNext}
              onCancel={handleCancel}
              initialGoods={formData.goods}
            />
          )}
          {currentStep === 2 && (
            <DeliveryStep
              onBack={handleBack}
              onCancel={handleCancel}
              onSubmit={handleSubmitOrder}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
