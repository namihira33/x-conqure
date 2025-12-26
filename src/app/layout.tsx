import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "X Conqure - X攻略ツール",
  description: "超異分野な学生団体のためのX攻略ツール。片思いフォロー解除、関連アカウント発見、いいね管理、引用リツイート作成をサポート。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
