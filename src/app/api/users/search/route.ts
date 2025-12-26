import { NextRequest, NextResponse } from "next/server"
import { createXClient, convertUserV2ToXUser, USER_FIELDS, handleApiError } from "@/lib/x-api"
import { XApiCredentials, XUser } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { credentials, query, maxResults = 100 }: {
      credentials: XApiCredentials
      query: string
      maxResults?: number
    } = await request.json()

    if (!credentials || !query) {
      return NextResponse.json(
        { error: "Missing credentials or query" },
        { status: 400 }
      )
    }

    const client = createXClient(credentials)
    const users: XUser[] = []

    // ユーザー検索（X API v2ではusersByUsernameやsearchは制限あり）
    // 代わりにツイート検索からユーザーを抽出する方法を使用
    const tweetsResult = await client.v2.search(query, {
      max_results: Math.min(maxResults, 100),
      "tweet.fields": ["author_id"],
      "user.fields": [...USER_FIELDS],
      expansions: ["author_id"],
    })

    if (tweetsResult.includes?.users) {
      const seenIds = new Set<string>()

      for (const user of tweetsResult.includes.users) {
        if (!seenIds.has(user.id)) {
          seenIds.add(user.id)
          users.push(convertUserV2ToXUser(user))
        }
      }
    }

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    })
  } catch (error) {
    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    )
  }
}
