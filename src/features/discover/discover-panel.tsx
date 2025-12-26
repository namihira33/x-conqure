"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { SCIENCE_COMM_CATEGORIES } from "@/types"
import {
  Search,
  UserPlus,
  Users,
  CheckSquare,
  Square,
  Filter,
  Loader2,
} from "lucide-react"

export function DiscoverPanel() {
  const { state } = useAppContext()
  const { searchUsers, batchFollow, isLoading } = useXApi()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [followProgress, setFollowProgress] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const searchResults = state.searchResults

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    // カテゴリも検索クエリに追加
    let query = searchQuery
    if (selectedCategories.size > 0) {
      const categoryTerms = Array.from(selectedCategories).join(" OR ")
      query = `${searchQuery} (${categoryTerms})`
    }

    setSelectedUsers(new Set())
    await searchUsers(query)
  }

  const toggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(category)) {
      newSelected.delete(category)
    } else {
      newSelected.add(category)
    }
    setSelectedCategories(newSelected)
  }

  const toggleSelectUser = (userId: string) => {
    const user = searchResults.find(u => u.id === userId)
    if (user?.isFollowing) return

    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const selectAll = () => {
    setSelectedUsers(new Set(searchResults.filter(u => !u.isFollowing).map((u) => u.id)))
  }

  const deselectAll = () => {
    setSelectedUsers(new Set())
  }

  const handleBatchFollow = async () => {
    if (selectedUsers.size === 0) return

    setIsFollowing(true)
    setFollowProgress(0)

    await batchFollow(
      Array.from(selectedUsers),
      (completed, total) => {
        setFollowProgress((completed / total) * 100)
      }
    )

    setSelectedUsers(new Set())
    setIsFollowing(false)
    setFollowProgress(0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            アカウント検索・一括フォロー
          </CardTitle>
          <CardDescription>
            異分野コミュニケーション・サイエンスコミュニケーション関連のアカウントを検索してフォロー
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="キーワードで検索..."
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
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <Card className="p-4">
                <h4 className="font-medium mb-3">カテゴリフィルター</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SCIENCE_COMM_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.has(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {searchResults.length} 件
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
        </CardHeader>
        <CardContent>
          {isFollowing && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                フォロー中...
              </div>
              <Progress value={followProgress} />
            </div>
          )}

          {isLoading.search ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              キーワードを入力して検索してください
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedUsers.has(user.id)
                        ? "bg-primary/5 border-primary/20"
                        : "hover:bg-muted"
                    } ${user.isFollowing ? "opacity-50" : ""}`}
                  >
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleSelectUser(user.id)}
                      disabled={user.isFollowing || isFollowing}
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
                        {user.isFollowing && (
                          <Badge variant="outline" className="text-xs">
                            フォロー中
                          </Badge>
                        )}
                        {user.isFollowedBy && (
                          <Badge className="text-xs">
                            フォローされています
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
            <Button
              onClick={handleBatchFollow}
              disabled={selectedUsers.size === 0 || isFollowing}
              className="w-full"
            >
              {isFollowing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              選択したアカウントをフォロー ({selectedUsers.size})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
