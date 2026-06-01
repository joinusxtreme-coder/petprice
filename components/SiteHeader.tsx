'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { SIDEBAR_GROUPS, CATEGORY_CONFIG } from '@/lib/categories';

export default function SiteHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      supabaseBrowser
        .from('user_profiles')
        .select('username')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setUsername(data.username);
        });
    } else {
      setUsername(null);
    }
  }, [user]);

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <>
      <div className="bg-[#FF6600] h-1" />
      <header className="bg-white border-b border-[#ddd]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-4">
          {/* ハンバーガー（スマホのみ） */}
          <button
            className="md:hidden shrink-0 flex flex-col gap-1 p-1"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="メニュー"
          >
            <span className="block w-5 h-0.5 bg-[#333]" />
            <span className="block w-5 h-0.5 bg-[#333]" />
            <span className="block w-5 h-0.5 bg-[#333]" />
          </button>

          <Link href="/" className="shrink-0 flex items-center gap-1">
            <span className="text-[#FF6600] font-bold text-xl leading-none">ペットプライス</span>
            <span className="text-[#666] text-base ml-1 hidden sm:inline">🐾 ペット</span>
          </Link>
          <form action="/search" className="flex-1 max-w-lg flex">
            <input
              name="q"
              placeholder="キーワード検索"
              className="flex-1 border border-[#ccc] border-r-0 px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
            />
            <button type="submit" className="bg-[#FF6600] text-white px-4 py-1.5 text-sm font-bold hover:bg-[#e55a00]">
              検索
            </button>
          </form>
          <div className="shrink-0 flex items-center gap-2 text-xs">
            {user ? (
              <>
                <span className="text-[#333] hidden sm:inline">ようこそ <span className="font-bold text-[#FF6600]">{username || user.email}さん</span></span>
                <Link href="/mypage" className="text-[#0058B3] hover:underline">マイページ</Link>
                <button onClick={handleSignOut} className="border border-[#ccc] px-2 py-1 hover:bg-[#f0f0f0]">ログアウト</button>
              </>
            ) : (
              <>
                <Link href="/login" className="border border-[#FF6600] text-[#FF6600] px-2 py-1 hover:bg-[#FFF5EE]">ログイン</Link>
                <Link href="/register" className="bg-[#FF6600] text-white px-2 py-1 hover:bg-[#e55a00]">会員登録</Link>
              </>
            )}
          </div>
        </div>
        <nav className="border-t border-[#eee] bg-[#f8f8f8]">
          <div className="max-w-5xl mx-auto px-3 flex gap-4 text-xs py-1 overflow-x-auto">
            <Link href="/" className="text-[#0058B3] hover:text-[#FF6600] whitespace-nowrap">トップ</Link>
            <Link href="/ranking" className="text-[#0058B3] hover:text-[#FF6600] font-bold whitespace-nowrap">🏆 ランキング</Link>
            <Link href="/community" className="text-[#0058B3] hover:text-[#FF6600] whitespace-nowrap">💬 コミュニティ</Link>
            <Link href="/compare" className="text-[#0058B3] hover:text-[#FF6600] whitespace-nowrap">⚖️ 比較</Link>
            <Link href="/column" className="text-[#0058B3] hover:text-[#FF6600] whitespace-nowrap">📝 コラム</Link>
            <Link href="/insurance" className="text-[#0058B3] hover:text-[#FF6600] whitespace-nowrap font-bold">🐾 保険比較</Link>
          </div>
        </nav>
      </header>

      {/* モバイルドロワーメニュー */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#FF6600] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold">カテゴリ一覧</span>
              <button onClick={() => setMenuOpen(false)} className="text-white text-lg font-bold">✕</button>
            </div>
            {/* ユーザー情報 */}
            <div className="px-4 py-3 border-b border-[#eee] bg-[#f8f8f8]">
              {user ? (
                <div className="space-y-1">
                  <p className="text-xs text-[#333]">ようこそ <span className="font-bold text-[#FF6600]">{username || user.email}さん</span></p>
                  <div className="flex gap-2">
                    <Link href="/mypage" onClick={() => setMenuOpen(false)} className="text-xs text-[#0058B3] hover:underline">マイページ</Link>
                    <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="text-xs text-[#666] hover:underline">ログアウト</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="text-xs border border-[#FF6600] text-[#FF6600] px-3 py-1">ログイン</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="text-xs bg-[#FF6600] text-white px-3 py-1">会員登録</Link>
                </div>
              )}
            </div>
            {/* ナビ */}
            <div className="px-4 py-2 border-b border-[#eee] flex flex-col gap-2 text-sm">
              {[
                { href: '/', label: 'トップ' },
                { href: '/ranking', label: '🏆 ランキング' },
                { href: '/community', label: '💬 コミュニティ' },
                { href: '/compare', label: '⚖️ 比較' },
                { href: '/column', label: '📝 コラム' },
                { href: '/insurance', label: '🐾 保険比較' },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="text-[#0058B3] hover:text-[#FF6600] font-bold">
                  {item.label}
                </Link>
              ))}
            </div>
            {/* カテゴリ */}
            {SIDEBAR_GROUPS.map((section) => (
              <div key={section.label}>
                <div className="bg-[#FF6600] text-white text-xs font-bold px-4 py-1.5">{section.label}</div>
                {section.subgroups.map((sub) => (
                  <div key={sub.label}>
                    <div className="bg-[#f5f5f5] text-[#666] text-xs px-4 py-1 border-t border-[#eee] font-bold">{sub.label}</div>
                    {sub.keys.map((key) => (
                      <Link key={key} href={`/${key}`} onClick={() => setMenuOpen(false)}
                        className="block px-6 py-1.5 text-xs text-[#0058B3] hover:text-[#FF6600] hover:bg-[#FFF5EE] border-t border-[#f0f0f0]">
                        {CATEGORY_CONFIG[key].label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
