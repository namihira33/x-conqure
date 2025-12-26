"use client"

import { AppProvider } from "@/store/app-context"
import { AppMain } from "./app-main"

export default function Home() {
  return (
    <AppProvider>
      <AppMain />
    </AppProvider>
  )
}
