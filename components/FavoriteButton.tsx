'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface FavoriteList {
  id: string;
  name: string;
  emoji: string;
}

interface Props {
  productId: string;
}

export default function FavoriteButton({ productId }: Props) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<FavoriteList[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get total favorites count
    supabaseBrowser
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .then(({ count: c }) => setCount(c ?? 0));

    if (user) {
      // Check if user favorited
      supabaseBrowser
        .from('favorites')
        .select('id, list_id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setIsFavorited(!!data);
          setCurrentListId(data?.list_id ?? null);
        });

      // Fetch user's lists (graceful — table may not exist yet)
      supabaseBrowser
        .from('favorite_lists')
        .select('id, name, emoji')
        .eq('user_id', user.id)
        .order('created_at')
        .then(({ data }) => {
          if (data) setLists(data as FavoriteList[]);
        });
    }
  }, [productId, user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function addToList(listId: string | null) {
    if (!user) return;
    setLoading(true);
    setShowDropdown(false);
    if (isFavorited) {
      // Move to different list or same list (toggle off if same)
      if (currentListId === listId) {
        await supabaseBrowser
          .from('favorites')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);
        setIsFavorited(false);
        setCount((c) => c - 1);
        setCurrentListId(null);
      } else {
        await supabaseBrowser
          .from('favorites')
          .update({ list_id: listId })
          .eq('product_id', productId)
          .eq('user_id', user.id);
        setCurrentListId(listId);
      }
    } else {
      await supabaseBrowser
        .from('favorites')
        .insert({ product_id: productId, user_id: user.id, list_id: listId });
      setIsFavorited(true);
      setCount((c) => c + 1);
      setCurrentListId(listId);
    }
    setLoading(false);
  }

  async function handleClick() {
    if (!user) {
      alert('お気に入りにはログインが必要です');
      return;
    }
    if (lists.length > 0) {
      // Show list selector
      setShowDropdown((v) => !v);
    } else {
      // No lists — toggle directly (no list_id)
      await addToList(null);
    }
  }

  async function createAndAdd() {
    if (!user) return;
    const name = prompt('リスト名を入力してください', '新しいリスト');
    if (!name) return;
    setLoading(true);
    const { data } = await supabaseBrowser
      .from('favorite_lists')
      .insert({ user_id: user.id, name, emoji: '❤️' })
      .select()
      .single();
    if (data) {
      const newList = data as FavoriteList;
      setLists((prev) => [...prev, newList]);
      await addToList(newList.id);
    }
    setLoading(false);
  }

  const currentList = lists.find((l) => l.id === currentListId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-1 border border-[#ddd] px-3 py-1.5 text-xs hover:bg-[#FFF5EE] disabled:opacity-50"
      >
        <span>{isFavorited ? '❤️' : '🤍'}</span>
        <span>
          {isFavorited && currentList ? `${currentList.emoji} ${currentList.name}` : 'お気に入り'}
        </span>
        {count > 0 && <span className="text-[#999]">({count})</span>}
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#ddd] shadow-md z-50 min-w-[180px] text-xs">
          <div className="px-3 py-1.5 bg-[#f8f8f8] font-bold text-[#333] border-b border-[#eee]">リストに追加</div>
          {/* デフォルト（リストなし） */}
          <button
            onClick={() => addToList(null)}
            disabled={loading}
            className={`w-full text-left px-3 py-2 hover:bg-[#FFF5EE] flex items-center gap-2 disabled:opacity-50 ${currentListId === null && isFavorited ? 'bg-[#FFF5EE] font-bold' : ''}`}
          >
            <span>❤️</span>
            <span>メインのお気に入り</span>
            {currentListId === null && isFavorited && <span className="ml-auto text-[#FF6600]">✓</span>}
          </button>
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => addToList(list.id)}
              disabled={loading}
              className={`w-full text-left px-3 py-2 hover:bg-[#FFF5EE] flex items-center gap-2 disabled:opacity-50 ${currentListId === list.id ? 'bg-[#FFF5EE] font-bold' : ''}`}
            >
              <span>{list.emoji}</span>
              <span>{list.name}</span>
              {currentListId === list.id && <span className="ml-auto text-[#FF6600]">✓</span>}
            </button>
          ))}
          <button
            onClick={createAndAdd}
            disabled={loading}
            className="w-full text-left px-3 py-2 hover:bg-[#FFF5EE] flex items-center gap-2 border-t border-[#eee] text-[#0058B3] disabled:opacity-50"
          >
            <span>＋</span>
            <span>新しいリストを作成</span>
          </button>
        </div>
      )}
    </div>
  );
}
