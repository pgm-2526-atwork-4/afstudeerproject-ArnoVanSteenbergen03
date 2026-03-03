"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import OrderTypeStep from "@/components/orders/CreateOrderSteps/OrderTypeStep";
import FoodDetailsStep from "@/components/orders/CreateOrderSteps/FoodDetailsStep";
import DeliveryStep from "@/components/orders/CreateOrderSteps/DeliveryStep";
import ProtectedPage from "@/components/ProtectedPage";
import { getProviderOrderById, updateOrder } from "@/lib/api-client";
import type { FoodItemData, OrderFormData } from "@/types";

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getProviderOrderById(orderId);

        if (response && response.activity) {
          const order = response.activity;
          const apiFoodItems = response.foodItems || [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const foodItems: FoodItemData[] = apiFoodItems.map((item: any) => ({
            itemName: item.itemName,
            allergies: item.allergies || "",
            servings: item.servings,
            expirationDate: item.expirationDate
              ? new Date(item.expirationDate).toISOString().split("T")[0]
              : "",
            freezerItemIncluded: item.freezerItemIncluded,
            packageIncluded: item.packageIncluded,
            image: item.image,
            notes: item.notes,
          }));

          const orderType = order.details?.orderType || "single";
          const foodNotes = order.details?.foodNotes || "";

          setFormData({
            orderType,
            foodItems,
            foodNotes,
            pickupAddress: order.pickupAddress || "",
            vehicleId: order.vehicleId || "",
            deliveryNotes: order.notes || "",
            pickupTime: order.pickupTime || new Date().toISOString(),
          });
          setCurrentStep(1);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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
    router.push("/orders");
  };

  const handleSubmitOrder = async (
    pickupAddress: string,
    vehicleId: string,
    deliveryNotes: string,
    pickupTime: string,
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      await updateOrder(orderId, {
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

      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedPage requiredPermission="update_food_items">
        <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 items-center justify-center">
          <p className="text-slate-600">Loading order...</p>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage requiredPermission="update_food_items">
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Edit order
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
              initialPickupAddress={formData.pickupAddress}
              initialVehicleId={formData.vehicleId}
              initialNotes={formData.deliveryNotes}
              initialPickupTime={formatDateForInput(formData.pickupTime)}
              isEditing={true}
            />
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
