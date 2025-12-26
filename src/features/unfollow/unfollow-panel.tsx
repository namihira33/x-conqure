"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { XUser } from "@/types"
import {
  UserMinus,
  Users,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react"

// デモ用のモックデータ
const mockOneWayFollowing: XUser[] = [
  {
    id: "1",
    username: "science_lover_01",
    name: "科学好きな人",
    description: "科学のことをつぶやきます",
    profileImageUrl: "",
    followersCount: 1234,
    followingCount: 567,
    verified: false,
    isFollowing: true,
    isFollowedBy: false,
  },
  {
    id: "2",
    username: "tech_news_jp",
    name: "テックニュース",
    description: "最新のテクノロジーニュースをお届け",
    profileImageUrl: "",
    followersCount: 45678,
    followingCount: 123,
    verified: true,
    isFollowing: true,
    isFollowedBy: false,
  },
  {
    id: "3",
    username: "random_user_123",
    name: "ランダムユーザー",
    description: "よろしくお願いします",
    profileImageUrl: "",
    followersCount: 89,
    followingCount: 1234,
    verified: false,
    isFollowing: true,
    isFollowedBy: false,
  },
]

export function UnfollowPanel() {
  const { state } = useAppContext()
  const { setOneWayFollowing, removeFromFollowing, setLoading } = useAppActions()
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [unfollowProgress, setUnfollowProgress] = useState(0)
  const [isUnfollowing, setIsUnfollowing] = useState(false)

  // デモ用：実際のデータがない場合はモックを使用
  const oneWayFollowing = state.oneWayFollowing.length > 0
    ? state.oneWayFollowing
    : mockOneWayFollowing

  const handleRefresh = () => {
    setLoading("following", true)
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      setOneWayFollowing(mockOneWayFollowing)
      setLoading("following", false)
    }, 1000)
  }

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const selectAll = () => {
    setSelectedUsers(new Set(oneWayFollowing.map((u) => u.id)))
  }

  const deselectAll = () => {
    setSelectedUsers(new Set())
  }

  const handleBatchUnfollow = async () => {
    if (selectedUsers.size === 0) return

    setIsUnfollowing(true)
    const total = selectedUsers.size
    let completed = 0

    for (const userId of selectedUsers) {
      // 実際のAPIコールをシミュレート
      await new Promise((resolve) => setTimeout(resolve, 500))
      removeFromFollowing(userId)
      completed++
      setUnfollowProgress((completed / total) * 100)
    }

    setSelectedUsers(new Set())
    setIsUnfollowing(false)
    setUnfollowProgress(0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5" />
                片思いフォロー解除
              </CardTitle>
              <CardDescription>
                あなたがフォローしているが、フォローバックされていないアカウント
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              更新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {oneWayFollowing.length} 件
              </Badge>
              <Badge variant="outline">
                {selectedUsers.size} 件選択中
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

          {isUnfollowing && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                フォロー解除中...
              </div>
              <Progress value={unfollowProgress} />
            </div>
          )}

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {oneWayFollowing.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedUsers.has(user.id)
                      ? "bg-primary/5 border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => toggleSelectUser(user.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback>
                      {user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{user.name}</span>
                      {user.verified && (
                        <Badge variant="secondary" className="text-xs">
                          認証済み
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      @{user.username}
                    </span>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {user.description}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{user.followersCount.toLocaleString()} フォロワー</div>
                    <div>{user.followingCount.toLocaleString()} フォロー中</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-3 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              フォロー解除は取り消せません。慎重に実行してください。
            </div>
            <Button
              onClick={handleBatchUnfollow}
              disabled={selectedUsers.size === 0 || isUnfollowing}
              variant="destructive"
              className="w-full"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              選択したアカウントをフォロー解除 ({selectedUsers.size})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
