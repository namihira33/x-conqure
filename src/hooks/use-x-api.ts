"use client"

import { useCallback } from "react"
import { useAppContext, useAppActions } from "@/store/app-context"
import { XUser, XTweet } from "@/types"

// APIレスポンスの型定義
interface ApiResponse<T> {
  success: boolean
  error?: string
  data?: T
}

// 汎用的なAPI呼び出し関数
async function callApi<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "API error" }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function useXApi() {
  const { state } = useAppContext()
  const {
    setCurrentUser,
    setAuthenticated,
    setOneWayFollowing,
    setSearchResults,
    setTweetSearchResults,
    setLoading,
    setError,
    removeFromFollowing,
    addToFollowing,
  } = useAppActions()

  // 認証情報の検証
  const verifyCredentials = useCallback(async () => {
    if (!state.credentials) {
      setError("認証情報がありません")
      return false
    }

    setLoading("auth", true)
    setError(null)

    const result = await callApi<{ user: XUser }>("/api/auth/verify", {
      ...state.credentials,
    })

    setLoading("auth", false)

    if (result.success && result.data?.user) {
      setCurrentUser(result.data.user)
      setAuthenticated(true)
      return true
    } else {
      setError(result.error || "認証に失敗しました")
      setAuthenticated(false)
      return false
    }
  }, [state.credentials, setCurrentUser, setAuthenticated, setLoading, setError])

  // 片思いフォロー取得
  const fetchOneWayFollowing = useCallback(async () => {
    if (!state.credentials || !state.currentUser) {
      setError("認証情報またはユーザー情報がありません")
      return []
    }

    setLoading("following", true)
    setError(null)

    const result = await callApi<{ oneWayFollowing: XUser[] }>(
      "/api/users/one-way-following",
      {
        credentials: state.credentials,
        userId: state.currentUser.id,
      }
    )

    setLoading("following", false)

    if (result.success && result.data?.oneWayFollowing) {
      setOneWayFollowing(result.data.oneWayFollowing)
      return result.data.oneWayFollowing
    } else {
      setError(result.error || "片思いフォローの取得に失敗しました")
      return []
    }
  }, [state.credentials, state.currentUser, setOneWayFollowing, setLoading, setError])

  // 一括フォロー解除
  const batchUnfollow = useCallback(
    async (
      targetUserIds: string[],
      onProgress?: (completed: number, total: number) => void
    ) => {
      if (!state.credentials || !state.currentUser) {
        setError("認証情報またはユーザー情報がありません")
        return { success: false, results: [] }
      }

      setLoading("action", true)
      setError(null)

      // 進捗更新のためにバッチ処理
      const batchSize = 10
      const allResults: { userId: string; success: boolean; error?: string }[] = []

      for (let i = 0; i < targetUserIds.length; i += batchSize) {
        const batch = targetUserIds.slice(i, i + batchSize)

        const result = await callApi<{
          results: { userId: string; success: boolean; error?: string }[]
        }>("/api/users/unfollow", {
          credentials: state.credentials,
          sourceUserId: state.currentUser.id,
          targetUserIds: batch,
        })

        if (result.success && result.data?.results) {
          allResults.push(...result.data.results)

          // 成功したユーザーをフォローリストから削除
          for (const r of result.data.results) {
            if (r.success) {
              removeFromFollowing(r.userId)
            }
          }
        }

        if (onProgress) {
          onProgress(Math.min(i + batchSize, targetUserIds.length), targetUserIds.length)
        }
      }

      setLoading("action", false)

      return {
        success: true,
        results: allResults,
      }
    },
    [state.credentials, state.currentUser, removeFromFollowing, setLoading, setError]
  )

  // ユーザー検索
  const searchUsers = useCallback(
    async (query: string) => {
      if (!state.credentials) {
        setError("認証情報がありません")
        return []
      }

      setLoading("search", true)
      setError(null)

      const result = await callApi<{ users: XUser[] }>("/api/users/search", {
        credentials: state.credentials,
        query,
      })

      setLoading("search", false)

      if (result.success && result.data?.users) {
        setSearchResults(result.data.users)
        return result.data.users
      } else {
        setError(result.error || "検索に失敗しました")
        return []
      }
    },
    [state.credentials, setSearchResults, setLoading, setError]
  )

  // 一括フォロー
  const batchFollow = useCallback(
    async (
      targetUserIds: string[],
      onProgress?: (completed: number, total: number) => void
    ) => {
      if (!state.credentials || !state.currentUser) {
        setError("認証情報またはユーザー情報がありません")
        return { success: false, results: [] }
      }

      setLoading("action", true)
      setError(null)

      const batchSize = 10
      const allResults: { userId: string; success: boolean; error?: string }[] = []

      for (let i = 0; i < targetUserIds.length; i += batchSize) {
        const batch = targetUserIds.slice(i, i + batchSize)

        const result = await callApi<{
          results: { userId: string; success: boolean; error?: string }[]
        }>("/api/users/follow", {
          credentials: state.credentials,
          sourceUserId: state.currentUser.id,
          targetUserIds: batch,
        })

        if (result.success && result.data?.results) {
          allResults.push(...result.data.results)

          // 成功したユーザーをフォローリストに追加
          for (const r of result.data.results) {
            if (r.success) {
              const user = state.searchResults.find((u) => u.id === r.userId)
              if (user) {
                addToFollowing({ ...user, isFollowing: true })
              }
            }
          }
        }

        if (onProgress) {
          onProgress(Math.min(i + batchSize, targetUserIds.length), targetUserIds.length)
        }
      }

      setLoading("action", false)

      return {
        success: true,
        results: allResults,
      }
    },
    [state.credentials, state.currentUser, state.searchResults, addToFollowing, setLoading, setError]
  )

  // ツイート検索
  const searchTweets = useCallback(
    async (query: string) => {
      if (!state.credentials) {
        setError("認証情報がありません")
        return []
      }

      setLoading("search", true)
      setError(null)

      const result = await callApi<{ tweets: XTweet[] }>("/api/tweets/search", {
        credentials: state.credentials,
        query,
      })

      setLoading("search", false)

      if (result.success && result.data?.tweets) {
        setTweetSearchResults(result.data.tweets)
        return result.data.tweets
      } else {
        setError(result.error || "ツイート検索に失敗しました")
        return []
      }
    },
    [state.credentials, setTweetSearchResults, setLoading, setError]
  )

  // 一括いいね
  const batchLike = useCallback(
    async (
      tweetIds: string[],
      onProgress?: (completed: number, total: number) => void
    ) => {
      if (!state.credentials || !state.currentUser) {
        setError("認証情報またはユーザー情報がありません")
        return { success: false, results: [] }
      }

      setLoading("action", true)
      setError(null)

      const batchSize = 10
      const allResults: { tweetId: string; success: boolean; error?: string }[] = []

      for (let i = 0; i < tweetIds.length; i += batchSize) {
        const batch = tweetIds.slice(i, i + batchSize)

        const result = await callApi<{
          results: { tweetId: string; success: boolean; error?: string }[]
        }>("/api/tweets/like", {
          credentials: state.credentials,
          userId: state.currentUser.id,
          tweetIds: batch,
        })

        if (result.success && result.data?.results) {
          allResults.push(...result.data.results)
        }

        if (onProgress) {
          onProgress(Math.min(i + batchSize, tweetIds.length), tweetIds.length)
        }
      }

      setLoading("action", false)

      return {
        success: true,
        results: allResults,
      }
    },
    [state.credentials, state.currentUser, setLoading, setError]
  )

  // 引用リツイート投稿
  const postQuoteRetweet = useCallback(
    async (quotedTweetId: string, comment: string) => {
      if (!state.credentials) {
        setError("認証情報がありません")
        return { success: false }
      }

      setLoading("action", true)
      setError(null)

      const result = await callApi<{ tweet: { id: string; text: string } }>(
        "/api/tweets/quote",
        {
          credentials: state.credentials,
          quotedTweetId,
          comment,
        }
      )

      setLoading("action", false)

      if (result.success && result.data?.tweet) {
        return { success: true, tweet: result.data.tweet }
      } else {
        setError(result.error || "引用リツイートの投稿に失敗しました")
        return { success: false }
      }
    },
    [state.credentials, setLoading, setError]
  )

  return {
    verifyCredentials,
    fetchOneWayFollowing,
    batchUnfollow,
    searchUsers,
    batchFollow,
    searchTweets,
    batchLike,
    postQuoteRetweet,
    isLoading: state.loading,
    error: state.error,
  }
}
