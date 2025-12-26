import { NextRequest, NextResponse } from "next/server"
import { createXClient, convertUserV2ToXUser, USER_FIELDS, handleApiError } from "@/lib/x-api"
import { XApiCredentials, XUser } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { credentials, userId }: {
      credentials: XApiCredentials
      userId: string
    } = await request.json()

    if (!credentials || !userId) {
      return NextResponse.json(
        { error: "Missing credentials or userId" },
        { status: 400 }
      )
    }

    const client = createXClient(credentials)

    // フォロー中とフォロワーを両方取得
    const followingSet = new Set<string>()
    const followersSet = new Set<string>()
    const followingMap = new Map<string, XUser>()

    // フォロー中を取得
    let followingToken: string | undefined
    do {
      const followingResult = await client.v2.following(userId, {
        max_results: 1000,
        "user.fields": [...USER_FIELDS],
        pagination_token: followingToken,
      })

      if (followingResult.data) {
        for (const user of followingResult.data) {
          followingSet.add(user.id)
          followingMap.set(user.id, convertUserV2ToXUser(user, true, false))
        }
      }

      followingToken = followingResult.meta.next_token
    } while (followingToken)

    // フォロワーを取得
    let followersToken: string | undefined
    do {
      const followersResult = await client.v2.followers(userId, {
        max_results: 1000,
        "user.fields": [...USER_FIELDS],
        pagination_token: followersToken,
      })

      if (followersResult.data) {
        for (const user of followersResult.data) {
          followersSet.add(user.id)
        }
      }

      followersToken = followersResult.meta.next_token
    } while (followersToken)

    // 片思いフォロー（フォロー中だがフォロワーではないユーザー）を抽出
    const oneWayFollowing: XUser[] = []
    for (const [id, user] of followingMap) {
      if (!followersSet.has(id)) {
        oneWayFollowing.push({
          ...user,
          isFollowedBy: false,
        })
      }
    }

    return NextResponse.json({
      success: true,
      oneWayFollowing,
      total: oneWayFollowing.length,
      followingCount: followingSet.size,
      followersCount: followersSet.size,
    })
  } catch (error) {
    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    )
  }
}
