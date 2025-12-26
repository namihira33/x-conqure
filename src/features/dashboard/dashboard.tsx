"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppContext, useAppActions } from "@/store/app-context"
import { UnfollowPanel } from "@/features/unfollow/unfollow-panel"
import { DiscoverPanel } from "@/features/discover/discover-panel"
import { LikesPanel } from "@/features/likes/likes-panel"
import { QuoteRetweetPanel } from "@/features/quote-retweet/quote-retweet-panel"
import {
  UserMinus,
  UserPlus,
  Heart,
  Quote,
  Settings,
  LogOut,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react"

export function Dashboard() {
  const { state } = useAppContext()
  const { clearCredentials } = useAppActions()
  const [activeTab, setActiveTab] = useState("unfollow")

  // デモ用のダミーユーザー情報
  const currentUser = state.currentUser || {
    id: "0",
    username: "tgn_official",
    name: "TGN - 超異分野な学生団体",
    description: "異分野交流を促進する学生団体です",
    profileImageUrl: "",
    followersCount: 1234,
    followingCount: 567,
    verified: false,
    isFollowing: false,
    isFollowedBy: false,
  }

  const handleLogout = () => {
    clearCredentials()
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* ヘッダー */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                X Conqure
              </h1>
              <Badge variant="outline" className="hidden md:inline-flex">
                X攻略ツール
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.profileImageUrl} />
                  <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ログアウト</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="container py-6">
          {/* ステータスカード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentUser.followersCount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">フォロワー</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentUser.followingCount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">フォロー中</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <UserMinus className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{state.oneWayFollowing.length || 12}</p>
                    <p className="text-xs text-muted-foreground">片思いフォロー</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-muted-foreground">本日の投稿枠</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* メインタブ */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="unfollow" className="gap-2">
                <UserMinus className="h-4 w-4" />
                <span className="hidden sm:inline">フォロー解除</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">発見・フォロー</span>
              </TabsTrigger>
              <TabsTrigger value="likes" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">いいね</span>
              </TabsTrigger>
              <TabsTrigger value="quote" className="gap-2">
                <Quote className="h-4 w-4" />
                <span className="hidden sm:inline">引用RT</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unfollow" className="space-y-4">
              <UnfollowPanel />
            </TabsContent>

            <TabsContent value="discover" className="space-y-4">
              <DiscoverPanel />
            </TabsContent>

            <TabsContent value="likes" className="space-y-4">
              <LikesPanel />
            </TabsContent>

            <TabsContent value="quote" className="space-y-4">
              <QuoteRetweetPanel />
            </TabsContent>
          </Tabs>
        </main>

        {/* フッター */}
        <footer className="border-t py-6 mt-auto">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              X Conqure - 超異分野な学生団体のためのX攻略ツール
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>ローカル実行専用</span>
              <Separator orientation="vertical" className="h-4" />
              <span>API認証情報は端末内に保存</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}
