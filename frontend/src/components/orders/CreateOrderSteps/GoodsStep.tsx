"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, ImageIcon, Loader2, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { uploadGoodsImage, getLookupValues } from "@/lib/api-client";
import type { GoodsData, GoodsFormItem } from "@/types";
import type { LookupValue } from "@/lib/api-lookups";
import { z } from "zod/v4";

const CATEGORY_PLACEHOLDER = "__select_category__";

const goodsItemValidationSchema = z.object({
  goodState: z.enum(["fresh", "old", "dry"]),
  overDueDate: z.boolean(),
  category: z.string().trim().min(1, "Category is required"),
  name: z.string().trim().min(1, "Item name is required"),
  quantity: z
    .string()
    .trim()
    .min(1, "Quantity is required")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Quantity must be a positive number")
    .transform((value) => Number(value)),
  unit: z.enum(["kg", "items", "boxes", "pallets", "liters"]),
  allergies: z.string().trim().optional(),
  expirationDate: z.string().optional(),
  packageIncluded: z.boolean(),
  image: z.string().optional(),
});

interface GoodsStepProps {
  onNext: (goods: GoodsData[]) => void;
  onCancel: () => void;
  onBack?: () => void;
  initialGoods?: GoodsData[];
}

export default function GoodsStep({
  onNext,
  onCancel,
  onBack,
  initialGoods,
}: GoodsStepProps) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "";

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
    if (validationError) {
      setValidationError(null);
    }
    setGoodsItems([...goodsItems, createEmptyItem(String(Date.now()))]);
  };

  const removeGoodsItem = (id: string) => {
    if (goodsItems.length > 1) {
      if (validationError) {
        setValidationError(null);
      }
      setGoodsItems(goodsItems.filter((item) => item.id !== id));
    }
  };

  const updateGoodsItem = (
    id: string,
    field: keyof GoodsFormItem,
    value: string | boolean,
  ) => {
    if (validationError) {
      setValidationError(null);
    }
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

  const handleContinue = () => {
    const parsedItems: GoodsData[] = [];

    for (let index = 0; index < goodsItems.length; index++) {
      const item = goodsItems[index];
      const parsed = goodsItemValidationSchema.safeParse({
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
      });

      if (!parsed.success) {
        setValidationError(
          `Item ${index + 1}: ${parsed.error.issues[0]?.message || "Validation failed"}`,
        );
        return;
      }

      parsedItems.push({
        goodState: parsed.data.goodState,
        overDueDate: parsed.data.overDueDate,
        category: parsed.data.category,
        name: parsed.data.name,
        quantity: parsed.data.quantity,
        unit: parsed.data.unit,
        allergies: parsed.data.allergies || undefined,
        expirationDate: parsed.data.expirationDate || undefined,
        packageIncluded: parsed.data.packageIncluded,
        image: parsed.data.image || undefined,
      });
    }

    setValidationError(null);
    onNext(parsedItems);
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-800 hover:text-slate-600 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      )}
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
                  <Select
                    value={item.goodState}
                    onValueChange={(value) =>
                      updateGoodsItem(item.id, "goodState", value)
                    }
                  >
                    <SelectTrigger className="w-full px-3 py-2 border-2 border-slate-800 rounded bg-white">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {(goodStates.length > 0
                        ? goodStates
                        : [
                            { value: "fresh", label: "Fresh" },
                            { value: "old", label: "Old" },
                            { value: "dry", label: "Dry" },
                          ]
                      ).map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block text-sm font-semibold text-slate-800 mb-2">
                    Category
                  </Label>
                  <Select
                    value={item.category || CATEGORY_PLACEHOLDER}
                    onValueChange={(value) =>
                      updateGoodsItem(
                        item.id,
                        "category",
                        value === CATEGORY_PLACEHOLDER ? "" : value,
                      )
                    }
                  >
                    <SelectTrigger className="w-full px-3 py-2 border-2 border-slate-800 rounded bg-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CATEGORY_PLACEHOLDER}>
                        Select a category
                      </SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select
                    value={item.unit}
                    onValueChange={(value) =>
                      updateGoodsItem(item.id, "unit", value)
                    }
                  >
                    <SelectTrigger className="w-full px-3 py-2 border-2 border-slate-800 rounded bg-white">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {(units.length > 0
                        ? units
                        : [
                            { value: "kg", label: "Kg" },
                            { value: "items", label: "Items" },
                            { value: "boxes", label: "Boxes" },
                            { value: "pallets", label: "Pallets" },
                            { value: "liters", label: "Liters" },
                          ]
                      ).map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                  Expiration Date{" "}
                  <span className="text-slate-500">(optional)</span>
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

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`overdue-${item.id}`}
                    checked={item.overDueDate}
                    onCheckedChange={(checked) =>
                      updateGoodsItem(item.id, "overDueDate", checked === true)
                    }
                    className="border-slate-800"
                  />
                  <Label
                    htmlFor={`overdue-${item.id}`}
                    className="text-sm font-semibold text-slate-800"
                  >
                    Over due date
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`package-${item.id}`}
                    checked={item.packageIncluded}
                    onCheckedChange={(checked) =>
                      updateGoodsItem(
                        item.id,
                        "packageIncluded",
                        checked === true,
                      )
                    }
                    className="border-slate-800"
                  />
                  <Label
                    htmlFor={`package-${item.id}`}
                    className="text-sm font-semibold text-slate-800"
                  >
                    Packaging included
                  </Label>
                </div>
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
          onClick={handleContinue}
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
