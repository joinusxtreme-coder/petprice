'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface AlertFormProps {
  productId: string;
  currentPrice: number;
}

interface Alert {
  id: string;
  target_price: number;
  is_active: boolean;
}

export default function AlertForm({ productId, currentPrice }: AlertFormProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.9));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (user) {
      supabaseBrowser
        .from('price_alerts')
        .select('id, target_price, is_active')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .then(({ data }) => setAlerts(data || []));
    }
  }, [user, productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      if (user) {
        // Logged in: save with user_id
        const { error } = await supabaseBrowser.from('price_alerts').insert({
          user_id: user.id,
          product_id: productId,
          target_price: targetPrice,
        });
        if (error) throw error;
        const { data } = await supabaseBrowser
          .from('price_alerts')
          .select('id, target_price, is_active')
          .eq('user_id', user.id)
          .eq('product_id', productId);
        setAlerts(data || []);
      } else {
        // Not logged in: use API with email
        const res = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, email, targetPrice }),
        });
        if (!res.ok) throw new Error();
        setEmail('');
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  async function handleDeleteAlert(alertId: string) {
    await supabaseBrowser.from('price_alerts').delete().eq('id', alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }

  return (
    <div className="space-y-3">
      {user && alerts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#333] mb-2">設定中のアラート</p>
          {alerts.map((a) => (
            <div key={a.id} className="flex items-center justify-between border border-[#eee] px-3 py-2 text-xs mb-1">
              <span>目標価格: <strong className="text-[#FF6600]">¥{a.target_price.toLocaleString()}</strong></span>
              <button
                onClick={() => handleDeleteAlert(a.id)}
                className="text-red-500 hover:underline"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 text-xs">
          ✅ 価格アラートを設定しました！目標価格を下回ったらメールでお知らせします。
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {!user && (
            <div>
              <label className="block text-xs text-[#666] mb-1">メールアドレス</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-[#ccc] px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-[#666] mb-1">目標価格（円）</label>
            <input
              type="number"
              required
              min={1}
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full border border-[#ccc] px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6600]"
            />
            <p className="text-xs text-[#999] mt-1">現在価格の90%: ¥{Math.floor(currentPrice * 0.9).toLocaleString()}</p>
          </div>
          {status === 'error' && (
            <p className="text-red-500 text-xs">エラーが発生しました。もう一度お試しください。</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[#FF6600] text-white py-2 text-xs font-bold hover:bg-[#e55a00] disabled:opacity-50"
          >
            {status === 'loading' ? '設定中...' : 'アラートを設定する'}
          </button>
        </form>
      )}
    </div>
  );
}
