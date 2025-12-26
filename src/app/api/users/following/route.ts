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
    const following: XUser[] = []
    let paginationToken: string | undefined

    // ページネーションで全フォロー中ユーザーを取得
    do {
      const result = await client.v2.following(userId, {
        max_results: Math.min(maxResults - following.length, 1000),
        "user.fields": [...USER_FIELDS],
        pagination_token: paginationToken,
      })

      if (result.data) {
        for (const user of result.data) {
          following.push(convertUserV2ToXUser(user, true, false))
        }
      }

      paginationToken = result.meta.next_token

      // 最大数に達したら終了
      if (following.length >= maxResults) break

    } while (paginationToken)

    return NextResponse.json({
      success: true,
      following,
      total: following.length,
    })
  } catch (error) {
    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    )
  }
}
