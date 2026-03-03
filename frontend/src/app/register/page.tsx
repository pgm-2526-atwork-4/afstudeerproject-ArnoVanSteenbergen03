"use client";

import { useState } from "react";
import IntentionSelection from "@/components/register/IntentionSelection";
import { RegisterForm } from "@/components/register/RegisterForm";

export default function RegisterPage() {
  const [selectedType, setSelectedType] = useState<"volunteer" | "provider" | null>(null);

  if (!selectedType) {
    return <IntentionSelection onSelect={setSelectedType} />;
  }

  return (
    <RegisterForm userType={selectedType} onBack={() => setSelectedType(null)} />
  );
}
