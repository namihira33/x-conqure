import { NextRequest, NextResponse } from "next/server"
import { createXClient, handleApiError } from "@/lib/x-api"
import { XApiCredentials } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { credentials, quotedTweetId, comment }: {
      credentials: XApiCredentials
      quotedTweetId: string
      comment: string
    } = await request.json()

    if (!credentials || !quotedTweetId || !comment) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // コメントの文字数チェック（280文字制限）
    if (comment.length > 280) {
      return NextResponse.json(
        { error: "Comment exceeds 280 characters" },
        { status: 400 }
      )
    }

    const client = createXClient(credentials)

    // 引用リツイートを投稿
    // X API v2では quote_tweet_id パラメータを使用
    const result = await client.v2.tweet({
      text: comment,
      quote_tweet_id: quotedTweetId,
    })

    if (!result.data) {
      return NextResponse.json(
        { error: "Failed to post quote tweet" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tweet: {
        id: result.data.id,
        text: result.data.text,
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
