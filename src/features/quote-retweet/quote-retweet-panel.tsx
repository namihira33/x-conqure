"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppContext } from "@/store/app-context"
import { useXApi } from "@/hooks/use-x-api"
import { getTodayQuoteCount, incrementQuoteCount } from "@/lib/storage"
import { XTweet, QuoteRetweet } from "@/types"
import {
  Quote,
  Search,
  Send,
  Calendar,
  Sparkles,
  Trash2,
  MessageCircle,
  Repeat2,
  Heart,
  Loader2,
  CheckCircle,
} from "lucide-react"

// qくんスタイルのコメント生成関数
const generateQkunComment = (tweet: XTweet, date: Date): string[] => {
  const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

  const templates = [
    `${dateStr}、これは興味深い取り組みだね。異分野が交わることで新しい発見が生まれる。TGNとしても学べる点が多い。`,
    `${dateStr}。こういった活動が広がることで、研究と社会の距離が縮まっていく。超異分野な学生団体として応援したい。`,
    `${dateStr}の発見。専門性を超えた対話こそが、次のイノベーションを生む。そんな場を作り続けていきたいね。`,
  ]

  return templates
}

export function QuoteRetweetPanel() {
  const { state } = useAppContext()
  const { searchTweets, postQuoteRetweet, isLoading } = useXApi()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTweet, setSelectedTweet] = useState<XTweet | null>(null)
  const [comment, setComment] = useState("")
  const [useAutoGenerate, setUseAutoGenerate] = useState(true)
  const [generatedComments, setGeneratedComments] = useState<string[]>([])
  const [savedQuotes, setSavedQuotes] = useState<QuoteRetweet[]>([])
  const [todayQuoteCount, setTodayQuoteCount] = useState(0)
  const [isPosting, setIsPosting] = useState(false)
  const [postSuccess, setPostSuccess] = useState<string | null>(null)

  const today = new Date()
  const maxDailyQuotes = 3

  const tweets = state.tweetSearchResults

  // 今日の投稿数を取得
  useEffect(() => {
    setTodayQuoteCount(getTodayQuoteCount())
  }, [])

  useEffect(() => {
    if (selectedTweet && useAutoGenerate) {
      const comments = generateQkunComment(selectedTweet, today)
      setGeneratedComments(comments)
      setComment(comments[0])
    }
  }, [selectedTweet, useAutoGenerate])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    await searchTweets(searchQuery)
  }

  const handleSelectTweet = (tweet: XTweet) => {
    setSelectedTweet(tweet)
    setPostSuccess(null)
  }

  const handleSaveQuote = () => {
    if (!selectedTweet || !comment) return

    const newQuote: QuoteRetweet = {
      originalTweet: selectedTweet,
      comment,
      generatedAt: new Date().toISOString(),
    }

    setSavedQuotes(prev => [...prev, newQuote])
    setSelectedTweet(null)
    setComment("")
    setGeneratedComments([])
  }

  const handlePostQuote = async (quote: QuoteRetweet) => {
    if (todayQuoteCount >= maxDailyQuotes) {
      return
    }

    setIsPosting(true)
    setPostSuccess(null)

    const result = await postQuoteRetweet(quote.originalTweet.id, quote.comment)

    if (result.success) {
      setSavedQuotes(prev => prev.filter(q => q.originalTweet.id !== quote.originalTweet.id))
      const newCount = incrementQuoteCount()
      setTodayQuoteCount(newCount)
      setPostSuccess(`投稿完了: ${quote.comment.slice(0, 30)}...`)
    }

    setIsPosting(false)
  }

  const handleDeleteQuote = (tweetId: string) => {
    setSavedQuotes(prev => prev.filter(q => q.originalTweet.id !== tweetId))
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
      {/* ステータスカード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            引用リツイート作成（qくんキャラ付け）
          </CardTitle>
          <CardDescription>
            1日1-3本の厳選した引用リツイートを作成。今日の日付情報とqくんのキャラ付けを入れて投稿
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {today.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <Badge variant={todayQuoteCount >= maxDailyQuotes ? "destructive" : "default"}>
                  本日 {todayQuoteCount} / {maxDailyQuotes} 投稿
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-generate" className="text-sm">
                qくん風コメント自動生成
              </Label>
              <Switch
                id="auto-generate"
                checked={useAutoGenerate}
                onCheckedChange={setUseAutoGenerate}
              />
            </div>
          </div>

          {postSuccess && (
            <div className="mt-4 p-3 bg-green-500/10 text-green-600 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {postSuccess}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ツイート検索 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ツイート検索</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="引用したいツイートを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm" disabled={isLoading.search}>
                {isLoading.search ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isLoading.search ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tweets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                キーワードを入力して検索してください
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {tweets.map((tweet) => (
                    <div
                      key={tweet.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTweet?.id === tweet.id
                          ? "bg-primary/5 border-primary/20"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handleSelectTweet(tweet)}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={tweet.author?.profileImageUrl} />
                          <AvatarFallback className="text-xs">
                            {tweet.author?.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium text-sm">{tweet.author?.name}</span>
                            <span className="text-xs text-muted-foreground">
                              @{tweet.author?.username}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{tweet.text}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {tweet.replyCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Repeat2 className="h-3 w-3" />
                              {tweet.retweetCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {tweet.likeCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* コメント作成 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">コメント作成</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTweet ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">選択中のツイート:</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedTweet.text}
                  </p>
                </div>

                {useAutoGenerate && generatedComments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      生成されたコメント候補
                    </Label>
                    <div className="space-y-2">
                      {generatedComments.map((gen, index) => (
                        <div
                          key={index}
                          className={`p-2 text-sm rounded border cursor-pointer transition-colors ${
                            comment === gen
                              ? "bg-primary/10 border-primary/30"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setComment(gen)}
                        >
                          {gen}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="comment">コメント（編集可能）</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="引用コメントを入力..."
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>qくんキャラ: 好奇心旺盛、前向き、学生団体代表</span>
                    <span className={comment.length > 280 ? "text-destructive" : ""}>
                      {comment.length} / 280
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSaveQuote}
                  disabled={!comment || comment.length > 280 || todayQuoteCount >= maxDailyQuotes}
                  className="w-full"
                >
                  下書きに保存
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                左のリストからツイートを選択してください
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 保存済みの引用リツイート */}
      {savedQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">下書き（{savedQuotes.length}件）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedQuotes.map((quote) => (
                <div
                  key={quote.originalTweet.id}
                  className="p-4 rounded-lg border"
                >
                  <div className="mb-3 p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">
                      引用元: {quote.originalTweet.text}
                    </p>
                  </div>
                  <p className="mb-3">{quote.comment}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      作成: {formatDate(quote.generatedAt)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuote(quote.originalTweet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePostQuote(quote)}
                        disabled={isPosting || todayQuoteCount >= maxDailyQuotes}
                      >
                        {isPosting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        投稿する
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
