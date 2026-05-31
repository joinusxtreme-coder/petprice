'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Props {
  productId: string;
}

export default function FavoriteButton({ productId }: Props) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get total favorites count
    supabaseBrowser
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .then(({ count: c }) => setCount(c ?? 0));

    // Check if user favorited
    if (user) {
      supabaseBrowser
        .from('favorites')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setIsFavorited(!!data));
    }
  }, [productId, user]);

  async function handleClick() {
    if (!user) {
      alert('お気に入りにはログインが必要です');
      return;
    }
    setLoading(true);
    if (isFavorited) {
      await supabaseBrowser
        .from('favorites')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);
      setIsFavorited(false);
      setCount((c) => c - 1);
    } else {
      await supabaseBrowser
        .from('favorites')
        .insert({ product_id: productId, user_id: user.id });
      setIsFavorited(true);
      setCount((c) => c + 1);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 border border-[#ddd] px-3 py-1.5 text-xs hover:bg-[#FFF5EE] disabled:opacity-50"
    >
      <span>{isFavorited ? '❤️' : '🤍'}</span>
      <span>お気に入り</span>
      {count > 0 && <span className="text-[#999]">({count})</span>}
    </button>
  );
}
