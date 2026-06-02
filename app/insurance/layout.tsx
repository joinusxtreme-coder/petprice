import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ペット保険 一括比較シミュレーター',
  description: '主要5社のペット保険料を犬・猫の年齢別に比較。最安値プランをすぐ確認できる無料シミュレーター。アニコム・SBIいきいき・アクサなど。',
  openGraph: {
    title: 'ペット保険 一括比較シミュレーター | ペットプライス',
    description: '主要5社のペット保険料を年齢・種類別に比較。最安値プランをすぐ確認。',
  },
};

export default function InsuranceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
