// X (Twitter) API関連の型定義

export interface XApiCredentials {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
  bearerToken?: string
}

export interface XUser {
  id: string
  username: string
  name: string
  description: string
  profileImageUrl: string
  followersCount: number
  followingCount: number
  verified: boolean
  isFollowing: boolean
  isFollowedBy: boolean
}

export interface XTweet {
  id: string
  text: string
  authorId: string
  author?: XUser
  createdAt: string
  likeCount: number
  retweetCount: number
  replyCount: number
  isLiked: boolean
  isRetweeted: boolean
  quotedTweetId?: string
}

export interface FollowRelationship {
  user: XUser
  followedAt?: string
  isOneWay: boolean // 片思いフォロー
}

export interface SearchFilter {
  keywords: string[]
  categories: string[]
  minFollowers?: number
  maxFollowers?: number
  hasProfileImage: boolean
  isVerified?: boolean
}

export interface QuoteRetweet {
  originalTweet: XTweet
  comment: string
  generatedAt: string
}

export interface AppState {
  credentials: XApiCredentials | null
  isAuthenticated: boolean
  currentUser: XUser | null
  following: XUser[]
  followers: XUser[]
  oneWayFollowing: XUser[]
  searchResults: XUser[]
  tweetSearchResults: XTweet[]
  quoteRetweets: QuoteRetweet[]
  loading: {
    auth: boolean
    following: boolean
    followers: boolean
    search: boolean
    action: boolean
  }
  error: string | null
}

// 異分野コミュニケーション・サイエンスコミュニケーション関連のカテゴリ
export const SCIENCE_COMM_CATEGORIES = [
  "サイエンスコミュニケーション",
  "科学コミュニケーター",
  "異分野交流",
  "学際研究",
  "研究者",
  "大学院生",
  "博士課程",
  "修士課程",
  "STEM教育",
  "科学教育",
  "サイエンスカフェ",
  "アウトリーチ",
  "学生団体",
  "研究広報",
] as const

export type ScienceCommCategory = typeof SCIENCE_COMM_CATEGORIES[number]
