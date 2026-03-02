"use client";

import { useState } from "react";
import IntentionSelection from "@/components/auth/IntentionSelection";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const [selectedType, setSelectedType] = useState<"volunteer" | "provider" | null>(null);

  if (!selectedType) {
    return <IntentionSelection onSelect={setSelectedType} />;
  }

  return (
    <RegisterForm userType={selectedType} onBack={() => setSelectedType(null)} />
  );
}
