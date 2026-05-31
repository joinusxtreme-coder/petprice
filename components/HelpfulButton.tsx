'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Props {
  reviewId: string;
}

export default function HelpfulButton({ reviewId }: Props) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 参考になった数を取得
    supabaseBrowser
      .from('review_helpful')
      .select('id', { count: 'exact' })
      .eq('review_id', reviewId)
      .then(({ count: c }) => setCount(c || 0));

    // 自分が投票済みか確認
    if (user) {
      supabaseBrowser
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setVoted(!!data));
    }
  }, [reviewId, user]);

  async function handleClick() {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (loading) return;
    setLoading(true);

    if (voted) {
      await supabaseBrowser
        .from('review_helpful')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);
      setCount((c) => c - 1);
      setVoted(false);
    } else {
      await supabaseBrowser.from('review_helpful').insert({
        review_id: reviewId,
        user_id: user.id,
      });
      setCount((c) => c + 1);
      setVoted(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs border px-3 py-1 transition-colors ${
        voted
          ? 'bg-[#FF6600] text-white border-[#FF6600]'
          : 'bg-white text-[#666] border-[#ddd] hover:border-[#FF6600] hover:text-[#FF6600]'
      }`}
    >
      👍 参考になった {count > 0 && <span className="font-bold">{count}</span>}
    </button>
  );
}
