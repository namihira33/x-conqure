import { NextRequest, NextResponse } from "next/server"
import { createXClient, convertUserV2ToXUser, USER_FIELDS, handleApiError } from "@/lib/x-api"
import { XApiCredentials } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const credentials: XApiCredentials = await request.json()

    // 認証情報のバリデーション
    if (!credentials.apiKey || !credentials.apiSecret || !credentials.accessToken || !credentials.accessTokenSecret) {
      return NextResponse.json(
        { error: "Missing required credentials" },
        { status: 400 }
      )
    }

    // X APIクライアントを作成して認証確認
    const client = createXClient(credentials)

    // 自分のユーザー情報を取得して認証確認
    const me = await client.v2.me({
      "user.fields": [...USER_FIELDS],
    })

    if (!me.data) {
      return NextResponse.json(
        { error: "Failed to verify credentials" },
        { status: 401 }
      )
    }

    const user = convertUserV2ToXUser(me.data)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code },
      { status: code === 401 ? 401 : 500 }
    )
  }
}
