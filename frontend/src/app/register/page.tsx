'use client';

import { useState } from 'react';
import RoleSelection from '@/components/auth/RoleSelection';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  if (!selectedRole) {
    return <RoleSelection onRoleSelect={setSelectedRole} />;
  }

  return <RegisterForm role={selectedRole} onBack={() => setSelectedRole(null)} />;
}