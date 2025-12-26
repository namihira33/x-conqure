import { NextRequest, NextResponse } from "next/server"
import { createXClient, convertUserV2ToXUser, convertTweetV2ToXTweet, USER_FIELDS, TWEET_FIELDS, handleApiError } from "@/lib/x-api"
import { XApiCredentials, XTweet, XUser } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { credentials, query, maxResults = 50 }: {
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

    // ツイート検索
    const result = await client.v2.search(query, {
      max_results: Math.min(maxResults, 100),
      "tweet.fields": [...TWEET_FIELDS],
      "user.fields": [...USER_FIELDS],
      expansions: ["author_id"],
    })

    // ユーザー情報をマップに格納
    const usersMap = new Map<string, XUser>()
    if (result.includes?.users) {
      for (const user of result.includes.users) {
        usersMap.set(user.id, convertUserV2ToXUser(user))
      }
    }

    // ツイートを変換
    const tweets: XTweet[] = []
    const tweetData = result.data?.data ?? []
    for (const tweet of tweetData) {
      const author = tweet.author_id ? usersMap.get(tweet.author_id) : undefined
      tweets.push(convertTweetV2ToXTweet(tweet, author))
    }

    return NextResponse.json({
      success: true,
      tweets,
      total: tweets.length,
    })
  } catch (error) {
    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    )
  }
}
