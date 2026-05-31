'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  helpful_count: number;
  created_at: string;
  user_profiles: { username: string | null } | null;
}

interface Props {
  productId: string;
}

export default function UserReviewSection({ productId }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user]);

  async function fetchReviews() {
    setLoading(true);
    const { data } = await supabaseBrowser
      .from('user_reviews')
      .select('id, rating, title, body, helpful_count, created_at, user_profiles(username)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data as unknown as Review[]);
      if (user) {
        const { data: own } = await supabaseBrowser
          .from('user_reviews')
          .select('id')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .single();
        setHasReviewed(!!own);
      }
    }
    setLoading(false);
  }

  async function handleHelpful(reviewId: string) {
    if (!user) {
      alert('ログインが必要です');
      return;
    }
    await supabaseBrowser.from('review_helpful').insert({ user_id: user.id, review_id: reviewId });
    await supabaseBrowser
      .from('user_reviews')
      .update({ helpful_count: reviews.find(r => r.id === reviewId)!.helpful_count + 1 })
      .eq('id', reviewId);
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r));
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError('');
    const { error: err } = await supabaseBrowser.from('user_reviews').insert({
      user_id: user.id,
      product_id: productId,
      rating,
      title: title || null,
      body,
    });
    if (err) {
      setError(err.message);
    } else {
      setTitle('');
      setBody('');
      setRating(5);
      await fetchReviews();
    }
    setSubmitting(false);
  }

  return (
    <div className="bg-white border border-[#ddd]">
      <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
        <h2 className="text-sm font-bold text-[#333]">💬 ユーザーレビュー ({reviews.length}件)</h2>
      </div>
      <div className="p-3 space-y-3">
        {loading ? (
          <p className="text-xs text-[#999]">読み込み中...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-[#999]">まだレビューがありません。最初のレビューを投稿しましょう！</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border border-[#eee] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  {r.title && <span className="text-xs font-bold text-[#333]">{r.title}</span>}
                </div>
                <p className="text-xs text-[#555] leading-relaxed mb-2">{r.body}</p>
                <div className="flex items-center gap-4 text-xs text-[#999]">
                  <span>{r.user_profiles?.username || '匿名'}</span>
                  <span>{new Date(r.created_at).toLocaleDateString('ja-JP')}</span>
                  <button
                    onClick={() => handleHelpful(r.id)}
                    className="text-[#0058B3] hover:underline"
                  >
                    参考になった ({r.helpful_count})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review form */}
        <div className="border-t border-[#eee] pt-3">
          {!user ? (
            <p className="text-xs text-[#666]">
              レビューを書くには <Link href="/login" className="text-[#0058B3] hover:underline">ログイン</Link> が必要です
            </p>
          ) : hasReviewed ? (
            <p className="text-xs text-[#666]">この商品へのレビューは投稿済みです</p>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-[#333] mb-3">レビューを投稿する</h3>
              {error && (
                <p className="text-xs text-red-600 mb-2">{error}</p>
              )}
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="block text-xs text-[#666] mb-1">評価</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`text-xl ${s <= rating ? 'text-yellow-500' : 'text-[#ccc]'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">タイトル（任意）</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6600]"
                    placeholder="レビューのタイトル"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">本文 <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6600]"
                    placeholder="商品の使用感などを教えてください"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FF6600] text-white px-4 py-2 text-xs font-bold hover:bg-[#e55a00] disabled:opacity-50"
                >
                  {submitting ? '投稿中...' : 'レビューを投稿する'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
