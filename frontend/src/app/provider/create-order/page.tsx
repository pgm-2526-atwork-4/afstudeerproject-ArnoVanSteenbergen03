"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OrderTypeStep from "@/components/provider/screens/CreateOrderSteps/OrderTypeStep";
import FoodDetailsStep from "@/components/provider/screens/CreateOrderSteps/FoodDetailsStep";
import DeliveryStep from "@/components/provider/screens/CreateOrderSteps/DeliveryStep";
import ProviderNavigation from "@/components/provider/ProviderNavigation";

export default function CreateOrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { number: 1, title: "Food Details" },
    { number: 2, title: "Delivery" },
  ];

  const handleSelectOrderType = (type: "single" | "repeated") => {
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    router.push("/provider");
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
            <FoodDetailsStep onNext={handleNext} onCancel={handleCancel} />
          )}
          {currentStep === 2 && (
            <DeliveryStep onBack={handleBack} onCancel={handleCancel} />
          )}
        </div>
      </div>
      <ProviderNavigation />
    </>
  );
}

