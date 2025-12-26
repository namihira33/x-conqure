import { XApiCredentials } from "@/types"

const CREDENTIALS_KEY = "x-conqure-credentials"

// 認証情報をローカルストレージに保存
export function saveCredentials(credentials: XApiCredentials): void {
  if (typeof window === "undefined") return

  try {
    // 注意: ローカルストレージは安全ではないため、本番環境では
    // より安全な保存方法（暗号化、Electron secure storageなど）を使用すべき
    const encrypted = btoa(JSON.stringify(credentials))
    localStorage.setItem(CREDENTIALS_KEY, encrypted)
  } catch (error) {
    console.error("Failed to save credentials:", error)
  }
}

// 認証情報をローカルストレージから取得
export function loadCredentials(): XApiCredentials | null {
  if (typeof window === "undefined") return null

  try {
    const encrypted = localStorage.getItem(CREDENTIALS_KEY)
    if (!encrypted) return null

    const decrypted = atob(encrypted)
    return JSON.parse(decrypted) as XApiCredentials
  } catch (error) {
    console.error("Failed to load credentials:", error)
    return null
  }
}

// 認証情報を削除
export function clearCredentials(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(CREDENTIALS_KEY)
  } catch (error) {
    console.error("Failed to clear credentials:", error)
  }
}

// 今日の引用リツイート数を保存/取得
const QUOTE_COUNT_KEY = "x-conqure-quote-count"

interface QuoteCountData {
  date: string
  count: number
}

export function getTodayQuoteCount(): number {
  if (typeof window === "undefined") return 0

  try {
    const data = localStorage.getItem(QUOTE_COUNT_KEY)
    if (!data) return 0

    const parsed: QuoteCountData = JSON.parse(data)
    const today = new Date().toISOString().split("T")[0]

    if (parsed.date !== today) {
      // 日付が変わったらリセット
      return 0
    }

    return parsed.count
  } catch {
    return 0
  }
}

export function incrementQuoteCount(): number {
  if (typeof window === "undefined") return 0

  try {
    const today = new Date().toISOString().split("T")[0]
    const currentCount = getTodayQuoteCount()
    const newCount = currentCount + 1

    const data: QuoteCountData = {
      date: today,
      count: newCount,
    }

    localStorage.setItem(QUOTE_COUNT_KEY, JSON.stringify(data))
    return newCount
  } catch {
    return 0
  }
}
