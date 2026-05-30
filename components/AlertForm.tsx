'use client';

import { useState } from 'react';

interface AlertFormProps {
  productId: string;
  currentPrice: number;
}

export default function AlertForm({ productId, currentPrice }: AlertFormProps) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.9));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email, targetPrice }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow">
      <h3 className="font-bold text-[#2E4057] mb-3">🔔 価格アラート設定</h3>
      {status === 'success' ? (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
          ✅ 価格アラートを設定しました！目標価格を下回ったらメールでお知らせします。
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">目標価格（円）</label>
            <input
              type="number"
              required
              min={1}
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
            <p className="text-xs text-gray-400 mt-1">現在価格の90%: ¥{Math.floor(currentPrice * 0.9).toLocaleString()}</p>
          </div>
          {status === 'error' && (
            <p className="text-red-500 text-xs">エラーが発生しました。もう一度お試しください。</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[#2E4057] hover:bg-[#1e2d3d] text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? '設定中...' : 'アラートを設定する'}
          </button>
        </form>
      )}
    </div>
  );
}
