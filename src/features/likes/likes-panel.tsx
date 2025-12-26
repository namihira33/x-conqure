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
import { useAppContext, useAppActions } from "@/store/app-context"
import { XTweet } from "@/types"
import {
  Heart,
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  MessageCircle,
  Repeat2,
} from "lucide-react"

// デモ用のモックデータ
const mockTweets: XTweet[] = [
  {
    id: "t1",
    text: "異分野交流のイベントを開催しました。様々な研究分野の方々と話せてとても刺激的でした。次回も楽しみです。",
    authorId: "101",
    author: {
      id: "101",
      username: "sci_comm_researcher",
      name: "科学コミュニケーション研究者",
      description: "",
      profileImageUrl: "",
      followersCount: 2345,
      followingCount: 890,
      verified: false,
      isFollowing: true,
      isFollowedBy: false,
    },
    createdAt: "2024-01-15T10:30:00Z",
    likeCount: 156,
    retweetCount: 34,
    replyCount: 12,
    isLiked: false,
    isRetweeted: false,
  },
  {
    id: "t2",
    text: "サイエンスカフェで一般の方々と研究について議論。専門外の視点からの質問が新鮮で、自分の研究を見直すきっかけになりました。",
    authorId: "102",
    author: {
      id: "102",
      username: "interdisciplinary_lab",
      name: "学際研究室",
      description: "",
      profileImageUrl: "",
      followersCount: 8901,
      followingCount: 456,
      verified: true,
      isFollowing: true,
      isFollowedBy: true,
    },
    createdAt: "2024-01-14T15:45:00Z",
    likeCount: 289,
    retweetCount: 67,
    replyCount: 23,
    isLiked: false,
    isRetweeted: false,
  },
  {
    id: "t3",
    text: "学生団体として異分野コラボイベントを企画中。参加者募集しています。文理問わず興味のある方はDMください。",
    authorId: "103",
    author: {
      id: "103",
      username: "stem_student_network",
      name: "STEM学生ネットワーク",
      description: "",
      profileImageUrl: "",
      followersCount: 5678,
      followingCount: 234,
      verified: false,
      isFollowing: false,
      isFollowedBy: true,
    },
    createdAt: "2024-01-13T09:00:00Z",
    likeCount: 445,
    retweetCount: 123,
    replyCount: 56,
    isLiked: true,
    isRetweeted: false,
  },
]

export function LikesPanel() {
  const { state } = useAppContext()
  const { setTweetSearchResults, setLoading } = useAppActions()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTweets, setSelectedTweets] = useState<Set<string>>(new Set())
  const [likeProgress, setLikeProgress] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [tweets, setTweets] = useState<XTweet[]>(mockTweets)

  const handleSearch = () => {
    setLoading("search", true)
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      setTweetSearchResults(mockTweets)
      setLoading("search", false)
    }, 1000)
  }

  const toggleSelectTweet = (tweetId: string) => {
    const tweet = tweets.find(t => t.id === tweetId)
    if (tweet?.isLiked) return

    const newSelected = new Set(selectedTweets)
    if (newSelected.has(tweetId)) {
      newSelected.delete(tweetId)
    } else {
      newSelected.add(tweetId)
    }
    setSelectedTweets(newSelected)
  }

  const selectAll = () => {
    setSelectedTweets(new Set(tweets.filter(t => !t.isLiked).map((t) => t.id)))
  }

  const deselectAll = () => {
    setSelectedTweets(new Set())
  }

  const handleBatchLike = async () => {
    if (selectedTweets.size === 0) return

    setIsLiking(true)
    const total = selectedTweets.size
    let completed = 0

    for (const tweetId of selectedTweets) {
      // 実際のAPIコールをシミュレート
      await new Promise((resolve) => setTimeout(resolve, 300))
      setTweets(prev => prev.map(t =>
        t.id === tweetId ? { ...t, isLiked: true, likeCount: t.likeCount + 1 } : t
      ))
      completed++
      setLikeProgress((completed / total) * 100)
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
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
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
                <RefreshCw className="h-4 w-4 animate-spin" />
                いいね中...
              </div>
              <Progress value={likeProgress} />
            </div>
          )}

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <div
                  key={tweet.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedTweets.has(tweet.id)
                      ? "bg-primary/5 border-primary/20"
                      : "hover:bg-muted"
                  } ${tweet.isLiked ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedTweets.has(tweet.id)}
                      onCheckedChange={() => toggleSelectTweet(tweet.id)}
                      disabled={tweet.isLiked}
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
                        <div className={`flex items-center gap-1 ${tweet.isLiked ? "text-red-500" : ""}`}>
                          <Heart className={`h-4 w-4 ${tweet.isLiked ? "fill-current" : ""}`} />
                          {tweet.likeCount}
                        </div>
                        {tweet.isLiked && (
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

          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={handleBatchLike}
              disabled={selectedTweets.size === 0 || isLiking}
              className="w-full"
            >
              <Heart className="h-4 w-4 mr-2" />
              選択したツイートにいいね ({selectedTweets.size})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
