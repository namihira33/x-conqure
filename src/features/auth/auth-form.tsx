"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppContext, useAppActions } from "@/store/app-context"
import { useXApi } from "@/hooks/use-x-api"
import { saveCredentials, loadCredentials } from "@/lib/storage"
import { KeyRound, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"

export function AuthForm() {
  const { state } = useAppContext()
  const { setCredentials } = useAppActions()
  const { verifyCredentials, isLoading, error } = useXApi()
  const [showSecrets, setShowSecrets] = useState(false)
  const [formData, setFormData] = useState({
    apiKey: "",
    apiSecret: "",
    accessToken: "",
    accessTokenSecret: "",
    bearerToken: "",
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // 保存済み認証情報の読み込み
  useEffect(() => {
    const saved = loadCredentials()
    if (saved) {
      setFormData({
        apiKey: saved.apiKey,
        apiSecret: saved.apiSecret,
        accessToken: saved.accessToken,
        accessTokenSecret: saved.accessTokenSecret,
        bearerToken: saved.bearerToken || "",
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.apiKey || !formData.apiSecret || !formData.accessToken || !formData.accessTokenSecret) {
      setValidationError("必須フィールドをすべて入力してください")
      return
    }

    setValidationError(null)
    setIsVerifying(true)

    const credentials = {
      apiKey: formData.apiKey,
      apiSecret: formData.apiSecret,
      accessToken: formData.accessToken,
      accessTokenSecret: formData.accessTokenSecret,
      bearerToken: formData.bearerToken || undefined,
    }

    // 認証情報を保存してセット
    setCredentials(credentials)
    saveCredentials(credentials)

    // API認証を検証
    const success = await verifyCredentials()
    setIsVerifying(false)

    if (!success) {
      setValidationError("認証に失敗しました。認証情報を確認してください。")
    }
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setValidationError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">X API 認証設定</CardTitle>
          </div>
          <CardDescription>
            X (Twitter) Developer Portalで取得したAPI認証情報を入力してください。
            この情報はローカルに保存され、外部に送信されません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(validationError || error) && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {validationError || error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Consumer Key) *</Label>
              <Input
                id="apiKey"
                type={showSecrets ? "text" : "password"}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.apiKey}
                onChange={handleChange("apiKey")}
                disabled={isVerifying}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret (Consumer Secret) *</Label>
              <Input
                id="apiSecret"
                type={showSecrets ? "text" : "password"}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.apiSecret}
                onChange={handleChange("apiSecret")}
                disabled={isVerifying}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token *</Label>
              <Input
                id="accessToken"
                type={showSecrets ? "text" : "password"}
                placeholder="xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.accessToken}
                onChange={handleChange("accessToken")}
                disabled={isVerifying}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessTokenSecret">Access Token Secret *</Label>
              <Input
                id="accessTokenSecret"
                type={showSecrets ? "text" : "password"}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.accessTokenSecret}
                onChange={handleChange("accessTokenSecret")}
                disabled={isVerifying}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bearerToken">Bearer Token (任意)</Label>
              <Input
                id="bearerToken"
                type={showSecrets ? "text" : "password"}
                placeholder="AAAAAAAAAAAAAAAAAAAAAxxxxxxxxxx..."
                value={formData.bearerToken}
                onChange={handleChange("bearerToken")}
                disabled={isVerifying}
              />
              <p className="text-xs text-muted-foreground">
                Bearer Tokenは一部の読み取り専用エンドポイントで使用されます
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
                disabled={isVerifying}
              >
                {showSecrets ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    シークレットを隠す
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    シークレットを表示
                  </>
                )}
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  認証中...
                </>
              ) : (
                "認証情報を保存して開始"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">API認証情報の取得方法</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>X Developer Portalにアクセス</li>
              <li>プロジェクトを作成またはアプリを登録</li>
              <li>「Keys and tokens」セクションで認証情報を生成</li>
              <li>OAuth 1.0a設定を有効化（読み書き権限が必要）</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
