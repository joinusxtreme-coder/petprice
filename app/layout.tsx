import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://petprices.jp';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "ペットプライス | ペット用品の最安値比較",
    template: "%s | ペットプライス",
  },
  verification: {
    google: 'uvGficZwe-DyzWv7Ek8kOMWTHBVPickTWFSNBxV_r7o',
  },
  description: "楽天市場のドッグフード・キャットフードを毎日自動取得。30日間の価格推移グラフで最安値・買い時がわかる比較サイト。",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: BASE_URL,
    siteName: 'ペットプライス',
    title: 'ペットプライス | ペット用品の最安値比較',
    description: '楽天市場のドッグフード・キャットフードを毎日自動取得。30日間の価格推移グラフで最安値・買い時がわかる比較サイト。',
    images: [],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ペットプライス | ペット用品の最安値比較',
    description: '楽天市場のドッグフード・キャットフードを毎日自動取得。価格推移グラフで最安値がわかる比較サイト。',
    images: [],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[var(--font-noto)]">
        <GoogleAnalytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
