'use client';

import { useState, useEffect, use } from 'react';
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
  view_count: number;
  created_at: string;
  user_profiles: { username: string | null } | null;
}

interface Reply {
  id: string;
  body: string;
  created_at: string;
  user_profiles: { username: string | null } | null;
}

export default function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchPost() {
    setLoading(true);
    const { data: postData } = await supabaseBrowser
      .from('forum_posts')
      .select('id, category, title, body, reply_count, view_count, created_at, user_profiles(username)')
      .eq('id', id)
      .single();

    if (postData) {
      setPost(postData as unknown as Post);
      // Increment view count
      await supabaseBrowser
        .from('forum_posts')
        .update({ view_count: (postData.view_count || 0) + 1 })
        .eq('id', id);
    }

    const { data: replyData } = await supabaseBrowser
      .from('forum_replies')
      .select('id, body, created_at, user_profiles(username)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    setReplies((replyData || []) as unknown as Reply[]);
    setLoading(false);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !post) return;
    setSubmitting(true);
    const { error } = await supabaseBrowser.from('forum_replies').insert({
      post_id: id,
      user_id: user.id,
      body: replyBody,
    });
    if (!error) {
      await supabaseBrowser
        .from('forum_posts')
        .update({ reply_count: post.reply_count + 1 })
        .eq('id', id);
      setReplyBody('');
      await fetchPost();
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
        <div className="text-xs text-[#666] mb-2">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <Link href="/community" className="text-[#0058B3] hover:underline">コミュニティ</Link>
          {post && (
            <>
              <span className="mx-1">{'>'}</span>
              <span>{post.title.slice(0, 30)}</span>
            </>
          )}
        </div>

        {loading ? (
          <div className="bg-white border border-[#ddd] p-4 text-xs text-[#999]">読み込み中...</div>
        ) : !post ? (
          <div className="bg-white border border-[#ddd] p-4 text-xs text-[#999]">投稿が見つかりません</div>
        ) : (
          <>
            {/* Post */}
            <div className="bg-white border border-[#ddd] mb-3">
              <div className="bg-[#f8f8f8] border-b border-[#ddd] px-4 py-2 flex items-center gap-2">
                <span className="bg-[#e8f0f8] text-[#0058B3] px-1.5 py-0.5 text-xs font-bold">{categoryLabel(post.category)}</span>
                <h1 className="text-sm font-bold text-[#333] flex-1">{post.title}</h1>
              </div>
              <div className="p-4">
                <p className="text-xs text-[#555] leading-relaxed whitespace-pre-wrap">{post.body}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-[#999] border-t border-[#eee] pt-2">
                  <span>{post.user_profiles?.username || '匿名'}</span>
                  <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                  <span>閲覧: {post.view_count + 1}</span>
                  <span>返信: {post.reply_count}</span>
                </div>
              </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
              <div className="bg-white border border-[#ddd] mb-3">
                <div className="bg-[#f8f8f8] border-b border-[#ddd] px-4 py-2">
                  <h2 className="text-xs font-bold text-[#333]">返信 ({replies.length}件)</h2>
                </div>
                {replies.map((reply, i) => (
                  <div key={reply.id} className="p-3 border-b border-[#eee]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#0058B3]">#{i + 1}</span>
                      <span className="text-xs text-[#666]">{reply.user_profiles?.username || '匿名'}</span>
                      <span className="text-xs text-[#999]">{new Date(reply.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <p className="text-xs text-[#555] leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            <div className="bg-white border border-[#ddd]">
              <div className="bg-[#f8f8f8] border-b border-[#ddd] px-4 py-2">
                <h2 className="text-xs font-bold text-[#333]">返信する</h2>
              </div>
              <div className="p-4">
                {!user ? (
                  <p className="text-xs text-[#666]">
                    返信するには <Link href="/login" className="text-[#0058B3] hover:underline">ログイン</Link> が必要です
                  </p>
                ) : (
                  <form onSubmit={handleReply} className="space-y-3">
                    <textarea
                      required
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={4}
                      placeholder="返信内容を入力してください"
                      className="w-full border border-[#ccc] px-3 py-2 text-xs focus:outline-none focus:border-[#FF6600]"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#FF6600] text-white px-4 py-2 text-xs font-bold hover:bg-[#e55a00] disabled:opacity-50"
                    >
                      {submitting ? '投稿中...' : '返信を投稿する'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
