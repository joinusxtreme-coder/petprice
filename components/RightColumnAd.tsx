'use client';

import { useEffect, useState } from 'react';

interface Props {
  petType: string;
}

// 保険広告（共通）
const InsuranceAd = () => (
  <div className="bg-[#E8F4FD] border border-[#2196F3] rounded p-3">
    <p className="text-xs font-bold text-[#1565C0] leading-snug">🛡️ ペット保険を比較しよう</p>
    <p className="text-xs text-[#555] leading-relaxed mt-1 mb-2">
      医療費の急な出費に備えて。国内主要ペット保険を一括比較。
    </p>
    <a href="/insurance" className="block bg-[#2196F3] text-white text-xs font-bold px-2 py-1.5 rounded text-center">
      無料で比較する →
    </a>
  </div>
);

const dogAds = [
  {
    key: 'd0',
    bg: '#FFF9F0', border: '#FFD700',
    title: '🐕 プレミアムドッグフード『モグワン』',
    body: 'グレインフリー・チキン生肉とサーモン使用。獣医師も推奨するプレミアムフード。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1',
    btnColor: '#FF6600',
    pixel: 'https://www18.a8.net/0.gif?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1',
  },
  {
    key: 'd1',
    bg: '#FFF5E6', border: '#DEB887',
    title: '🐕 馬刺し専門店のドッグフード『馬肉自然づくり』',
    body: '添加物不使用・新鮮馬肉使用の国産ドッグフード。本場熊本から直送。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK6+13W2B6+3E6W+NVWSI',
    btnColor: '#8B4513',
    pixel: 'https://www10.a8.net/0.gif?a8mat=4B5LK6+13W2B6+3E6W+NVWSI',
  },
  {
    key: 'd2',
    bg: '#F0FFF0', border: '#4CAF50',
    title: '🐕 国産無添加ドッグフード「Dr.ケアワン」',
    body: '獣医師監修・国産素材100%使用の安心フード。愛犬の健康を守る。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK6+12P73M+3RW8+BWVTE',
    btnColor: '#4CAF50',
    pixel: 'https://www14.a8.net/0.gif?a8mat=4B5LK6+12P73M+3RW8+BWVTE',
  },
  // 保険広告（インデックス3）
  null,
];

const catAds = [
  {
    key: 'c0',
    bg: '#F0F8FF', border: '#ADD8E6',
    title: '🐱 愛猫の健康を24時間見守る【Catlog】',
    body: '首輪型デバイスで活動量・睡眠・食事を自動記録。体調変化も見逃しません。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK6+123RHU+4WPO+5YJRM',
    btnColor: '#5B9BD5',
    pixel: 'https://www14.a8.net/0.gif?a8mat=4B5LK6+123RHU+4WPO+5YJRM',
  },
  {
    key: 'c1',
    bg: '#F0F8FF', border: '#ADD8E6',
    title: '🐱 体重・体調を毎日記録【Catlog Board】',
    body: '乗るだけで体重測定。ダイエット・体調管理に。早期発見に役立てよう。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK6+123RHU+4WPO+63OYA',
    btnColor: '#5B9BD5',
    pixel: 'https://www14.a8.net/0.gif?a8mat=4B5LK6+123RHU+4WPO+63OYA',
  },
  {
    key: 'c2',
    bg: '#FFF9F0', border: '#FFD700',
    title: '🐕 プレミアムドッグフード『モグワン』',
    body: 'グレインフリー・獣医師推奨フード。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1',
    btnColor: '#FF6600',
    pixel: 'https://www18.a8.net/0.gif?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1',
  },
  // 保険広告（インデックス3）
  null,
];

export default function RightColumnAd({ petType }: Props) {
  const [adIndex, setAdIndex] = useState<number>(0);

  useEffect(() => {
    // ページロードのたびにランダムで広告を選択
    setAdIndex(Math.floor(Math.random() * 4));
  }, []);

  const ads = petType === 'cat' ? catAds : dogAds;
  const ad = ads[adIndex];

  // 保険広告（インデックス3の場合）
  if (ad === null) {
    return (
      <div className="bg-white border border-[#ddd] p-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[#999] font-bold">PR</span>
          <span className="text-[10px] text-[#999]">広告</span>
        </div>
        <InsuranceAd />
        <p className="text-[10px] text-[#999] mt-1 text-center">※サイト内コンテンツ</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#ddd] p-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-[#999] font-bold">PR</span>
        <span className="text-[10px] text-[#999]">広告</span>
      </div>
      <div style={{ background: ad.bg, borderColor: ad.border }} className="border rounded p-3">
        <p className="text-xs font-bold text-[#333] leading-snug">{ad.title}</p>
        <p className="text-xs text-[#666] leading-relaxed mt-1 mb-2">{ad.body}</p>
        <a href={ad.href} rel="nofollow" target="_blank"
           style={{ background: ad.btnColor }}
           className="block text-white text-xs font-bold px-2 py-1.5 rounded text-center">
          詳しく見る →
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={1} height={1} src={ad.pixel} alt="" style={{ border: 0 }} />
      </div>
      <p className="text-[10px] text-[#999] mt-1 text-center">※アフィリエイト広告</p>
    </div>
  );
}
