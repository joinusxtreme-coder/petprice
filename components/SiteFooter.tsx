import Link from 'next/link';
import { SIDEBAR_GROUPS, CATEGORY_CONFIG } from '@/lib/categories';

export default function SiteFooter() {
  return (
    <footer className="bg-[#333] text-white mt-6 py-4 px-3 text-xs text-[#aaa]">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 mb-3">
        {SIDEBAR_GROUPS.map((section) => (
          <div key={section.label}>
            <p className="font-bold text-white mb-1">{section.label}</p>
            {section.subgroups.flatMap((sub) => sub.keys).map((key) => (
              <Link key={key} href={`/${key}`} className="block text-[#aaa] hover:text-white mb-0.5">
                {CATEGORY_CONFIG[key].label}
              </Link>
            ))}
          </div>
        ))}
        <div>
          <p className="font-bold text-white mb-1">サービス</p>
          <Link href="/ranking" className="block text-[#aaa] hover:text-white mb-0.5">🏆 ランキング</Link>
          <Link href="/compare" className="block text-[#aaa] hover:text-white mb-0.5">⚖️ 価格比較</Link>
          <Link href="/column" className="block text-[#aaa] hover:text-white mb-0.5">📝 コラム</Link>
          <Link href="/community" className="block text-[#aaa] hover:text-white mb-0.5">💬 コミュニティ</Link>
          <Link href="/mypage" className="block text-[#aaa] hover:text-white mb-0.5">👤 マイページ</Link>
        </div>
      </div>
      <div className="border-t border-[#555] pt-3 text-center">
        <p>ペットプライス - ペット用品 通販・価格比較</p>
        <p className="mt-1">楽天市場の商品情報を毎日自動取得・比較。※ 価格は実際の価格と異なる場合があります。</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/column" className="hover:text-white">コラム</Link>
          <Link href="/community" className="hover:text-white">コミュニティ</Link>
          <Link href="/ranking" className="hover:text-white">ランキング</Link>
          <Link href="/search" className="hover:text-white">商品検索</Link>
        </div>
      </div>
    </footer>
  );
}
