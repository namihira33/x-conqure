import { TwitterApi, UserV2, TweetV2, ApiResponseError } from "twitter-api-v2"
import { XApiCredentials, XUser, XTweet } from "@/types"

// X APIクライアントを作成
export function createXClient(credentials: XApiCredentials): TwitterApi {
  return new TwitterApi({
    appKey: credentials.apiKey,
    appSecret: credentials.apiSecret,
    accessToken: credentials.accessToken,
    accessSecret: credentials.accessTokenSecret,
  })
}

// Bearer Tokenを使用した読み取り専用クライアント
export function createReadOnlyClient(bearerToken: string): TwitterApi {
  return new TwitterApi(bearerToken)
}

// X APIのUserV2をアプリ用のXUser型に変換
export function convertUserV2ToXUser(
  user: UserV2,
  isFollowing: boolean = false,
  isFollowedBy: boolean = false
): XUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    description: user.description || "",
    profileImageUrl: user.profile_image_url || "",
    followersCount: user.public_metrics?.followers_count || 0,
    followingCount: user.public_metrics?.following_count || 0,
    verified: user.verified || false,
    isFollowing,
    isFollowedBy,
  }
}

// X APIのTweetV2をアプリ用のXTweet型に変換
export function convertTweetV2ToXTweet(
  tweet: TweetV2,
  author?: XUser,
  isLiked: boolean = false,
  isRetweeted: boolean = false
): XTweet {
  return {
    id: tweet.id,
    text: tweet.text,
    authorId: tweet.author_id || "",
    author,
    createdAt: tweet.created_at || new Date().toISOString(),
    likeCount: tweet.public_metrics?.like_count || 0,
    retweetCount: tweet.public_metrics?.retweet_count || 0,
    replyCount: tweet.public_metrics?.reply_count || 0,
    isLiked,
    isRetweeted,
    quotedTweetId: tweet.referenced_tweets?.find((ref) => ref.type === "quoted")?.id,
  }
}

// APIエラーをハンドリング
export function handleApiError(error: unknown): { message: string; code?: number } {
  if (error instanceof ApiResponseError) {
    return {
      message: error.message || "API error occurred",
      code: error.code,
    }
  }
  if (error instanceof Error) {
    return { message: error.message }
  }
  return { message: "Unknown error occurred" }
}

// ユーザー情報取得用のフィールド
export const USER_FIELDS = [
  "id",
  "name",
  "username",
  "description",
  "profile_image_url",
  "public_metrics",
  "verified",
  "created_at",
] as const

// ツイート情報取得用のフィールド
export const TWEET_FIELDS = [
  "id",
  "text",
  "author_id",
  "created_at",
  "public_metrics",
  "referenced_tweets",
] as const

// ユーザー展開フィールド
export const EXPANSIONS = ["author_id"] as const

// レート制限を考慮した遅延
export async function rateLimitDelay(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// バッチ処理用のユーティリティ（レート制限対策）
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  delayMs: number = 1000,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i++) {
    const result = await processor(items[i])
    results.push(result)

    if (onProgress) {
      onProgress(i + 1, items.length)
    }

    // 最後のアイテム以外は遅延を入れる
    if (i < items.length - 1) {
      await rateLimitDelay(delayMs)
    }
  }

  return results
}
