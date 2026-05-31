import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { COLUMNS, getColumn } from '@/lib/columns';
import { SIDEBAR_GROUPS, CATEGORY_CONFIG } from '@/app/[category]/page';

export function generateStaticParams() {
  return COLUMNS.map((col) => ({ slug: col.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const col = getColumn(slug);
  if (!col) return {};
  return {
    title: col.title,
    description: col.description,
    openGraph: { title: col.title, description: col.description },
  };
}

export default async function ColumnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const col = getColumn(slug);
  if (!col) notFound();

  const otherColumns = COLUMNS.filter((c) => c.slug !== slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />
      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-5xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <Link href="/column" className="text-[#0058B3] hover:underline">コラム</Link>
          <span className="mx-1">{'>'}</span>
          <span className="line-clamp-1">{col.title.slice(0, 30)}...</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* Sidebar */}
        <aside className="w-44 shrink-0 hidden md:block space-y-2">
          <div className="bg-white border border-[#ddd]">
            <div className="bg-[#0058B3] text-white text-xs font-bold px-2 py-1.5">関連コラム</div>
            {otherColumns.map((c) => (
              <Link key={c.slug} href={`/column/${c.slug}`} className="block px-2 py-2 text-xs text-[#0058B3] hover:text-[#FF6600] hover:bg-[#FFF5EE] border-t border-[#eee] line-clamp-2 leading-snug transition-colors">
                {c.title}
              </Link>
            ))}
            <Link href="/column" className="block text-center text-xs text-[#0058B3] py-2 border-t border-[#eee] hover:underline">
              コラム一覧 →
            </Link>
          </div>
          {SIDEBAR_GROUPS.map((section) => (
            <div key={section.label} className="border border-[#ddd] border-b-0">
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
          <article className="bg-white border border-[#ddd]">
            <div className="px-4 py-4 border-b border-[#ddd]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-[#EEF5FF] text-[#0058B3] px-1.5 py-0.5 font-bold">{col.category}</span>
                <span className="text-xs text-[#999]">{col.date} ｜ {col.author}</span>
              </div>
              <h1 className="text-base font-bold text-[#333] leading-snug">{col.title}</h1>
              <p className="text-xs text-[#666] mt-2 border-l-4 border-[#FF6600] pl-2">{col.description}</p>
            </div>
            <div
              className="px-4 py-4 text-sm text-[#333] leading-relaxed column-body"
              dangerouslySetInnerHTML={{ __html: col.body }}
            />
            <style>{`
              .column-body h2 { font-size: 15px; font-weight: bold; color: #333; border-left: 4px solid #FF6600; padding-left: 10px; margin: 24px 0 12px; }
              .column-body h3 { font-size: 13px; font-weight: bold; color: #555; margin: 16px 0 8px; }
              .column-body p { margin-bottom: 12px; line-height: 1.8; }
              .column-body ul { margin: 8px 0 12px 20px; }
              .column-body li { margin-bottom: 4px; list-style: disc; }
              .column-body strong { color: #CC0000; }
            `}</style>
            <div className="px-4 py-3 border-t border-[#ddd] bg-[#f8f8f8]">
              <Link href="/column" className="text-xs text-[#0058B3] hover:underline">← コラム一覧に戻る</Link>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
