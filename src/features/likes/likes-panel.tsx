"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppContext } from "@/store/app-context"
import { useXApi } from "@/hooks/use-x-api"
import {
  Heart,
  Search,
  CheckSquare,
  Square,
  MessageCircle,
  Repeat2,
  Loader2,
} from "lucide-react"

export function LikesPanel() {
  const { state } = useAppContext()
  const { searchTweets, batchLike, isLoading } = useXApi()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTweets, setSelectedTweets] = useState<Set<string>>(new Set())
  const [likeProgress, setLikeProgress] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [likedTweets, setLikedTweets] = useState<Set<string>>(new Set())

  const tweets = state.tweetSearchResults

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSelectedTweets(new Set())
    await searchTweets(searchQuery)
  }

  const toggleSelectTweet = (tweetId: string) => {
    const tweet = tweets.find(t => t.id === tweetId)
    if (tweet?.isLiked || likedTweets.has(tweetId)) return

    const newSelected = new Set(selectedTweets)
    if (newSelected.has(tweetId)) {
      newSelected.delete(tweetId)
    } else {
      newSelected.add(tweetId)
    }
    setSelectedTweets(newSelected)
  }

  const selectAll = () => {
    setSelectedTweets(new Set(
      tweets
        .filter(t => !t.isLiked && !likedTweets.has(t.id))
        .map((t) => t.id)
    ))
  }

  const deselectAll = () => {
    setSelectedTweets(new Set())
  }

  const handleBatchLike = async () => {
    if (selectedTweets.size === 0) return

    setIsLiking(true)
    setLikeProgress(0)

    const result = await batchLike(
      Array.from(selectedTweets),
      (completed, total) => {
        setLikeProgress((completed / total) * 100)
      }
    )

    // いいね成功したツイートを記録
    if (result.results) {
      const newLiked = new Set(likedTweets)
      for (const r of result.results) {
        if (r.success) {
          newLiked.add(r.tweetId)
        }
      }
      setLikedTweets(newLiked)
    }

    setSelectedTweets(new Set())
    setIsLiking(false)
    setLikeProgress(0)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isLiked = (tweetId: string) => {
    const tweet = tweets.find(t => t.id === tweetId)
    return tweet?.isLiked || likedTweets.has(tweetId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            関連ツイートへのいいね
          </CardTitle>
          <CardDescription>
            異分野コミュニケーション・サイエンスコミュニケーション関連のツイートを検索していいね
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="キーワードで検索（例: サイエンスコミュニケーション, 異分野交流）..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading.search}>
              {isLoading.search ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {tweets.length} 件のツイート
              </Badge>
              <Badge variant="outline">
                {selectedTweets.size} 件選択中
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                <CheckSquare className="h-4 w-4 mr-1" />
                全選択
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                <Square className="h-4 w-4 mr-1" />
                選択解除
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLiking && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                いいね中...
              </div>
              <Progress value={likeProgress} />
            </div>
          )}

          {isLoading.search ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tweets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              キーワードを入力してツイートを検索してください
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <div
                    key={tweet.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedTweets.has(tweet.id)
                        ? "bg-primary/5 border-primary/20"
                        : "hover:bg-muted"
                    } ${isLiked(tweet.id) ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTweets.has(tweet.id)}
                        onCheckedChange={() => toggleSelectTweet(tweet.id)}
                        disabled={isLiked(tweet.id) || isLiking}
                        className="mt-1"
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={tweet.author?.profileImageUrl} />
                        <AvatarFallback>
                          {tweet.author?.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{tweet.author?.name}</span>
                          {tweet.author?.verified && (
                            <Badge variant="secondary" className="text-xs">
                              認証済み
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            @{tweet.author?.username}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(tweet.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mb-3">{tweet.text}</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {tweet.replyCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="h-4 w-4" />
                            {tweet.retweetCount}
                          </div>
                          <div className={`flex items-center gap-1 ${isLiked(tweet.id) ? "text-red-500" : ""}`}>
                            <Heart className={`h-4 w-4 ${isLiked(tweet.id) ? "fill-current" : ""}`} />
                            {tweet.likeCount + (likedTweets.has(tweet.id) ? 1 : 0)}
                          </div>
                          {isLiked(tweet.id) && (
                            <Badge variant="outline" className="text-xs">
                              いいね済み
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={handleBatchLike}
              disabled={selectedTweets.size === 0 || isLiking}
              className="w-full"
            >
              {isLiking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              選択したツイートにいいね ({selectedTweets.size})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
