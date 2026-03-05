"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import type { GoodsData } from "@/types";

interface GoodsItem {
  id: string;
  goodType: "food" | "clothing" | "household" | "equipment";
  category: string;
  name: string;
  quantity: string;
  unit: "kg" | "items" | "boxes" | "pallets" | "liters";
  allergies: string;
  expirationDate: string;
  packageIncluded: boolean;
  image?: string;
}

interface GoodsStepProps {
  onNext: (goods: GoodsData[], notes: string) => void;
  onCancel: () => void;
  initialGoods?: GoodsData[];
  initialNotes?: string;
}

const GOOD_TYPES = [
  { value: "food", label: "Food" },
  { value: "clothing", label: "Clothing" },
  { value: "household", label: "Household" },
  { value: "equipment", label: "Equipment" },
] as const;

const UNITS = [
  { value: "items", label: "Items" },
  { value: "kg", label: "Kg" },
  { value: "boxes", label: "Boxes" },
  { value: "pallets", label: "Pallets" },
  { value: "liters", label: "Liters" },
] as const;

export default function GoodsStep({
  onNext,
  onCancel,
  initialGoods,
  initialNotes,
}: GoodsStepProps) {
  const [goodsItems, setGoodsItems] = useState<GoodsItem[]>(
    initialGoods && initialGoods.length > 0
      ? initialGoods.map((item, i) => ({
          id: String(i + 1),
          goodType: item.goodType ?? "food",
          category: item.category,
          name: item.name,
          quantity: String(item.quantity),
          unit: item.unit ?? "items",
          allergies: item.allergies || "",
          expirationDate: item.expirationDate || "",
          packageIncluded: item.packageIncluded,
          image: item.image,
        }))
      : [createEmptyItem("1")]
  );

  const [notes, setNotes] = useState(initialNotes || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  function createEmptyItem(id: string): GoodsItem {
    return {
      id,
      goodType: "food",
      category: "",
      name: "",
      quantity: "",
      unit: "items",
      allergies: "",
      expirationDate: "",
      packageIncluded: false,
    };
  }

  const addGoodsItem = () => {
    setGoodsItems([...goodsItems, createEmptyItem(String(Date.now()))]);
  };

  const removeGoodsItem = (id: string) => {
    if (goodsItems.length > 1) {
      setGoodsItems(goodsItems.filter((item) => item.id !== id));
    }
  };

  const updateGoodsItem = (id: string, field: keyof GoodsItem, value: string | boolean) => {
    setGoodsItems(
      goodsItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {goodsItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border-2 border-slate-800 rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Item {index + 1}
              </h3>
              {goodsItems.length > 1 && (
                <button
                  onClick={() => removeGoodsItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-semibold text-slate-800 mb-2">
                    Type
                  </Label>
                  <select
                    value={item.goodType}
                    onChange={(e) =>
                      updateGoodsItem(item.id, "goodType", e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-slate-800 rounded bg-white"
                  >
                    {GOOD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block text-sm font-semibold text-slate-800 mb-2">
                    Category
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g., Canned Goods, Winter Coats"
                    value={item.category}
                    onChange={(e) =>
                      updateGoodsItem(item.id, "category", e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                  />
                </div>
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Item Name
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., Chicken Soup, Winter Jacket"
                  value={item.name}
                  onChange={(e) =>
                    updateGoodsItem(item.id, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-semibold text-slate-800 mb-2">
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={item.quantity}
                    onChange={(e) =>
                      updateGoodsItem(item.id, "quantity", e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-semibold text-slate-800 mb-2">
                    Unit
                  </Label>
                  <select
                    value={item.unit}
                    onChange={(e) =>
                      updateGoodsItem(item.id, "unit", e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-slate-800 rounded bg-white"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {item.goodType === "food" && (
                <>
                  <div>
                    <Label className="block text-sm font-semibold text-slate-800 mb-2">
                      Allergies <span className="text-slate-500">(optional)</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., Peanuts, Dairy"
                      value={item.allergies}
                      onChange={(e) =>
                        updateGoodsItem(item.id, "allergies", e.target.value)
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
                        updateGoodsItem(item.id, "expirationDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.packageIncluded}
                    onChange={(e) =>
                      updateGoodsItem(
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

      <button
        onClick={addGoodsItem}
        className="w-full border-2 border-dashed border-slate-800 rounded-lg py-3 text-slate-800 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Another Item
      </button>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Extra notes about the goods
        </Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional information..."
          className="w-full px-3 py-2 border-2 border-slate-800 rounded resize-none min-h-[120px]"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="px-4 py-3"
        >
          Cancel Order
        </Button>
        <Button
          onClick={() => {
            const hasEmptyItems = goodsItems.some(
              (item) => !item.name.trim() || !item.quantity || !item.category.trim()
            );
            if (hasEmptyItems) {
              setValidationError("Please fill in name, category, and quantity for all items.");
              return;
            }
            setValidationError(null);

            const itemsData: GoodsData[] = goodsItems.map((item) => ({
              goodType: item.goodType,
              category: item.category,
              name: item.name,
              quantity: parseFloat(item.quantity),
              unit: item.unit,
              allergies: item.allergies || undefined,
              expirationDate: item.expirationDate || undefined,
              packageIncluded: item.packageIncluded,
              image: item.image || undefined,
            }));

            onNext(itemsData, notes);
          }}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
        >
          Continue to delivery
        </Button>
      </div>

      {validationError && (
        <p className="text-red-600 text-sm text-center">{validationError}</p>
      )}
    </div>
  );
}
