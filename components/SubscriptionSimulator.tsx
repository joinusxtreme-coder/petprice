'use client';

import { useState } from 'react';

interface Props {
  price: number;
  name: string;
}

export default function SubscriptionSimulator({ price, name }: Props) {
  const [qty, setQty] = useState(1);
  const [months, setMonths] = useState(3);

  const perMonth = price * qty;
  const total = perMonth * months;
  const points = Math.floor(total / 100);

  return (
    <div className="bg-white border border-[#ddd]">
      <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
        <h2 className="text-sm font-bold text-[#333]">📦 定期購入シミュレーター</h2>
      </div>
      <div className="p-3">
        <p className="text-xs text-[#666] mb-3">
          「{name.slice(0, 40)}{name.length > 40 ? '...' : ''}」をまとめ買いした場合のコスト
        </p>
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="text-xs font-bold text-[#555] block mb-1">月の購入数</label>
            <div className="flex items-center gap-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-7 h-7 border border-[#ccc] text-sm font-bold hover:bg-[#f0f0f0] flex items-center justify-center">−</button>
              <span className="w-10 text-center text-base font-bold text-[#333]">{qty}</span>
              <button onClick={() => setQty(Math.min(12, qty + 1))} className="w-7 h-7 border border-[#ccc] text-sm font-bold hover:bg-[#f0f0f0] flex items-center justify-center">＋</button>
              <span className="text-xs text-[#666] ml-1">袋/月</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[#555] block mb-1">継続期間</label>
            <div className="flex gap-1">
              {[1, 3, 6, 12].map((m) => (
                <button key={m} onClick={() => setMonths(m)} className={`px-2 py-1 text-xs border transition-colors ${months === m ? 'bg-[#FF6600] text-white border-[#FF6600] font-bold' : 'border-[#ccc] text-[#555] hover:border-[#FF6600]'}`}>
                  {m}ヶ月
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#FFF5EE] border border-[#FFD0A0] p-3 space-y-2">
          <div className="flex justify-between text-xs text-[#555]">
            <span>1袋の価格</span>
            <span className="font-bold">¥{price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-[#555]">
            <span>月あたり（{qty}袋）</span>
            <span className="font-bold">¥{perMonth.toLocaleString()}</span>
          </div>
          <div className="border-t border-[#FFD0A0] pt-2 flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#333]">{months}ヶ月合計</span>
            <span className="text-xl font-bold text-[#FF6600]">¥{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-[#E95000]">
            <span>楽天ポイント概算（1%）</span>
            <span className="font-bold">約 {points.toLocaleString()} pt</span>
          </div>
        </div>
        <p className="text-xs text-[#999] mt-2">※ 価格・ポイントは概算です。実際は楽天市場の商品ページをご確認ください。</p>
      </div>
    </div>
  );
}
