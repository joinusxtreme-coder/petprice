import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "ペットプライス🐾 | ペット用品の最安値比較",
  description: "楽天市場のペット用品を毎日自動取得。価格推移グラフで最安値・買い時がわかる比較サイト。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[var(--font-noto)]">{children}</body>
    </html>
  );
}
