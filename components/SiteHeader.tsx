'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function SiteHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

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

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <>
      <div className="bg-[#FF6600] h-1" />
      <header className="bg-white border-b border-[#ddd]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-1">
            <span className="text-[#FF6600] font-bold text-xl leading-none">ペットプライス</span>
            <span className="text-[#666] text-base ml-1">🐾 ペット</span>
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
                <span className="text-[#333]">ようこそ <span className="font-bold text-[#FF6600]">{username || user.email}さん</span></span>
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
          <div className="max-w-5xl mx-auto px-3 flex gap-4 text-xs py-1">
            <Link href="/" className="text-[#0058B3] hover:text-[#FF6600]">トップ</Link>
            <Link href="/ranking" className="text-[#0058B3] hover:text-[#FF6600] font-bold">🏆 ランキング</Link>
            <Link href="/community" className="text-[#0058B3] hover:text-[#FF6600]">💬 コミュニティ</Link>
            <Link href="/compare" className="text-[#0058B3] hover:text-[#FF6600]">⚖️ 比較</Link>
            <Link href="/column" className="text-[#0058B3] hover:text-[#FF6600]">📝 コラム</Link>
          </div>
        </nav>
      </header>
    </>
  );
}
