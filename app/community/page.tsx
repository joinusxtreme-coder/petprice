'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';
import SiteHeader from '@/components/SiteHeader';

interface Post {
  id: string;
  category: string;
  title: string;
  body: string;
  reply_count: number;
  created_at: string;
  user_profiles: { username: string | null } | null;
}

const CATEGORIES = ['すべて', '犬', '猫', '小動物', 'アクアリウム', '爬虫類・昆虫'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_MAP: Record<string, string> = {
  '犬': 'dog',
  '猫': 'cat',
  '小動物': 'small',
  'アクアリウム': 'aqua',
  '爬虫類・昆虫': 'reptile',
};

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<Category>('すべて');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('dog');
  const [formBody, setFormBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchPosts() {
    setLoading(true);
    let query = supabaseBrowser
      .from('forum_posts')
      .select('id, category, title, body, reply_count, created_at, user_profiles(username)')
      .order('created_at', { ascending: false });

    if (activeTab !== 'すべて') {
      query = query.eq('category', CATEGORY_MAP[activeTab]);
    }

    const { data } = await query;
    setPosts((data || []) as unknown as Post[]);
    setLoading(false);
  }

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabaseBrowser.from('forum_posts').insert({
      user_id: user.id,
      category: formCategory,
      title: formTitle,
      body: formBody,
    });
    if (!error) {
      setFormTitle('');
      setFormBody('');
      setShowForm(false);
      await fetchPosts();
    }
    setSubmitting(false);
  }

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = { dog: '犬', cat: '猫', small: '小動物', aqua: 'アクアリウム', reptile: '爬虫類・昆虫', general: '一般' };
    return map[cat] || cat;
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-3 py-4">
        <div className="bg-white border border-[#ddd] mb-3">
          <div className="bg-[#FF6600] text-white px-4 py-2 font-bold text-sm flex items-center justify-between">
            <span>コミュニティ掲示板</span>
            {user && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-white text-[#FF6600] px-3 py-1 text-xs font-bold hover:bg-[#FFF5EE]"
              >
                新規投稿する
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex border-b border-[#ddd] overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 text-xs font-bold border-r border-[#ddd] whitespace-nowrap ${
                  activeTab === cat ? 'bg-[#FFF5EE] text-[#FF6600]' : 'text-[#333] hover:bg-[#f8f8f8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* New post form */}
          {showForm && user && (
            <div className="border-b border-[#ddd] p-4 bg-[#f8f8f8]">
              <h3 className="text-xs font-bold text-[#333] mb-3">新規投稿</h3>
              <form onSubmit={handleSubmitPost} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#666] mb-1">タイトル <span className="text-red-500">*</span></label>
                    <input
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full border border-[#ccc] px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#666] mb-1">カテゴリ</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full border border-[#ccc] px-2 py-1.5 text-xs">
                      <option value="dog">犬</option>
                      <option value="cat">猫</option>
                      <option value="small">小動物</option>
                      <option value="aqua">アクアリウム</option>
                      <option value="reptile">爬虫類・昆虫</option>
                      <option value="general">一般</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">本文 <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    rows={4}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="bg-[#FF6600] text-white px-4 py-2 text-xs font-bold hover:bg-[#e55a00] disabled:opacity-50">
                    {submitting ? '投稿中...' : '投稿する'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="border border-[#ccc] px-4 py-2 text-xs hover:bg-[#f0f0f0]">キャンセル</button>
                </div>
              </form>
            </div>
          )}

          {/* Posts list */}
          {loading ? (
            <div className="p-4 text-xs text-[#999]">読み込み中...</div>
          ) : posts.length === 0 ? (
            <div className="p-4 text-xs text-[#999]">投稿がありません</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f8f8f8] border-b border-[#ddd]">
                  <th className="px-3 py-2 text-left font-bold text-[#555] w-16">カテゴリ</th>
                  <th className="px-3 py-2 text-left font-bold text-[#555]">タイトル</th>
                  <th className="px-3 py-2 text-left font-bold text-[#555] w-20">投稿者</th>
                  <th className="px-3 py-2 text-center font-bold text-[#555] w-12">返信</th>
                  <th className="px-3 py-2 text-left font-bold text-[#555] w-24">日付</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-[#eee] hover:bg-[#FFF5EE]">
                    <td className="px-3 py-2">
                      <span className="bg-[#e8f0f8] text-[#0058B3] px-1.5 py-0.5 text-xs font-bold">
                        {categoryLabel(post.category)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/community/${post.id}`} className="text-[#0058B3] hover:underline">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[#666]">{post.user_profiles?.username || '匿名'}</td>
                    <td className="px-3 py-2 text-center text-[#666]">{post.reply_count}</td>
                    <td className="px-3 py-2 text-[#999]">{new Date(post.created_at).toLocaleDateString('ja-JP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
