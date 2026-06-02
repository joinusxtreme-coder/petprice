'use client';

import { useEffect, useState } from 'react';

// 全広告ライブラリ（左右で重複しないようindex管理）
const ALL_ADS = [
  // 0: モグワン
  {
    id: 'mogwan',
    petTypes: ['dog', 'other'],
    bg: '#FFF9F0', border: '#FFD700',
    title: '🐕 プレミアムドッグフード『モグワン』',
    body: 'グレインフリー・チキン生肉とサーモン使用。獣医師も推奨する本格フード。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1',
    btnColor: '#FF6600', btnText: '詳しく見る →',
    pixel: 'https://www18.a8.net/0.gif?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1',
  },
  // 1: 馬肉自然づくり
  {
    id: 'uma',
    petTypes: ['dog', 'other'],
    bg: '#FFF5E6', border: '#DEB887',
    title: '🐕 馬刺し専門店の本格ドッグフード',
    body: '馬肉自然づくり。添加物不使用・新鮮馬肉を贅沢使用。安心・安全な国産フード。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK6+13W2B6+3E6W+NVWSI',
    btnColor: '#8B4513', btnText: '公式で購入する →',
    pixel: 'https://www10.a8.net/0.gif?a8mat=4B5LK6+13W2B6+3E6W+NVWSI',
  },
  // 2: Dr.ケアワン
  {
    id: 'drcare',
    petTypes: ['dog', 'other'],
    bg: '#F0FFF0', border: '#4CAF50',
    title: '🐕 国産無添加ドッグフード「Dr.ケアワン」',
    body: '獣医師監修・国産素材100%使用。愛犬の健康を守る安心フード。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK6+12P73M+3RW8+BWVTE',
    btnColor: '#4CAF50', btnText: '詳細を確認する →',
    pixel: 'https://www14.a8.net/0.gif?a8mat=4B5LK6+12P73M+3RW8+BWVTE',
  },
  // 3: Catlog
  {
    id: 'catlog',
    petTypes: ['cat'],
    bg: '#F0F8FF', border: '#ADD8E6',
    title: '🐱 愛猫の健康を24時間見守る【Catlog】',
    body: '首輪型デバイスで活動量・睡眠・食事を自動記録。体調変化も見逃しません。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK6+123RHU+4WPO+5YJRM',
    btnColor: '#5B9BD5', btnText: '公式サイトへ →',
    pixel: 'https://www14.a8.net/0.gif?a8mat=4B5LK6+123RHU+4WPO+5YJRM',
  },
  // 4: Catlog Board
  {
    id: 'catlog-board',
    petTypes: ['cat'],
    bg: '#F0F8FF', border: '#90CAF9',
    title: '🐱 乗るだけで体重測定【Catlog Board】',
    body: '愛猫の体重・体調を毎日自動記録。ダイエットや早期発見に。獣医への相談にも。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK6+123RHU+4WPO+63OYA',
    btnColor: '#5B9BD5', btnText: '詳しく見る →',
    pixel: 'https://www14.a8.net/0.gif?a8mat=4B5LK6+123RHU+4WPO+63OYA',
  },
  // 5: 保険（共通）
  {
    id: 'insurance',
    petTypes: ['dog', 'cat', 'other'],
    bg: '#E8F4FD', border: '#2196F3',
    title: '🛡️ ペット保険を一括比較',
    body: '医療費の急な出費に備えよう。国内主要ペット保険を無料で比較・シミュレーション。',
    href: '/insurance',
    btnColor: '#2196F3', btnText: '無料で比較する →',
    pixel: null,
    isInternal: true,
  },
  // 6: モグワン（別クリエイティブ）
  {
    id: 'mogwan2',
    petTypes: ['dog', 'cat', 'other'],
    bg: '#FFFDE7', border: '#FFC107',
    title: '手作りレシピを追求した犬用プレミアムフード',
    body: '『モグワン』グレインフリー・鮮度の高いチキンとサーモンを贅沢に使用。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BN3TU',
    btnColor: '#FF8800', btnText: 'モグワン公式へ →',
    pixel: 'https://www17.a8.net/0.gif?a8mat=4B5LK5+GCTQ2A+3J8+1BN3TU',
  },
];

function AdCard({ ad }: { ad: typeof ALL_ADS[number] }) {
  return (
    <div style={{ background: ad.bg, borderColor: ad.border }} className="border rounded p-3">
      <p className="text-xs font-bold text-[#333] leading-snug">{ad.title}</p>
      <p className="text-xs text-[#666] leading-relaxed mt-1 mb-2">{ad.body}</p>
      <a
        href={ad.href}
        rel={ad.isInternal ? undefined : 'nofollow'}
        target={ad.isInternal ? undefined : '_blank'}
        style={{ background: ad.btnColor }}
        className="block text-white text-xs font-bold px-2 py-1.5 rounded text-center"
      >
        {ad.btnText}
      </a>
      {ad.pixel && (
        // eslint-disable-next-line @next/next/no-img-element
        <img width={1} height={1} src={ad.pixel} alt="" style={{ border: 0 }} />
      )}
    </div>
  );
}

interface Props {
  petType: string;
  /** 'left' or 'right' — 左右で異なる広告を表示するためのオフセット */
  position: 'left' | 'right';
  /** 秒単位でのローテーション間隔（デフォルト20秒）*/
  intervalSec?: number;
}

export default function AdRotator({ petType, position, intervalSec = 20 }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  // カテゴリに合う広告だけフィルタ
  const eligible = ALL_ADS.filter(ad =>
    ad.petTypes.includes(petType) || ad.petTypes.includes('other')
  );

  useEffect(() => {
    // 初期表示：右は左と2つずらして別の広告を表示
    const offset = position === 'right' ? Math.floor(eligible.length / 2) : 0;
    const initial = (Math.floor(Math.random() * eligible.length) + offset) % eligible.length;
    setIndex(initial);

    // インターバルで自動ローテーション
    const timer = setInterval(() => {
      setIndex(prev => prev === null ? 0 : (prev + 1) % eligible.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [petType, position, intervalSec, eligible.length]);

  if (index === null) {
    // SSR時は空（hydration mismatch回避）
    return (
      <div className="bg-white border border-[#ddd] p-2 h-24 animate-pulse rounded">
        <div className="bg-[#eee] h-3 rounded w-3/4 mb-2" />
        <div className="bg-[#eee] h-3 rounded w-full mb-2" />
        <div className="bg-[#ddd] h-6 rounded" />
      </div>
    );
  }

  const ad = eligible[index];

  return (
    <div className="bg-white border border-[#ddd] p-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-[#999] font-bold">PR</span>
        <span className="text-[10px] text-[#999]">広告</span>
      </div>
      <AdCard ad={ad} />
      <p className="text-[10px] text-[#999] mt-1 text-center">
        {ad.isInternal ? '※サイト内コンテンツ' : '※アフィリエイト広告'}
      </p>
    </div>
  );
}
