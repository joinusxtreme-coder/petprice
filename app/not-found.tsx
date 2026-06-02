import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-3 py-12 text-center">
        <div className="bg-white border border-[#ddd] p-10 inline-block w-full max-w-md mx-auto">
          <p className="text-6xl mb-4">🐾</p>
          <h1 className="text-2xl font-bold text-[#333] mb-2">404 - ページが見つかりません</h1>
          <p className="text-sm text-[#666] mb-6 leading-relaxed">
            お探しのページは存在しないか、移動・削除された可能性があります。
          </p>
          <Link
            href="/"
            className="inline-block bg-[#FF6600] text-white text-sm font-bold px-6 py-2.5 hover:bg-[#e55a00] transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
