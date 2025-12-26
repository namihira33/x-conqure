import { NextRequest, NextResponse } from "next/server"
import { createXClient, convertUserV2ToXUser, USER_FIELDS, handleApiError } from "@/lib/x-api"
import { XApiCredentials, XUser } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { credentials, userId, maxResults = 1000 }: {
      credentials: XApiCredentials
      userId: string
      maxResults?: number
    } = await request.json()

    if (!credentials || !userId) {
      return NextResponse.json(
        { error: "Missing credentials or userId" },
        { status: 400 }
      )
    }

    const client = createXClient(credentials)
    const followers: XUser[] = []
    let paginationToken: string | undefined

    // ページネーションで全フォロワーを取得
    do {
      const result = await client.v2.followers(userId, {
        max_results: Math.min(maxResults - followers.length, 1000),
        "user.fields": [...USER_FIELDS],
        pagination_token: paginationToken,
      })

      if (result.data) {
        for (const user of result.data) {
          followers.push(convertUserV2ToXUser(user, false, true))
        }
      }

      paginationToken = result.meta.next_token

      // 最大数に達したら終了
      if (followers.length >= maxResults) break

    } while (paginationToken)

    return NextResponse.json({
      success: true,
      followers,
      total: followers.length,
    })
  } catch (error) {
    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    )
  }
}
