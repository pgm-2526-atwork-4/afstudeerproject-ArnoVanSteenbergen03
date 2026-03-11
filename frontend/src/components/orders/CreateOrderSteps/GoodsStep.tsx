"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, ImageIcon, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { uploadGoodsImage, getLookupValues } from "@/lib/api-client";
import type { GoodsData, GoodsFormItem } from "@/types";
import type { LookupValue } from "@/lib/api-lookups";


interface GoodsStepProps {
  onNext: (goods: GoodsData[]) => void;
  onCancel: () => void;
  initialGoods?: GoodsData[];
}

export default function GoodsStep({
  onNext,
  onCancel,
  initialGoods,
}: GoodsStepProps) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "";

  const [goodStates, setGoodStates] = useState<LookupValue[]>([]);
  const [categories, setCategories] = useState<LookupValue[]>([]);
  const [units, setUnits] = useState<LookupValue[]>([]);

  useEffect(() => {
    Promise.all([
      getLookupValues("good_state"),
      getLookupValues("category"),
      getLookupValues("unit"),
    ]).then(([states, cats, uns]) => {
      setGoodStates(states);
      setCategories(cats);
      setUnits(uns);
    });
  }, []);
  const [goodsItems, setGoodsItems] = useState<GoodsFormItem[]>(
    initialGoods && initialGoods.length > 0
      ? initialGoods.map((item, i) => ({
          id: String(i + 1),
          goodState: item.goodState ?? "fresh",
          overDueDate: item.overDueDate ?? false,
          category: item.category,
          name: item.name,
          quantity: String(item.quantity),
          unit: item.unit ?? "items",
          allergies: item.allergies || "",
          expirationDate: item.expirationDate || "",
          packageIncluded: item.packageIncluded,
          image: item.image,
        }))
      : [createEmptyItem("1")],
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function createEmptyItem(id: string): GoodsFormItem {
    return {
      id,
      goodState: "fresh",
      overDueDate: false,
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

  const updateGoodsItem = (
    id: string,
    field: keyof GoodsFormItem,
    value: string | boolean,
  ) => {
    setGoodsItems(
      goodsItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    setUploadingItemId(itemId);
    try {
      const result = await uploadGoodsImage(file);
      updateGoodsItem(itemId, "image", result.imageUrl);
    } catch (error) {
      console.error("Failed to upload goods image:", error);
    } finally {
      setUploadingItemId(null);
    }
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
                    State
                  </Label>
                  <select
                    value={item.goodState}
                    onChange={(e) =>
                      updateGoodsItem(item.id, "goodState", e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-slate-800 rounded bg-white"
                  >
                    {goodStates.map((t) => (
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
                  <select
                    value={item.category}
                    onChange={(e) =>
                      updateGoodsItem(item.id, "category", e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-slate-800 rounded bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
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
                    {units.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Allergies{" "}
                  <span className="text-slate-500">(optional)</span>
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
                  Expiration Date{" "}
                  <span className="text-slate-500">(optional)</span>
                </Label>
                <Input
                  type="date"
                  value={item.expirationDate}
                  onChange={(e) =>
                    updateGoodsItem(
                      item.id,
                      "expirationDate",
                      e.target.value,
                    )
                  }
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.overDueDate}
                    onChange={(e) =>
                      updateGoodsItem(
                        item.id,
                        "overDueDate",
                        e.target.checked,
                      )
                    }
                    className="w-4 h-4 border-2 border-slate-800 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Over due date
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.packageIncluded}
                    onChange={(e) =>
                      updateGoodsItem(
                        item.id,
                        "packageIncluded",
                        e.target.checked,
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
                  Upload Image{" "}
                  <span className="text-slate-500">(optional)</span>
                </Label>
                <input
                  ref={(el) => {
                    fileInputRefs.current[item.id] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(item.id, file);
                  }}
                />
                {item.image ? (
                  <div className="relative w-full h-32">
                    <Image
                      src={`${apiBaseUrl}${item.image}`}
                      alt="Goods"
                      fill
                      className="object-cover rounded border-2 border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => updateGoodsItem(item.id, "image", "")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingItemId === item.id}
                    onClick={() => fileInputRefs.current[item.id]?.click()}
                    className="w-full border-2 border-slate-800 text-slate-800 py-2 rounded"
                  >
                    {uploadingItemId === item.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" /> Choose Image
                      </>
                    )}
                  </Button>
                )}
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

      <div className="flex gap-3">
        <Button onClick={onCancel} variant="outline" className="px-4 py-3">
          Cancel Order
        </Button>
        <Button
          onClick={() => {
            const hasEmptyItems = goodsItems.some(
              (item) =>
                !item.name.trim() || !item.quantity || !item.category.trim(),
            );
            if (hasEmptyItems) {
              setValidationError(
                "Please fill in name, category, and quantity for all items.",
              );
              return;
            }
            setValidationError(null);

            const itemsData: GoodsData[] = goodsItems.map((item) => ({
              goodState: item.goodState,
              overDueDate: item.overDueDate,
              category: item.category,
              name: item.name,
              quantity: parseFloat(item.quantity),
              unit: item.unit,
              allergies: item.allergies || undefined,
              expirationDate: item.expirationDate || undefined,
              packageIncluded: item.packageIncluded,
              image: item.image || undefined,
            }));

            onNext(itemsData);
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
