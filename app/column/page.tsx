import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { COLUMNS } from '@/lib/columns';
import { SIDEBAR_GROUPS, CATEGORY_CONFIG } from '@/lib/categories';

export const metadata = {
  title: 'ペット用品コラム | ペットプライス',
  description: 'ドッグフード・キャットフードの選び方、成分解説など、ペット用品に関する専門コラムをお届けします。',
};

export default function ColumnListPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />
      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-5xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <span>コラム</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* Sidebar */}
        <aside className="w-44 shrink-0 hidden md:block">
          {SIDEBAR_GROUPS.map((section) => (
            <div key={section.label} className="border border-[#ddd] border-b-0 mb-0">
              <div className="bg-[#FF6600] text-white text-xs font-bold px-2 py-1.5">{section.label}</div>
              {section.subgroups.map((sub) => (
                <div key={sub.label}>
                  <div className="bg-[#f5f5f5] text-[#666] text-xs px-2 py-1 border-t border-[#eee] font-bold">{sub.label}</div>
                  {sub.keys.map((key) => {
                    const c = CATEGORY_CONFIG[key];
                    return (
                      <Link key={key} href={`/${key}`} className="block px-3 py-1.5 text-xs text-[#0058B3] hover:text-[#FF6600] hover:bg-[#FFF5EE] border-t border-[#eee] transition-colors">
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
              <div className="border-t border-[#eee]" />
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border border-[#ddd] mb-3">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h1 className="text-sm font-bold text-[#333]">📝 ペット用品コラム</h1>
              <p className="text-xs text-[#999] mt-0.5">フード選びのコツ・成分解説など専門知識をお届け</p>
            </div>
            <div className="divide-y divide-[#eee]">
              {COLUMNS.map((col) => (
                <Link key={col.slug} href={`/column/${col.slug}`} className="flex gap-3 px-4 py-4 hover:bg-[#FFFBF7] transition-colors group">
                  <div className="w-10 h-10 bg-[#FF6600] text-white flex items-center justify-center text-xl shrink-0 font-bold">
                    {col.category === 'ドッグフード' ? '🐕' : col.category === 'キャットフード' ? '🐈' : '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-[#EEF5FF] text-[#0058B3] px-1.5 py-0.5 font-bold">{col.category}</span>
                      <span className="text-xs text-[#999]">{col.date}</span>
                    </div>
                    <h2 className="text-sm font-bold text-[#0058B3] group-hover:underline leading-snug mb-1">{col.title}</h2>
                    <p className="text-xs text-[#666] line-clamp-2">{col.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
