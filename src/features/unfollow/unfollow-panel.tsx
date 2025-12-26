"use client"

import { useState, useEffect } from "react"
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
import { useAppContext } from "@/store/app-context"
import { useXApi } from "@/hooks/use-x-api"
import {
  UserMinus,
  Users,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  Loader2,
} from "lucide-react"

export function UnfollowPanel() {
  const { state } = useAppContext()
  const { fetchOneWayFollowing, batchUnfollow, isLoading } = useXApi()
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [unfollowProgress, setUnfollowProgress] = useState(0)
  const [isUnfollowing, setIsUnfollowing] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const oneWayFollowing = state.oneWayFollowing

  // 初回読み込み
  useEffect(() => {
    if (!hasFetched && state.currentUser) {
      handleRefresh()
      setHasFetched(true)
    }
  }, [state.currentUser, hasFetched])

  const handleRefresh = async () => {
    setSelectedUsers(new Set())
    await fetchOneWayFollowing()
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
    setUnfollowProgress(0)

    await batchUnfollow(
      Array.from(selectedUsers),
      (completed, total) => {
        setUnfollowProgress((completed / total) * 100)
      }
    )

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
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading.following}
            >
              {isLoading.following ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
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
                <Loader2 className="h-4 w-4 animate-spin" />
                フォロー解除中...
              </div>
              <Progress value={unfollowProgress} />
            </div>
          )}

          {isLoading.following ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : oneWayFollowing.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              片思いフォローはありません
            </div>
          ) : (
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
                      disabled={isUnfollowing}
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
          )}

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
              {isUnfollowing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4 mr-2" />
              )}
              選択したアカウントをフォロー解除 ({selectedUsers.size})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
