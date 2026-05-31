'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signUp(email, password, username);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.push('/mypage');
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <div className="bg-[#FF6600] h-1" />
      <header className="bg-white border-b border-[#ddd]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-1">
            <span className="text-[#FF6600] font-bold text-xl leading-none">ペットプライス</span>
            <span className="text-[#666] text-base ml-1">🐾 ペット</span>
          </Link>
        </div>
      </header>
      <div className="max-w-md mx-auto px-3 py-10">
        <div className="bg-white border border-[#ddd]">
          <div className="bg-[#FF6600] text-white px-4 py-3 font-bold text-sm">新規会員登録</div>
          <div className="p-6">
            {/* Googleで登録 */}
            <button
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 border border-[#ddd] py-2.5 text-sm font-bold text-[#333] hover:bg-[#f5f5f5] transition-colors mb-4"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Googleで登録（ワンクリック）
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-[#eee]" />
              <span className="text-xs text-[#999]">またはメールで登録</span>
              <div className="flex-1 border-t border-[#eee]" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-xs px-3 py-2 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">ユーザー名</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-[#FF6600]"
                  placeholder="ニックネーム"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">メールアドレス</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-[#FF6600]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">パスワード</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-[#FF6600]"
                  placeholder="6文字以上"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6600] text-white py-2 text-sm font-bold hover:bg-[#e55a00] disabled:opacity-50"
              >
                {loading ? '登録中...' : '会員登録する'}
              </button>
            </form>
            <div className="mt-4 text-center text-xs text-[#666]">
              すでにアカウントをお持ちの方は{' '}
              <Link href="/login" className="text-[#0058B3] hover:underline">ログイン</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
