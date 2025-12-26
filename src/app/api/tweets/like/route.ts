import { NextRequest, NextResponse } from "next/server"
import { createXClient, handleApiError, rateLimitDelay } from "@/lib/x-api"
import { XApiCredentials } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { credentials, userId, tweetIds }: {
      credentials: XApiCredentials
      userId: string
      tweetIds: string[]
    } = await request.json()

    if (!credentials || !userId || !tweetIds || tweetIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const client = createXClient(credentials)
    const results: { tweetId: string; success: boolean; error?: string }[] = []

    // 各ツイートにいいね（レート制限対策で遅延を入れる）
    for (let i = 0; i < tweetIds.length; i++) {
      const tweetId = tweetIds[i]

      try {
        await client.v2.like(userId, tweetId)
        results.push({ tweetId, success: true })
      } catch (error) {
        const { message } = handleApiError(error)
        results.push({ tweetId, success: false, error: message })
      }

      // 最後以外は500ms待機（いいねはレート制限が厳しい）
      if (i < tweetIds.length - 1) {
        await rateLimitDelay(500)
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: tweetIds.length,
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
