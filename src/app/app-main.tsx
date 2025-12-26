"use client"

import { useAppContext } from "@/store/app-context"
import { AuthForm } from "@/features/auth/auth-form"
import { Dashboard } from "@/features/dashboard/dashboard"

export function AppMain() {
  const { state } = useAppContext()

  if (!state.isAuthenticated) {
    return <AuthForm />
  }

  return <Dashboard />
}
