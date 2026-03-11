"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import OrderTypeStep from "@/components/orders/CreateOrderSteps/OrderTypeStep";
import GoodsStep from "@/components/orders/CreateOrderSteps/GoodsStep";
import DeliveryStep from "@/components/orders/CreateOrderSteps/DeliveryStep";
import ProtectedPage from "@/components/ProtectedPage";
import { getProviderOrderById, updateOrder } from "@/lib/api-client";
import type { GoodsData, ApiGoodsItem, OrderFormData } from "@/types";

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
          const apiGoods = response.goods || [];

          const goods: GoodsData[] = apiGoods.map((item: ApiGoodsItem) => ({
            goodState: item.goodState || "fresh",
            overDueDate: item.overDueDate ?? false,
            category: item.category || "",
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || "items",
            allergies: item.allergies || "",
            expirationDate: item.expirationDate
              ? new Date(item.expirationDate).toISOString().split("T")[0]
              : "",
            packageIncluded: item.packageIncluded,
            image: item.image,
          }));

          const orderType = order.details?.orderType || "single";

          setFormData({
            orderType,
            goods,
            location: order.location || "",
            vehicleId: order.vehicleId || "",
            deliveryNotes: order.notes || "",
            orderTime: order.orderTime || new Date().toISOString(),
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
      await updateOrder(orderId, {
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
              initialLocation={formData.location}
              initialVehicleId={formData.vehicleId}
              initialNotes={formData.deliveryNotes}
              initialOrderTime={formatDateForInput(formData.orderTime)}
              isEditing={true}
            />
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
