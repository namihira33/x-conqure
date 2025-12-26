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
import { useAppContext, useAppActions } from "@/store/app-context"
import { XUser, SCIENCE_COMM_CATEGORIES } from "@/types"
import {
  Search,
  UserPlus,
  Users,
  RefreshCw,
  CheckSquare,
  Square,
  Filter,
} from "lucide-react"

// デモ用のモックデータ
const mockSearchResults: XUser[] = [
  {
    id: "101",
    username: "sci_comm_researcher",
    name: "科学コミュニケーション研究者",
    description: "科学コミュニケーションについて研究しています。異分野交流に興味があります。博士課程在籍中。",
    profileImageUrl: "",
    followersCount: 2345,
    followingCount: 890,
    verified: false,
    isFollowing: false,
    isFollowedBy: false,
  },
  {
    id: "102",
    username: "interdisciplinary_lab",
    name: "学際研究室",
    description: "様々な分野の研究者が集まる学際研究室の公式アカウント。サイエンスカフェも定期開催。",
    profileImageUrl: "",
    followersCount: 8901,
    followingCount: 456,
    verified: true,
    isFollowing: false,
    isFollowedBy: false,
  },
  {
    id: "103",
    username: "stem_student_network",
    name: "STEM学生ネットワーク",
    description: "理系学生の交流を促進する学生団体です。イベントや勉強会を企画しています。",
    profileImageUrl: "",
    followersCount: 5678,
    followingCount: 234,
    verified: false,
    isFollowing: false,
    isFollowedBy: true,
  },
  {
    id: "104",
    username: "outreach_phd",
    name: "アウトリーチ好きな博士",
    description: "研究の傍ら、一般向けの科学イベントを企画。サイエンスコミュニケーションに情熱を持っています。",
    profileImageUrl: "",
    followersCount: 1234,
    followingCount: 567,
    verified: false,
    isFollowing: false,
    isFollowedBy: false,
  },
]

export function DiscoverPanel() {
  const { state } = useAppContext()
  const { setSearchResults, addToFollowing, setLoading } = useAppActions()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [followProgress, setFollowProgress] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // デモ用：実際のデータがない場合はモックを使用
  const searchResults = state.searchResults.length > 0
    ? state.searchResults
    : mockSearchResults

  const handleSearch = () => {
    setLoading("search", true)
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      setSearchResults(mockSearchResults)
      setLoading("search", false)
    }, 1000)
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
    const total = selectedUsers.size
    let completed = 0

    for (const userId of selectedUsers) {
      const user = searchResults.find(u => u.id === userId)
      if (user) {
        // 実際のAPIコールをシミュレート
        await new Promise((resolve) => setTimeout(resolve, 500))
        addToFollowing({ ...user, isFollowing: true })
        completed++
        setFollowProgress((completed / total) * 100)
      }
    }

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
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
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
                <RefreshCw className="h-4 w-4 animate-spin" />
                フォロー中...
              </div>
              <Progress value={followProgress} />
            </div>
          )}

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
                    disabled={user.isFollowing}
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

          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={handleBatchFollow}
              disabled={selectedUsers.size === 0 || isFollowing}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              選択したアカウントをフォロー ({selectedUsers.size})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
