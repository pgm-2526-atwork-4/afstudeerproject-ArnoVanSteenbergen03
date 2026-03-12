"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrderTypeStep from "@/components/orders/CreateOrderSteps/OrderTypeStep";
import RecurrenceStep from "@/components/orders/CreateOrderSteps/RecurrenceStep";
import GoodsStep from "@/components/orders/CreateOrderSteps/GoodsStep";
import DeliveryStep from "@/components/orders/CreateOrderSteps/DeliveryStep";
import ProtectedPage from "@/components/ProtectedPage";
import { createOrder, getProviderOrderById } from "@/lib/api-client";
import { CardSkeleton } from "@/components/ui/loading";
import type { GoodsData, OrderFormData } from "@/types";

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("from");

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(!!templateId);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    orderType: "single",
    goods: [],
    location: "",
    vehicleId: "",
    deliveryNotes: "",
    orderTime: new Date().toISOString(),
    selectedDates: [],
    recurrenceTime: "",
  });

  useEffect(() => {
    if (!templateId) return;

    const loadTemplate = async () => {
      try {
        const data = await getProviderOrderById(templateId);
        const templateGoods: GoodsData[] = (data.goods || []).map((g: Record<string, unknown>) => {
          const meta = (g.metadata || {}) as Record<string, unknown>;
          return {
            goodState: g.goodState || "fresh",
            overDueDate: g.overDueDate || false,
            category: g.category || "",
            name: g.name || "",
            quantity: Number(g.quantity) || 1,
            unit: g.unit || "items",
            allergies: meta.allergies || "",
            expirationDate: meta.expirationDate || "",
            packageIncluded: meta.packageIncluded || false,
            image: g.image || "",
          };
        });

        setFormData((prev) => ({
          ...prev,
          orderType: "repeated",
          goods: templateGoods,
          location: data.activity?.location || "",
          vehicleId: data.activity?.vehicleId || "",
          deliveryNotes: data.activity?.notes || "",
        }));
        setCurrentStep(1);
      } catch (err) {
        console.error("Failed to load template:", err);
        setError("Could not load the template order. Please try again.");
      } finally {
        setLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  const isRepeated = formData.orderType === "repeated";

  const steps = isRepeated
    ? [
        { number: 1, title: "Schedule" },
        { number: 2, title: "Goods Details" },
        { number: 3, title: "Delivery" },
      ]
    : [
        { number: 1, title: "Goods Details" },
        { number: 2, title: "Delivery" },
      ];

  const handleSelectOrderType = (type: "single" | "repeated") => {
    setFormData((prev) => ({ ...prev, orderType: type }));
    setCurrentStep(1);
  };

  const handleRecurrenceNext = (data: {
    selectedDates: string[];
    recurrenceTime: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleGoodsNext = (goods: GoodsData[]) => {
    setFormData((prev) => ({ ...prev, goods }));
    setCurrentStep(isRepeated ? 3 : 2);
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
        selectedDates: formData.selectedDates,
        recurrenceTime: formData.recurrenceTime || undefined,
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

  const goodsStepIndex = isRepeated ? 2 : 1;
  const deliveryStepIndex = isRepeated ? 3 : 2;

  return (
    <ProtectedPage requiredPermission="create_food_items">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              {templateId ? "Create from Template" : "Create new order"}
            </h1>
            <div className="h-1 bg-slate-800 w-40 mx-auto"></div>
          </div>
        </div>

        {loadingTemplate ? (
          <div className="max-w-2xl mx-auto w-full">
            <CardSkeleton count={3} />
          </div>
        ) : (
          <>
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

          {isRepeated && currentStep === 1 && (
            <RecurrenceStep
              onNext={handleRecurrenceNext}
              onBack={() => setCurrentStep(0)}
              initialDates={formData.selectedDates}
              initialTime={formData.recurrenceTime}
            />
          )}

          {currentStep === goodsStepIndex && (
            <GoodsStep
              onNext={handleGoodsNext}
              onCancel={handleCancel}
              initialGoods={formData.goods}
              onBack={isRepeated ? handleBack : undefined}
            />
          )}

          {currentStep === deliveryStepIndex && (
            <DeliveryStep
              onBack={handleBack}
              onCancel={handleCancel}
              onSubmit={handleSubmitOrder}
              submitting={submitting}
              error={error}
              hideDateTime={isRepeated}
            />
          )}
        </div>
          </>
        )}
      </div>
    </ProtectedPage>
  );
}
