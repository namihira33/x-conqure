import { NextRequest, NextResponse } from "next/server"
import { createXClient, handleApiError, rateLimitDelay } from "@/lib/x-api"
import { XApiCredentials } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { credentials, sourceUserId, targetUserIds }: {
      credentials: XApiCredentials
      sourceUserId: string
      targetUserIds: string[]
    } = await request.json()

    if (!credentials || !sourceUserId || !targetUserIds || targetUserIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const client = createXClient(credentials)
    const results: { userId: string; success: boolean; error?: string }[] = []

    // 各ユーザーをフォロー解除（レート制限対策で遅延を入れる）
    for (let i = 0; i < targetUserIds.length; i++) {
      const targetUserId = targetUserIds[i]

      try {
        await client.v2.unfollow(sourceUserId, targetUserId)
        results.push({ userId: targetUserId, success: true })
      } catch (error) {
        const { message } = handleApiError(error)
        results.push({ userId: targetUserId, success: false, error: message })
      }

      // 最後以外は1秒待機（レート制限対策）
      if (i < targetUserIds.length - 1) {
        await rateLimitDelay(1000)
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: targetUserIds.length,
        success: successCount,
        failed: failCount,
      },
    })
  } catch (error) {
    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    )
  }
}
