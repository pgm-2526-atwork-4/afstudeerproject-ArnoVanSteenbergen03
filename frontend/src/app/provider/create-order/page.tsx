"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OrderTypeStep from "@/components/provider/screens/CreateOrderSteps/OrderTypeStep";
import FoodDetailsStep from "@/components/provider/screens/CreateOrderSteps/FoodDetailsStep";
import DeliveryStep from "@/components/provider/screens/CreateOrderSteps/DeliveryStep";
import ProviderNavigation from "@/components/provider/ProviderNavigation";
import { createOrder } from "@/lib/api-client";

export interface FoodItemData {
  itemName: string;
  allergies: string;
  servings: number;
  expirationDate?: string;
  freezerItemIncluded: boolean;
  packageIncluded: boolean;
  image?: string;
  notes?: string;
}

export interface OrderFormData {
  orderType: "single" | "repeated";
  foodItems: FoodItemData[];
  foodNotes: string;
  pickupAddress: string;
  vehicleId: string;
  deliveryNotes: string;
  pickupTime: string;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    orderType: "single",
    foodItems: [],
    foodNotes: "",
    pickupAddress: "",
    vehicleId: "",
    deliveryNotes: "",
    pickupTime: new Date().toISOString(),
  });

  const steps = [
    { number: 1, title: "Food Details" },
    { number: 2, title: "Delivery" },
  ];

  const handleSelectOrderType = (type: "single" | "repeated") => {
    setFormData((prev) => ({ ...prev, orderType: type }));
    setCurrentStep(1);
  };

  const handleFoodDetailsNext = (foodItems: FoodItemData[], notes: string) => {
    setFormData((prev) => ({ ...prev, foodItems, foodNotes: notes }));
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else setCurrentStep(0);
  };

  const handleCancel = () => {
    router.push("/provider");
  };

  const handleSubmitOrder = async (
    pickupAddress: string,
    vehicleId: string,
    deliveryNotes: string,
    pickupTime: string
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      await createOrder({
        pickupAddress,
        vehicleId,
        pickupTime,
        notes: deliveryNotes || formData.foodNotes || undefined,
        orderType: formData.orderType,
        foodItems: formData.foodItems.map((item) => ({
          itemName: item.itemName,
          allergies: item.allergies || "",
          servings: item.servings,
          expirationDate: item.expirationDate || undefined,
          freezerItemIncluded: item.freezerItemIncluded,
          packageIncluded: item.packageIncluded,
          image: item.image || undefined,
          notes: item.notes || undefined,
        })),
      });

      router.push("/provider");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Create new order
            </h1>
            <div className="h-1 bg-slate-800 w-40 mx-auto"></div>
          </div>
        </div>

        {/* Step Indicator - Only show after type selection */}
        {currentStep > 0 && (
          <div className="max-w-2xl mx-auto w-full mb-8">
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? "bg-slate-800 text-white"
                        : "bg-slate-300 text-slate-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      currentStep >= step.number
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        currentStep > step.number
                          ? "bg-slate-800"
                          : "bg-slate-300"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-2xl mx-auto w-full flex-1">
          {currentStep === 0 && (
            <OrderTypeStep onSelectOrderType={handleSelectOrderType} />
          )}
          {currentStep === 1 && (
            <FoodDetailsStep
              onNext={handleFoodDetailsNext}
              onCancel={handleCancel}
              initialFoodItems={formData.foodItems}
              initialNotes={formData.foodNotes}
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
      <ProviderNavigation />
    </>
  );
}