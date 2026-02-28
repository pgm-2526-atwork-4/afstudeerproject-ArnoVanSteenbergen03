"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { useState } from "react";

interface FoodItem {
  id: string;
  itemName: string;
  servings: string;
  expirationDate: string;
  freezerItem: boolean;
  packageIncluded: boolean;
  image?: string;
}

interface FoodDetailsStepProps {
  onNext: () => void;
  onCancel: () => void;
}

export default function FoodDetailsStep({ onNext, onCancel }: FoodDetailsStepProps) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    {
      id: "1",
      itemName: "",
      servings: "",
      expirationDate: "",
      freezerItem: false,
      packageIncluded: false,
    },
  ]);

  const [notes, setNotes] = useState("");

  const addFoodItem = () => {
    setFoodItems([
      ...foodItems,
      {
        id: String(Date.now()),
        itemName: "",
        servings: "",
        expirationDate: "",
        freezerItem: false,
        packageIncluded: false,
      },
    ]);
  };

  const removeFoodItem = (id: string) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((item) => item.id !== id));
    }
  };

  const updateFoodItem = (id: string, field: keyof FoodItem, value: string | boolean) => {
    setFoodItems(
      foodItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Food Items */}
      <div className="space-y-4">
        {foodItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border-2 border-slate-800 rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Food Item {index + 1}
              </h3>
              {foodItems.length > 1 && (
                <button
                  onClick={() => removeFoodItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Item Name
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., Chicken Soup"
                  value={item.itemName}
                  onChange={(e) =>
                    updateFoodItem(item.id, "itemName", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                />
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Servings
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 4"
                  value={item.servings}
                  onChange={(e) =>
                    updateFoodItem(item.id, "servings", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                />
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Expiration Date <span className="text-slate-500">(optional)</span>
                </Label>
                <Input
                  type="date"
                  value={item.expirationDate}
                  onChange={(e) =>
                    updateFoodItem(item.id, "expirationDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.freezerItem}
                    onChange={(e) =>
                      updateFoodItem(item.id, "freezerItem", e.target.checked)
                    }
                    className="w-4 h-4 border-2 border-slate-800 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Freezer items included
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.packageIncluded}
                    onChange={(e) =>
                      updateFoodItem(
                        item.id,
                        "packageIncluded",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 border-2 border-slate-800 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Packaging included
                  </span>
                </label>
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Upload Images <span className="text-slate-500">(optional)</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-slate-800 text-slate-800 py-2 rounded"
                >
                  ↓ Choose Images
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Another Food Item */}
      <button
        onClick={addFoodItem}
        className="w-full border-2 border-dashed border-slate-800 rounded-lg py-3 text-slate-800 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Another Food Item
      </button>

      {/* Extra Notes */}
      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Extra notes about the food
        </Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional information..."
          className="w-full px-3 py-2 border-2 border-slate-800 rounded resize-none min-h-[120px]"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="px-4 py-3"
        >
          Cancel Order
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
        >
          Continue to delivery
        </Button>
      </div>
    </div>
  );
}
