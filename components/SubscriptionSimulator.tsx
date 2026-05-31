'use client';

import { useState } from 'react';

interface Props {
  price: number;
  name: string;
}

export default function SubscriptionSimulator({ price, name }: Props) {
  const [frequency, setFrequency] = useState(1); // 月に何回
  const [bags, setBags] = useState(1); // 一度に何袋

  const monthlyQty = frequency * bags;
  const monthlyTotal = monthlyQty * price;
  const yearlyTotal = monthlyTotal * 12;

  // 定期購入割引（仮：楽天は定期便5〜15%引きが多い）
  const discountRate = 0.1;
  const yearlySavings = Math.floor(yearlyTotal * discountRate);

  return (
    <div className="bg-white border border-[#ddd]">
      <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
        <h3 className="text-sm font-bold text-[#333]">🔄 定期購入シミュレーター</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#666] mb-1">購入頻度（月）</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full border border-[#ccc] px-2 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
            >
              <option value={1}>月1回</option>
              <option value={2}>月2回</option>
              <option value={3}>月3回</option>
              <option value={0.5}>2ヶ月に1回</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1">一度に購入する数</label>
            <select
              value={bags}
              onChange={(e) => setBags(Number(e.target.value))}
              className="w-full border border-[#ccc] px-2 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}個</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#FFF5EE] border border-[#FFD0A0] p-3 rounded space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#666]">月々の費用</span>
            <span className="font-bold text-[#333]">¥{monthlyTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#666]">年間費用</span>
            <span className="font-bold text-[#333]">¥{yearlyTotal.toLocaleString()}</span>
          </div>
          <div className="border-t border-[#FFD0A0] pt-1.5 flex justify-between text-xs">
            <span className="text-green-700">定期便10%割引で年間節約</span>
            <span className="font-bold text-green-700">¥{yearlySavings.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-xs text-[#999] leading-relaxed">
          ※ 定期便割引率はショップにより異なります（通常5〜15%）。楽天市場の定期便サービスをご確認ください。
        </p>
      </div>
    </div>
  );
}
